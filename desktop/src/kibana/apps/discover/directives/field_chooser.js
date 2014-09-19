define(function (require) {
  var app = require('modules').get('apps/discover');
  var html = require('text!apps/discover/partials/field_chooser.html');
  var _ = require('lodash');
  var jsonPath = require('jsonpath');
  var rison = require('utils/rison');
  var qs = require('utils/query_string');

  require('directives/css_truncate');
  require('directives/field_name');
  require('filters/unique');
  require('apps/discover/directives/discover_field');



  app.directive('discFieldChooser', function ($location, globalState, config) {
    return {
      restrict: 'E',
      scope: {
        fields: '=',
        toggle: '=',
        data: '=',
        state: '=',
        searchSource: '=',
        updateFilterInQuery: '=filter'
      },
      template: html,
      controller: function ($scope) {

        var filter = $scope.filter = {
          props: [
            'type',
            'indexed',
            'analyzed',
            'missing'
          ],
          defaults: {
            missing: true
          },
          boolOpts: [
            {label: 'any', value: undefined },
            {label: 'yes', value: true },
            {label: 'no', value: false }
          ],
          toggleVal: function (name, def) {
            if (filter.vals[name] !== def) filter.vals[name] = def;
            else filter.vals[name] = undefined;
          },
          reset: function () {
            filter.vals = _.clone(filter.defaults);
          },
          isFieldFiltered: function (field) {
            return !field.display
              && (filter.vals.type == null || field.type === filter.vals.type)
              && (filter.vals.analyzed == null || field.analyzed === filter.vals.analyzed)
              && (filter.vals.indexed == null || field.indexed === filter.vals.indexed)
              && (!filter.vals.missing || field.rowCount > 0)
              && (!filter.vals.name || field.name.indexOf(filter.vals.name) !== -1)
            ;
          },
          popularity: function (field) {
            return field.count > 0;
          },
          getActive: function () {
            return _.some(filter.props, function (prop) {
              return filter.vals[prop] !== filter.defaults[prop];
            });
          }
        };

        // set the initial values to the defaults
        filter.reset();

        $scope.$watchCollection('filter.vals', function (newFieldFilters) {
          filter.active = filter.getActive();
        });

        $scope.$watch('fields', function (newFields) {

          // Find the top N most popular fields
          $scope.popularFields = _(newFields)
          .where(function (field) {
            return field.count > 0;
          })
          .sortBy('count')
          .reverse()
          .slice(0, config.get('fields:popularLimit'))
          .sortBy('name')
          .value();

          // Find the top N most popular fields
          $scope.unpopularFields = _.sortBy(_.sortBy(newFields, 'count')
            .reverse()
            .slice($scope.popularFields.length), 'name');

          $scope.fieldTypes = _.unique(_.pluck(newFields, 'type'));
          // push undefined so the user can clear the filter
          $scope.fieldTypes.unshift(undefined);
        });

        $scope.$watch('data', function () {
          _.each($scope.fields, function (field) {
            if (field.details) {
              $scope.details(field, true);
            }
          });
        });

        $scope.increaseFieldCounter = function (field) {
          var indexPattern = $scope.searchSource.get('index');
          indexPattern.popularizeField(field.name, 1);
          field.count++;
        };

        $scope.runAgg = function (field) {
          var agg = {};
          // If we're visualizing a date field, and our index is time based (and thus has a time filter),
          // then run a date histogram
          if (field.type === 'date' && $scope.searchSource.get('index').timeFieldName) {
            agg = {
              type: 'date_histogram',
              schema: 'segment',
              params: {
                field: field.name,
                interval: 'auto'
              }
            };
          } else {
            agg = {
              type: 'terms',
              schema: 'segment',
              params: {
                field: field.name,
                size: config.get('discover:aggs:terms:size', 20)
              }
            };
          }

          $location.path('/visualize/create').search({
            //(query:(query_string:(query:'*')),vis:(aggs:!((params:(field:'@tags',order:desc,size:5)
            indexPattern: $scope.state.index,
            type: 'histogram',
            _a: rison.encode({
              query: $scope.state.query || undefined,
              vis: {
                aggs: [
                  agg,
                  {schema: 'metric', type: 'count'}
                ]
              },
              metric: [{
                agg: 'count',
              }],
              segment: [agg],
              group: [],
              split: [],
            }),
            _g: globalState.toRISON()
          });
        };

        $scope.details = function (field, recompute) {
          if (_.isUndefined(field.details) || recompute) {
            field.details = getFieldValueCounts({
              data: $scope.data,
              field: field,
              count: 5,
              grouped: false
            });
            $scope.increaseFieldCounter(field, 1);
          } else {
            delete field.details;
          }
        };

        var getFieldValues = function (data, field) {
          var name = field.name;
          var normalize = field.format && field.format.normalize;

          return _.map(data, function (row) {
            var val;

            val = _.isUndefined(row._source[name]) ? row[name] : row._source[name];

            // for fields that come back in weird formats like geo_point
            if (val != null && normalize) val = normalize(val);

            return val;
          });
        };

        var getFieldValueCounts = function (params) {
          params = _.defaults(params, {
            count: 5,
            grouped: false
          });

          if (
            params.field.type === 'geo_point'
            || params.field.type === 'geo_shape'
            || params.field.type === 'attachment'
          ) {
            return { error: 'Analysis is not available for geo fields.' };
          }

          var allValues = getFieldValues(params.data, params.field),
            groups = {},
            hasArrays = false,
            exists = 0,
            missing = 0,
            counts;

          var value, k;
          for (var i = 0; i < allValues.length; ++i) {

            value = allValues[i];
            if (_.isUndefined(value)) {
              missing++;
            }

            if (_.isArray(value)) {
              hasArrays = true;
            }
            else if (_.isObject(value)) {
              return { error: 'Analysis is not available for object fields' };
            }

            if (_.isArray(value) && !params.grouped) {
              k = value;
            } else {
              k = _.isUndefined(value) ? '' : [value.toString()];
            }

            /* jshint -W083 */
            _.each(k, function (key) {
              if (_.has(groups, key)) {
                groups[key].count++;
              } else {
                groups[key] = {
                  value: (params.grouped ? value : key),
                  count: 1
                };
              }
            });
          }

          counts = _.map(
            _.sortBy(groups, 'count').reverse().slice(0, params.count),
            function (bucket) {
              return {
                value: bucket.value,
                count: bucket.count,
                percent: (bucket.count / (params.data.length - missing) * 100).toFixed(1)
              };
            });

          if (params.data.length - missing === 0) {
            return {error: 'This is field is present in your elasticsearch mapping,' +
              ' but not in any documents in the search results. You may still be able to visualize or search on it'};
          }

          return {
            total: params.data.length,
            exists: params.data.length - missing,
            missing: missing,
            buckets: counts,
            hasArrays : hasArrays,
          };
        };


      }
    };
  });
});
