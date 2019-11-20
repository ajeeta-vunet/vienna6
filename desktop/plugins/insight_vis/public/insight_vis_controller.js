import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { getImages } from 'ui/utils/vunet_image_utils.js';

const chrome = require('ui/chrome');
const _ = require('lodash');

// get the insight_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/insight_vis', ['kibana']);

module.controller('insightVisController', function ($scope, Private, Notifier, $http, $rootScope,
  timefilter, StateService) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();


  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    // If user hasn't configured bmv and insights yet, return
    if(!$scope.vis.params.bmv && !$scope.vis.params.insights) {
      return;
    }

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    const bmv = $scope.vis.params.bmv;
    const insights = $scope.vis.params.insights;
    const body = {
      request_type: 'insight',
      bmv: bmv || [],
      insights: insights || [],
      esFilter: esFilter,
    };

    // Get the selected time duration from time filter
    const timeDuration = timefilter.getBounds();
    const timeDurationStart = timeDuration.min.valueOf();
    const timeDurationEnd = timeDuration.max.valueOf();

    body.time = {
      'gte': timeDurationStart,
      'lte': timeDurationEnd
    };

    // Get the updated iconDict with uploaded images.
    // make API call after iconDict has been populated.
    getImages(StateService).then(function (iconDict) {

      const httpResult = $http.post(urlBase + '/insights/', body)
        .then(resp => resp.data)
        .catch(resp => { throw resp.data; });

      // Perform operation after getting response.
      httpResult.then(function (resp) {
        $scope.insightAvailableFlag = false;
        _.each(resp.insights, (insight) => {
          insight.image = iconDict[insight.group];
          if (insight.data.text) {
            $scope.insightAvailableFlag = true;
          }
        });
        $scope.data = resp.insights;
      });
    });
  };

  // This is bad, there should be a single event that triggers a refresh of data.
  // When there is a change in business metric vis configuration
  $scope.$watchMulti(['vis.params.insights', 'vis.params.bmv'], $scope.search);

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);
});
