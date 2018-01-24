import _ from 'lodash';
import moment from 'moment';
import { SimpleEmitter } from 'ui/utils/simple_emitter';
import { uiModules } from 'ui/modules';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import vis from 'vis';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
const module = uiModules.get('kibana/uvmap_vis', ['kibana']);
module.controller('UVMapVisController', function ($scope, Private, Notifier, $http, $rootScope, timefilter, kbnUrl) {
  const dashboardContext = Private(dashboardContextProvider);
  const queryFilter = Private(FilterBarQueryFilterProvider);
    const notify = new Notifier({
      location: 'UVMapVis'
    });

    $scope.search = function run() {
      const expression = $scope.vis.params.expression;
      const connection = $scope.vis.params.connection;
      const colorSchema = $scope.vis.params.colorSchema || [];

      // If both expression and connection doesn't have anything, we don't have
      // anything to do..
      if (!expression && !connection) return;

      // As we want to display one single metric, we choose the interval as
      // current time selection + 1 second. This will make sure that ES always
      // returns one single metric.
      const timeDuration = timefilter.getBounds();
      const duration = moment.duration(timeDuration.max.diff(timeDuration.min));
      const timeDurationSeconds = Math.round(duration.asSeconds()) + 1;
      const timeInterval = timeDurationSeconds + 's';
      // Invoke the backend URL with all the details..
    const httpResult = $http.post('../api/uvmap_vis/run', {
      sheet: [expression],
      connection: [connection],
      colorSchema: colorSchema,
      extended: {
        es: {
          filter: dashboardContext
        }
      },
      time: _.extend(timefilter.time, {
            interval: timeInterval
      }),
    })
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });

    httpResult
    .then(function (resp) {
        $scope.data = resp.data;
    })
    .catch(function (resp) {
      $scope.data = [];
      var err = new Error(resp.message);
      err.stack = resp.stack;
      notify.error(err);
    });
  };

    // Function to be called when a node is selected
    $scope.onNodeSelect = function(params) {
      if (params.nodes[0] in $scope.data.node_dashboard_dict) {
        var dashboard = '/dashboard/' + $scope.data.node_dashboard_dict[params.nodes[0]];
        kbnUrl.redirect(dashboard);
      }
    };

    // This is bad, there should be a single event that triggers a refresh of data.

    // When the expression updates
    $scope.$watchMulti(['vis.params.expression', 'vis.params.connection', 'vis.params.interval', 'vis.params.colorSchema',], $scope.search);

    // When the time filter changes
    $scope.$listen(timefilter, 'fetch', $scope.search);

    // When a filter is added to the filter bar?
    $scope.$listen(queryFilter, 'fetch', $scope.search);

    // When auto refresh happens
    $scope.$on('courier:searchRefresh', $scope.search);

    $scope.$on('fetch', $scope.search);

  });
