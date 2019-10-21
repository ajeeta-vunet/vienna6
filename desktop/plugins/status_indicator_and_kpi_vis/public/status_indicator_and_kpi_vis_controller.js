const _ = require('lodash');
const chrome = require('ui/chrome');

import { uiModules } from 'ui/modules';

import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { viewDashboardOrEventForThisMetric } from 'ui/utils/view_dashboard_or_event_for_this_metric.js';

const module = uiModules.get('kibana/status_indicator_and_kpi_vis', ['kibana']);
module.controller('statusIndicatorAndKpiVisController', function ($scope, Private,
  $http, getAppState, timefilter, kbnUrl) {

  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  // This function is called when the 'View More' link
  // in the metric visualization is clicked. This will
  // handle the redirection to a dashboard or events of
  // interest page based on users input to reference page.
  $scope.viewDashboardForThisMetric = function (kpiBlock) {
    const refLink = kpiBlock.view_more;
    viewDashboardOrEventForThisMetric(getAppState, Private, timefilter, kbnUrl, refLink);
  };

  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    // get the selected time duration from time filter
    const timeDuration = timefilter.getBounds();
    const timeDurationStart = timeDuration.min.valueOf();
    const timeDurationEnd = timeDuration.max.valueOf();

    const payload = {
      request_type: $scope.vis.params.request_type,
      bmv: $scope.vis.params.parameters,
      time: {},
      esFilter: esFilter
    };

    payload.time = {
      'gte': timeDurationStart,
      'lte': timeDurationEnd
    };

    $scope.statusData = [];

    if (payload.request_type && payload.bmv) {
      const httpResult = $http.post(urlBase + '/insights/', payload)
        .then(resp => resp.data)
        .catch(resp => { throw resp.data; });

      // Perform operation after getting response.
      httpResult.then(function (resp) {
        $scope.responseData = resp.bmv;
        //  We are extracting the data to to used
        _.each($scope.vis.params.parameters, function (bmv) {
          _.each(Object.keys($scope.responseData), function (bmvName) {
            if (bmvName === bmv.name.title) {
              const metric = {};
              metric.label = bmv.statusIndicatorLabel;
              metric.description = bmv.statusIndicatorDescription;
              const color = Object.values($scope.responseData[bmvName].metrics)[0].color;
              metric.color = color;
              if(metric.color === '#05a608') {
                metric.background = 'background-good';
                metric.image = '/ui/vienna_images/status_indicator_green.svg';
              }else if(metric.color === '#fecc2f') {
                metric.background = 'background-ok';
                metric.image = '/ui/vienna_images/status_indicator_yellow.svg';
              }else if(metric.color === '#f46f0c') {
                metric.background = 'background-warning';
                metric.image = '/ui/vienna_images/status_indicator_orange.svg';
              }else if(metric.color === '#dd171d') {
                metric.background = 'background-bad';
                metric.image = '/ui/vienna_images/status_indicator_red.svg';
              }
              $scope.statusData.push(metric);
            }
          });
        });
      });
    }
  };


  $scope.$watch('vis.params.parameters', $scope.search);
  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);
});
