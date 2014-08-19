define(function (require) {
  require('modules')
  .get('kibana/directive')
  .directive('visualize', function (Notifier, SavedVis, indexPatterns, Private) {
    var vislib = require('components/vislib/index');
    var $ = require('jquery');
    var _ = require('lodash');
    var visTypes = Private(require('components/vis_types/index'));
    var buildChartData = Private(require('components/visualize/_build_chart_data'));

    var notify = new Notifier({
      location: 'Visualize'
    });

    return {
      restrict: 'E',
      scope : {
        vis: '=',
        esResp: '=?',
        searchSource: '=?'
      },
      template: require('text!components/visualize/visualize.html'),
      link: function ($scope, $el, attr) {
        var chart; // set in "vis" watcher
        var $visualize = $el.find('.visualize-chart');
        var $spy = $el.find('visualize-spy');

        $scope.spyMode = false;
        $scope.onlyShowSpy = false;

        var applyClassNames = function () {
          // external
          $el.toggleClass('only-visualization', !$scope.spyMode);
          $el.toggleClass('visualization-and-spy', $scope.spyMode && !$scope.onlyShowSpy);
          $el.toggleClass('only-spy', Boolean($scope.onlyShowSpy));

          $spy.toggleClass('only', Boolean($scope.onlyShowSpy));

          // internal
          $visualize.toggleClass('spy-visible', Boolean($scope.spyMode));
          $visualize.toggleClass('spy-only', Boolean($scope.onlyShowSpy));
        };

        var calcResponsiveStuff = function () {
          $scope.onlyShowSpy = $scope.spyMode && $el.height() < 550;
        };

        // we need to wait for two watchers to fire
        // before we are "ready", this manages that
        var prereq = (function () {

          var fns = [];

          return function register(fn) {
            fns.push(fn);

            return function () {
              fn.apply(this, arguments);

              if (fns.length) {
                _.pull(fns, fn);
                if (!fns.length) {
                  $scope.$root.$broadcast('ready:vis');
                }
              }
            };
          };
        }());

        // provide a setter to the visualize-spy directive
        $scope.$on('change:spyMode', function (event, newMode) {
          calcResponsiveStuff();
        });

        $scope.$watch('vis', prereq(function (vis, prevVis) {
          if (prevVis && vis !== prevVis && prevVis.destroy) prevVis.destroy();
          if (chart) {
            _.forOwn(prevVis.type.listeners, function (listener, event) {
              chart.off(event, listener);
            });
            chart.destroy();
          }

          if (!vis) return;

          if (vis.error) {
            $visualize.html(
              '<div class="visualize-error"><i class="fa fa-exclamation-triangle"></i><br>' + vis.error + '</div>'
            );
            return;
          }

          var vislibParams = _.assign(
            {},
            vis.type.vislibParams,
            {
              type: vis.type.name,
            }
          );

          chart = new vislib.Chart($visualize[0], vislibParams);

          // For each type of interaction, assign the the handler if the vis object has it
          // otherwise use the typeDef, otherwise, do nothing.
          _.each(vis.type.listeners, function (listener, event) {
            chart.on(event, listener);
          });
        }));

        $scope.$watch('searchSource', prereq(function (searchSource) {
          if (!searchSource) return;

          // TODO: we need to have some way to clean up result requests
          searchSource.onResults().then(function onResults(resp) {
            if ($scope.searchSource !== searchSource) return;

            $scope.esResp = resp;

            return searchSource.onResults().then(onResults);
          }).catch(notify.fatal);

          searchSource.onError(notify.error).catch(notify.fatal);
        }));

        $scope.$watch('esResp', prereq(function (resp, prevResp) {
          if (!resp) return;

          $scope.chartData = buildChartData($scope.vis, resp);
        }));

        $scope.$watch('chartData', function (chartData) {
          applyClassNames();

          if (chart && chartData && !$scope.onlyShowSpy) {
            notify.event('call chart render', function () {
              chart.render(chartData);
            });
          }
        });

        $scope.$on('resize', function () {
          var old;
          (function waitForAnim() {
            var cur = $el.width() + ':' + $el.height();
            if (cur !== old) {
              old = cur;
              // resize can sometimes be called before animations on the element are complete.
              // check each 50ms if the animations are complete and then render when they are
              return setTimeout(waitForAnim, 200);
            }

            calcResponsiveStuff();
            applyClassNames();

            // chart reference changes over time, don't bind to a specific chart object.
            if (chart) chart.resize();
          }());
        });

        $scope.$on('$destroy', function () {
          if (chart) {
            _.forOwn($scope.vis.type.listeners, function (listener, event) {
              chart.off(event, listener);
            });
            chart.destroy();
          }
        });
      }
    };
  });
});