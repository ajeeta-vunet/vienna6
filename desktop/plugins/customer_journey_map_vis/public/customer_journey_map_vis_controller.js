const _ = require('lodash');
const chrome = require('ui/chrome');

import { uiModules } from 'ui/modules';

import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';
import { getImages } from 'ui/utils/vunet_image_utils.js';
const module = uiModules.get('kibana/customer_journey_map_vis', ['kibana']);
module.controller('CustomerJourneyMapVisController', function ($scope, Private,
  $http, getAppState, timefilter, kbnUrl, StateService) {

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
  $scope.viewDashboardForThisMetric = function (refLink) {
    let referencePage = '';

    if (refLink.type === 'dashboard') {
      referencePage = prepareLinkInfo(
        'dashboard/',
        refLink.dashboard.id,
        refLink.searchString,
        refLink.retainFilters,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        getAppState,
        Private,
        timefilter);
    }
    else if (refLink.type === 'event') {
      referencePage = prepareLinkInfo(
        'event/',
        '',
        refLink.searchString,
        refLink.retainFilters,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        getAppState,
        Private,
        timefilter);
    }

    // Have changed from kbnUrl.redirect(url) to kbnUrl.change(url)
    // kbnUrl.redirect(url): will replace the current url with new url
    // will not add it to the browser's history
    // kbnUrl.change(url): will navigate to the new url
    // and add this url to the browser's history
    kbnUrl.change('/' + referencePage);
  };

  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    //  This is the array of stage names
    $scope.stageHeaders = [];
    $scope.stageHeaders.push($scope.vis.params.stageHeaderName);

    // This is the array of stage icons i.e 2nd row and it will have 1st value as Tranction Flow
    $scope.stageIcons = [];

    _.each($scope.vis.params.stages, function (stage) {
      $scope.stageHeaders.push(stage.name);
      $scope.stageIcons.push(stage.icon);
    });

    // Get the updated stageIconsDict list with uploaded images.
    getImages(StateService).then(function (iconDict) {
      $scope.stageIconsDict = iconDict;
    });

    $scope.columnWidth = 100 / $scope.stageHeaders.length + '%';

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    // get the selected time duration from time filter
    const timeDuration = timefilter.getBounds();
    const timeDurationStart = timeDuration.min.valueOf();
    const timeDurationEnd = timeDuration.max.valueOf();

    const payload = {
      stages: $scope.vis.params.stages,
      metricGroups: $scope.vis.params.metricGroups,
      time: {},
      esFilter: esFilter
    };

    payload.time = {
      'gte': timeDurationStart,
      'lte': timeDurationEnd
    };

    const httpResult = $http.post(urlBase + '/cjm/', payload)
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    // Perform operation after getting response.
    httpResult.then(function (resp) {
      $scope.cjmData = resp;
      $scope.iterationCount = 0;
      $scope.tableData = [];
      // We are iterating over the nodes
      _.each($scope.cjmData.nodes, function (stage) {
        // After iterating over node we iterate over the metric groups of the stage and extract the metric list
        // in a (key,value) format and push it in our array for the first iteration where key is the metric group name.
        _.each(stage.metric_groups, function (metricGroupsForStage) {
          if ($scope.iterationCount === 0) {
            const metricGroupName = metricGroupsForStage.label;
            const metricGroupMetrices = metricGroupsForStage.metricList;
            const metricGroup = { [metricGroupName]: [metricGroupMetrices] };
            $scope.tableData.push(metricGroup);
          }
          // After the first iteration or once one (key,value) pair is pushed in the array before putting the next pair we check if
          // the key already exists. If it exists we push it in the same value for the key otherwise we created a new key,value pair
          else {
            const metricGroupName = metricGroupsForStage.label;
            const metricGroupMetrices = metricGroupsForStage.metricList;
            _.each($scope.tableData, function (tableRow) {
              // As Object.keys() returns an array and in our case only 1 key will we present so we are checking for Object.keys(tableRow)[0]
              if (Object.keys(tableRow)[0] === metricGroupName) {
                tableRow[metricGroupName].push(metricGroupMetrices);
              }
            });
          }
        });
        $scope.iterationCount++;
      });
    });


  };
  $scope.$watchMulti(['vis.params.stages', 'vis.params.metricGroups'], $scope.search);
  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);
});
