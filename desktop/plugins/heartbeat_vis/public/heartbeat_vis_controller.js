import { uiModules } from 'ui/modules';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';

const module = uiModules.get('kibana/heartbeat_vis', ['kibana', 'kibana/courier']);
module.controller('HeartbeatVisController', function ($scope, Private, Notifier, $http, $rootScope, timefilter) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);
  $scope.full_path = true;
  const notify = new Notifier({
    location: 'HeartbeatVis'
  });

  // To pass node placement type to the vis-map directive.
  $scope.nodePlacementType = 'dragNDrop';

  $scope.search = function run() {

    /* If we are here, we reset full-path to true */
    $scope.full_path = true;
    const indexVal = $scope.vis.params.index;
    const filterVal = $scope.vis.params.filter;
    const typeVal = $scope.vis.params.type;
    const colorSchema = $scope.vis.params.colorSchema;
    $scope.typeVal = typeVal;

    // Checking whether user entered the index and type
    // values or not, if not it will return
    if (!indexVal || !typeVal) return;

    const timeDuration = timefilter.getBounds();
    $scope.time_duration_start = timeDuration.min.valueOf();
    $scope.time_duration_end = timeDuration.max.valueOf();

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    const httpResult = $http.post('../api/heartbeat_vis/run', {
      indexVal: indexVal,
      filterVal: filterVal,
      typeVal: typeVal,
      colorSchema: colorSchema,
      extended: {
        es: {
          filter: esFilter
        }
      },
      time: { 'gte': $scope.time_duration_start, 'lte': $scope.time_duration_end }
    })
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    httpResult
      .then(function (resp) {
        $scope.data = resp.data;
      })
      .catch(function (resp) {
        $scope.data = [];
        const err = new Error(resp.message);
        err.stack = resp.stack;
        notify.error(err);
      });
  };
  // This is bad, there should be a single event that triggers a refresh of data.

  // When the expression updates
  $scope.$watchMulti(['vis.params.index', 'vis.params.type', 'vis.params.colorSchema'], $scope.search);

  // This function is called when a user click on the link when full-path is
  // displayed, this fetch the hop-by-hop details for a specific
  // source-destination pair
  $scope.onLinkSelect = function (sourceAddr, destAddr) {
    if (!$scope.full_path) {
      return;
    }
    $scope.source = sourceAddr;
    $scope.destination = destAddr;
    $scope.full_path = false;
    $scope.fetch_hop();
  };

  // This function is called to fetch hop-by-hop information for a specific
  // source and destination pair. It sends a request to the backend nodeJs
  // using a URL and wait for the response. Once the response comes, it
  // populates the data to visulize the output in vis canvas
  $scope.fetch_hop = function () {

    const colorSchema = $scope.vis.params.colorSchema;
    const indexVal = $scope.vis.params.index;
    const typeVal = $scope.vis.params.type;
    const filterVal = $scope.vis.params.filter;
    const httpResult = $http.post('../api/tracepath_vis_hop/run', {
      source: $scope.source,
      destination: $scope.destination,
      colorSchema: colorSchema,
      indexVal: indexVal,
      filterVal: filterVal,
      typeVal: typeVal,
      extended: {
        es: {
          filter: dashboardContext()
        }
      },
      time: { 'gte': $scope.time_duration_start, 'lte': $scope.time_duration_end }
    })
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    httpResult
      .then(function (resp) {
        $scope.data = resp.data;
      })
      .catch(function (resp) {
        $scope.data = [];
        const err = new Error(resp.message);
        err.stack = resp.stack;
        notify.error(err);
      });

  };

  /*
     * This function is a stop-gap arrangement to make sure that we invoke the
     * right function to refresh the page. This is to make sure that we don't
     * take user to the full-path page when time drill down happens.
     */
  $scope.searchContext = function () {
    if ($scope.full_path) {
      $scope.search();
    } else {
      const timeDuration = timefilter.getBounds();
      $scope.time_duration_start = timeDuration.min.valueOf();
      $scope.time_duration_end = timeDuration.max.valueOf();
      $scope.fetch_hop();
    }
  };

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.searchContext);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.searchContext);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.searchContext);

  $scope.$on('fetch', $scope.searchContext);

});
