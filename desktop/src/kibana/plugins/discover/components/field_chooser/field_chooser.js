define(function (require) {
  var app = require('modules').get('apps/discover');

  require('directives/css_truncate');
  require('directives/field_name');
  require('filters/unique');
  require('plugins/discover/components/field_chooser/discover_field');

  app.directive('discFieldChooser', function ($location, globalState, config, $route, Private) {
    var _ = require('lodash');
    var rison = require('utils/rison');
    var fieldCalculator = require('plugins/discover/components/field_chooser/lib/field_calculator');
    var Field = Private(require('components/index_patterns/_field'));

    return {
      restrict: 'E',
      scope: {
        columns: '=',
        hits: '=',
        fieldCounts: '=',
        state: '=',
        indexPattern: '=',
        indexPatternList: '=',
        updateFilterInQuery: '=filter'
      },
      template: require('text!plugins/discover/components/field_chooser/field_chooser.html'),
      link: function ($scope) {
        $scope.setIndexPattern = function (indexPattern) {
          $scope.state.index = indexPattern;
          $scope.state.save();
          $route.reload();
        };

        var filter = $scope.filter = {
          props: [
            'type',
            'indexed',
            'analyzed',
            'missing',
            'name'
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
          isFieldSelected: function (field) {
            return field.display;
          },
          isFieldFiltered: function (field) {
            var matchFilter = (filter.vals.type == null || field.type === filter.vals.type);
            var isAnalyzed = (filter.vals.analyzed == null || field.analyzed === filter.vals.analyzed);
            var isIndexed = (filter.vals.indexed == null || field.indexed === filter.vals.indexed);
            var scritpedOrMissing = (!filter.vals.missing || field.scripted || field.rowCount > 0);
            var matchName = (!filter.vals.name || field.name.indexOf(filter.vals.name) !== -1);

            return !field.display
              && matchFilter
              && isAnalyzed
              && isIndexed
              && scritpedOrMissing
              && matchName
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

        $scope.$watchCollection('filter.vals', function () {
          filter.active = filter.getActive();
        });

        $scope.toggle = function (fieldName) {
          $scope.increaseFieldCounter(fieldName);
          _.toggleInOut($scope.columns, fieldName);
        };

        $scope.$watchMulti([
          '[]fieldCounts',
          '[]columns',
          '[]hits'
        ], function () {
          var fields = getFields();
          if (!fields || !$scope.columns) return;

          $scope.fields = fields;

          // group the fields into popular and up-popular lists
          _(fields)
          .sortBy(function (field) {
            return (field.count || 0) * -1;
          })
          .groupBy(function (field) {
            if (field.display) return 'selected';
            return field.count > 0 ? 'popular' : 'unpopular';
          })
          .tap(function (groups) {
            groups.selected = _.sortBy(groups.selected || [], 'displayOrder');

            groups.popular = groups.popular || [];
            groups.unpopular = groups.unpopular || [];

            // move excess popular fields to un-popular list
            var extras = groups.popular.splice(config.get('fields:popularLimit'));
            groups.unpopular = extras.concat(groups.unpopular);
          })
          .each(function (group, name) {
            $scope[name + 'Fields'] = _.sortBy(group, name === 'selected' ? 'display' : 'name');
          });

          // include undefined so the user can clear the filter
          $scope.fieldTypes = _.union([undefined], _.pluck(fields, 'type'));
        });

        $scope.increaseFieldCounter = function (fieldName) {
          $scope.indexPattern.popularizeField(fieldName, 1);
        };

        $scope.runAgg = function (field) {
          var agg = {};
          var isGeoPoint = field.type === 'geo_point';
          var type = isGeoPoint ? 'tile_map' : 'histogram';
          // If we're visualizing a date field, and our index is time based (and thus has a time filter),
          // then run a date histogram
          if (field.type === 'date' && $scope.indexPattern.timeFieldName === field.name) {
            agg = {
              type: 'date_histogram',
              schema: 'segment',
              params: {
                field: field.name,
                interval: 'auto'
              }
            };

          } else if (isGeoPoint) {
            agg = {
              type: 'geohash_grid',
              schema: 'segment',
              params: {
                field: field.name,
                precision: 3
              }
            };
          } else {
            agg = {
              type: 'terms',
              schema: 'segment',
              params: {
                field: field.name,
                size: config.get('discover:aggs:terms:size', 20),
                orderBy: '2'
              }
            };
          }

          $location.path('/visualize/create').search({
            indexPattern: $scope.state.index,
            type: type,
            _a: rison.encode({
              filters: $scope.state.filters || [],
              query: $scope.state.query || undefined,
              vis: {
                type: type,
                aggs: [
                  agg,
                  {schema: 'metric', type: 'count', 'id': '2'}
                ]
              }
            })
          });
        };

        $scope.details = function (field, recompute) {
          if (_.isUndefined(field.details) || recompute) {
            field.details = fieldCalculator.getFieldValueCounts({
              hits: $scope.hits,
              field: field,
              count: 5,
              grouped: false
            });
            _.each(field.details.buckets, function (bucket) {
              bucket.display = field.format.convert(bucket.value);
            });
            $scope.increaseFieldCounter(field, 1);
          } else {
            delete field.details;
          }
        };

        function getFields() {
          var prevFields = $scope.fields;
          var indexPattern = $scope.indexPattern;
          var hits = $scope.hits;
          var fieldCounts = $scope.fieldCounts;

          if (!indexPattern || !hits || !fieldCounts) return;

          var fieldNames = _.keys(fieldCounts);
          var ipFieldNames = _.keys(indexPattern.fields.byName);
          var unknownFieldNames = _.difference(fieldNames, ipFieldNames);
          var unknownFields = unknownFieldNames.map(function (name) {
            return new Field(indexPattern, {
              name: name,
              type: 'unknown'
            });
          });

          return [].concat(indexPattern.fields.raw, unknownFields).map(function (f) {
            // clone the field with Object.create so that
            // we can edit it without leaking our changes
            // and so non-enumerable props/getters are
            // preserved
            var field = Object.create(f);

            field.displayOrder = _.indexOf($scope.columns, field.name) + 1;
            field.display = !!field.displayOrder;
            field.rowCount = $scope.fieldCounts[field.name];

            var prev = _.find(prevFields, { name: field.name });
            field.details = _.get(prev, 'details');

            return field;
          });
        }
      }
    };
  });
});
