require('ui/courier');
const _ = require('lodash');
const  angular = require('angular');
const chrome = require('ui/chrome');

import 'plugins/business_metric_vis/directives/metric_table.js';
import 'plugins/business_metric_vis/directives/historical_data_percentage.js';
import 'plugins/business_metric_vis/factories/recursion_helper.js';

import { noop } from 'lodash';
import { uiModules } from 'ui/modules';

import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { idealTextColor, colorLuminance } from 'ui/utils/color_filter';
import { fixBMVHeightForPrintReport } from 'ui/utils/print_report_utils';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';
import { SavedObjectNotFound } from 'ui/errors';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { getFiltersFromSavedSearch } from 'ui/filter_manager/filter_manager.js';

const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
module.controller('BusinessMetricVisController', function ($scope, Private,
  Notifier, $http, $rootScope, getAppState,
  timefilter, courier, $filter, kbnUrl, $element, savedSearches, StateService, $timeout, confirmModal) {

  const notify = new Notifier({
    location: 'Alert'
  });

  // Intitalizing the vunet-modal to false
  $scope.showActionButtonsModal = false;

  $scope.actionButtonsModalData = {
    isForm: false
  };


  // Fuction to show confimation pop-up to start the action for single and multi-metric cases
  $scope.confirmationToStartActionForSingleMultiMetric = function (actionName) {
    $scope.actionToSendOnSubmit = actionName;
    confirmModal(
      'Are you sure you want to initiate the action ' + $scope.actionToSendOnSubmit + '?',
      {
        title: 'Initiate Action',
        onConfirm: onActionButtonsModalSubmit,
        onCancel: noop,
        confirmButtonText: 'Yes, Initiate action',
        cancelButtonText: 'No, Go back',
      });
  };

  // This function will be called in the case of table format with buckets and will make the arguments to be sent to api call accordingly.
  $scope.confirmationToStartActionForTableDirective = function (actionName, bucket, data, metr) {
    let subBucketValueToSend = bucket.key;
    let bucketValueToSend = data.key;
    $scope.actionToSendOnSubmit = actionName;
    const metricValueToSend = bucket.metric.formattedValue;
    const historicalDataToSend = bucket.metric.historicalData;
    const metricNameToSend = metr.label;

    if (bucketValueToSend === undefined) {
      subBucketValueToSend = null;
      bucketValueToSend = bucket.key;
    }
    $scope.bucketArgsToSend = {};
    $scope.bucketArgsToSend.bucket = bucketValueToSend;
    $scope.bucketArgsToSend.subBucket = subBucketValueToSend;
    $scope.bucketArgsToSend.metricname = metricNameToSend;
    $scope.bucketArgsToSend.metricValue = metricValueToSend;
    $scope.bucketArgsToSend.historcalData = historicalDataToSend;

    confirmModal(
      'Are you sure you want to initiate the action ' + $scope.actionToSendOnSubmit + '?',
      {
        title: 'Initiate Action',
        onConfirm: onActionButtonsModalSubmit,
        onCancel: noop,
        confirmButtonText: 'Yes, Initiate action',
        cancelButtonText: 'No, Go back',
      });
  };

  // This function will be called in the case of table without buckets and will make the arguments to be sent to api call accordingly.
  $scope.confirmationToStartActionForTableWithoutBuckets = function (actionName, metric, item) {
    const metricValueToSend = item.formattedValue;
    const historicalDataToSend = item.historicalData;
    const metricNameToSend = metric;

    $scope.bucketArgsToSend = {};
    $scope.actionToSendOnSubmit = actionName;
    $scope.bucketArgsToSend.metricname = metricNameToSend;
    $scope.bucketArgsToSend.metricValue = metricValueToSend;
    $scope.bucketArgsToSend.historcalData = historicalDataToSend;

    confirmModal(
      'Are you sure you want to initiate the action ' + $scope.actionToSendOnSubmit + '?',
      {
        title: 'Initiate Action',
        onConfirm: onActionButtonsModalSubmit,
        onCancel: noop,
        confirmButtonText: 'Yes, Initiate action',
        cancelButtonText: 'No, Go back',
      });
  };

  function onActionButtonsModalSubmit() {
    const agrsToSend = {};
    agrsToSend.bmv = $scope.vis.title;
    agrsToSend.args = $scope.bucketArgsToSend;
    StateService.initiateAction($scope.actionToSendOnSubmit, agrsToSend).then(() => {
    });
    confirmModal(
      'The action ' + $scope.actionToSendOnSubmit + ' has been initiated. Please check notifications for any updates. ',
      {
        title: 'Action Initiated',
        onConfirm: noop,
        confirmButtonText: 'Okay',
      });
  }

  // This has been done to disable the action buttons if the visualization is saved.
  const currentRoute = window.location.href;
  if(currentRoute.includes('/visualize/create?type=business_metric')) {
    $scope.isVisualizationSaved = false;
  }else{
    $scope.isVisualizationSaved = true;
  }

  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  // Constants used in calculation of css properties
  // in metric display.
  $scope.actionButtonFontConstant = 2;
  $scope.actionButtonPaddingConstant = .7;
  $scope.actionButtonWidthConstant = 12.5;
  $scope.drillDownHelpIconConstant = 5;
  $scope.superScriptConstant = 0.6;
  $scope.noDataContainerConstant = 0.30;
  $scope.noDataIconConstant = 0.55;

  // This function is called when the 'View More' link
  // in the metric visualization is clicked. This will
  // handle the redirection to a dashboard or events of
  // interest page based on users input to reference page.
  $scope.viewDashboardForThisMetric = function (refLink, metricFilter) {
    let referencePage = '';
    let searchString = '';

    if (refLink.useMetricFilter && metricFilter !== undefined) {
      // We need to use the filter applied for this metric
      searchString = metricFilter;
    }
    if (refLink.searchString !== undefined && refLink.searchString !== '') {
      // If additional search string is given combine it with search string
      // from metric
      if (searchString !== '') {
        searchString = '(' + searchString + ') AND (' + refLink.searchString + ')';
      } else {
        searchString = refLink.searchString;
      }
    }
    if (refLink.type === 'dashboard') {
      referencePage = prepareLinkInfo(
        'dashboard/',
        refLink.dashboard.id,
        searchString,
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
        searchString,
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

  // This function is used to set the historical
  // data based on the value of icon coming from back end
  // for multiple metrics inline view.
  $scope.setTrendColor = function (icon, upTrendColor) {
    if (icon === 'fa-caret-up') {
      if (upTrendColor === 'green') {
        return 'green';
      } else {
        return 'red';
      }
    } else if (icon === 'fa-caret-down') {
      if (upTrendColor === 'green') {
        return 'red';
      } else {
        return 'green';
      }
    }
  };

  // This function is used to set the background color for historical
  // data based on the value of icon coming from back end
  // for multiple metrics in tabular view.
  $scope.setTrendBackGroundColor = function (icon, upTrendColor) {
    if (icon === 'fa-caret-up') {
      if (upTrendColor === 'green') {
        return 'bg-green';
      } else {
        return 'bg-red';
      }
    } else if (icon === 'fa-caret-down') {
      if (upTrendColor === 'green') {
        return 'bg-red';
      } else {
        return 'bg-green';
      }
    }
  };

  // This function is used to set the historical
  // data trend color for single metric vis.
  // This function returns a class when background color
  // is enabled else it does not return any thing.
  $scope.setTrendColorForSingleBM = function (icon, upTrendColor, bgColorEnabled) {
    if (!bgColorEnabled) {
      return $scope.setTrendColor(icon, upTrendColor);
    }
  };

  // This function is used to set the font color for historical
  // data trend for multiple metrics in tabular view.
  $scope.setTrendColorForTabularBm = function (icon, upTrendColor, bgColorEnabled) {

    if (!bgColorEnabled) {
      return $scope.setTrendColor(icon, upTrendColor);
    } else {
      return $scope.setTrendBackGroundColor(icon, upTrendColor);
    }
  };

  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    // check if aggregations and historical data is configured
    // and get the length for the same.
    let aggregationsLength = 0;
    let historicalDataLength = 0;
    let actionButtonsLength = 0;

    if ($scope.vis.params.aggregations) {
      aggregationsLength = $scope.vis.params.aggregations.length;
    }

    if ($scope.vis.params.historicalData) {
      historicalDataLength = $scope.vis.params.historicalData.length;
    }
    if($scope.vis.params.actionButtonsData) {
      // If action button are configured the length will be 1 as we are calculating the length of columns(Action Buttons will come in 1 column)
      actionButtonsLength = 1;
    }

    if (aggregationsLength === 0) {
      // Check whether, more than one metrics are to te displayed.
      // If it is only one metric, we would be displaying them
      // with CSS class used for single metric
      let displayedMetrics = 0;
      _.each($scope.vis.params.metrics, function (metric) {
        if (!metric.hideMetric) {
          displayedMetrics += 1;
        }
      });
      $scope.displayedMetrics = displayedMetrics;
    }

    // calculate the no of columns to set the width of each column
    // we are adding 2 at the end to include the column headers 'Metric' and
    // 'For selected time'.
    const noOfColumns = aggregationsLength + historicalDataLength + actionButtonsLength + 2;
    $scope.columnWidth = (100 / (noOfColumns)) + '%';

    // This function is used to prepare the inner most part of the
    // JSON similar to output of BMV with aggregations.
    // This will be used for following two cases:
    // 1. To display table headers
    // 2. To display 'N.A.' when there is no data for a metric.
    // Based on the input values recieved: 'fValue' and 'metricsetType'
    // we prepare the JSON structure for a table header or
    // metric without any results.
    const prepareMetricSet = function (fValue, metricsetType) {
      const metricset = {};
      metricset.formattedValue = fValue;
      // We are pushing the action buttons header name to header meta when action buttons are configured.
      if(fValue === 'For Selected Time') {
        metricset.actionButtonsColumnName =  'Actions';
      }
      metricset.historicalData = [];

      _.each($scope.vis.params.historicalData, function (dataObj) {
        const displayObj = {};
        if (metricsetType === 'header') {
          displayObj.formattedValue = dataObj.label;
          displayObj.percentageChange = 'header';
        }
        else {
          displayObj.formattedValue = 'N.A.';
          displayObj.percentageChange = 'N.A.';
        }
        metricset.historicalData.push(displayObj);
      });
      return metricset;
    };

    // This function is used to prepare a JSON structure
    // similar to the output of BMV with aggregations. This
    // is used to prepare table headers or an empty row with
    // 'N.A' values which can be used to display when any metric
    // fails to get data.
    const prepareBuckets = function (dataset, metricset, metricsetType, count, maxCount) {
      const aggObj = {};

      // If metricsetType is header set the
      // table header name else set 'N.A.'
      if (metricsetType === 'header') {

        // If custom label is configured for aggregations
        // display the custom label else display field name.
        if ($scope.vis.params.aggregations[count].customLabel &&
          $scope.vis.params.aggregations[count].customLabel !== '') {
          aggObj.key = $scope.vis.params.aggregations[count].customLabel;
        } else {
          aggObj.key = $scope.vis.params.aggregations[count].field;
        }
      } else {
        aggObj.key = 'N.A.';
      }
      dataset.push(aggObj);
      count = count + 1;
      // Recursively call prepareBuckets() until
      // we reach the last inner most aggregation.
      if (count < maxCount) {
        aggObj.buckets = [];
        prepareBuckets(aggObj.buckets, metricset, metricsetType, count, maxCount);
      } else {

        // Add metric information in the inner
        // most aggregation bucket.
        aggObj.metric = metricset;
      }
    };

    // This function is used to calculate the number of rows in a BM.
    const getRowsCount = function (dataset, metricCount) {

      // We iterate over each bucket in the dataset(list of buckets) and
      // check for sub buckets recursively. When no more sub buckets are
      // found, we increament the 'metricCount'. The metricCount tracks
      // the total number of rows in BM.
      _.each(dataset, function (item) {
        if (item.buckets && item.buckets.length > 0) {
          metricCount = getRowsCount(item.buckets, metricCount);
        } else {
          metricCount += 1;
        }
      });
      return metricCount;
    };

    // This function prepares a historical data list with 'N.A'
    // values based on number of historical data configured.
    const populateEmptyHistoricalDataValues = function (historicalDataObj) {
      angular.forEach($scope.vis.params.historicalData, function (obj) {
        const dataObj = {};
        dataObj.label = obj.label;
        dataObj.formattedValue = 'N.A.';
        dataObj.percentageChange = -1;
        dataObj.icon = '';
        historicalDataObj.push(dataObj);
      });
    };

    // This function adds 'N.A' values for historical data
    // for each aggregation.
    const addEmptyHistoricalDataForAggregations = function (dataset) {

      // We iterate over each bucket in the dataset(list of buckets) and
      // check for sub buckets recursively. When no more sub buckets are
      // found, we add the historical data object with 'N.A.' values.
      _.each(dataset, function (item) {
        if (item.buckets && item.buckets.length > 0) {
          addEmptyHistoricalDataForAggregations(item.buckets);
        } else {
          item.metric.historicalData = [];
          populateEmptyHistoricalDataValues(item.metric.historicalData);
        }
      });
    };

    // create the inital part of JSON structure for table table headers
    let headersData = {};
    headersData.Metric = {};
    headersData.Metric.buckets = [];

    // prepare the metric part of the JSON structure for table headers.
    const metricsetForHeaders = prepareMetricSet('For Selected Time', 'header');


    // prepare the metric part of the JSON structure to
    // display a row with 'N.A.' values.
    const metricsetWithNoData = prepareMetricSet('N.A.', 'N.A.');

    // prepare the aggregations part of the JSON structure only if
    // aggregations exist.
    if ($scope.vis.params.aggregations &&
      $scope.vis.params.aggregations.length > 0) {
      prepareBuckets(headersData.Metric.buckets,
        metricsetForHeaders,
        'header',
        0,
        $scope.vis.params.aggregations.length);
    }
    else {
      // Prepare JSON structure for vis without aggregations.
      headersData = {};
      headersData.Metric = metricsetForHeaders;
      headersData.Metric.success = true;
    }

    $scope.idealTextColor = idealTextColor;

    // This function will prepare the arguments
    // and makes a POST call to the back end and gets
    // the response data to be displayed.
    const makePostCall = function () {

      //check if metric exist
      if (!$scope.vis.params.metrics) return;

      let esFilter = dashboardContext();

      //Get the search string assigned to the logged-in user's role.
      esFilter = addSearchStringForUserRole(esFilter);

      const payload = {
        metrics: [],
        historicalData: [],
        aggregations: [],
        time: {},
        esFilter: esFilter
      };
      // Add the metrics along with the threshold to the payload request which
      // will be sent out to back-end in the next step.
      const createPayload = function (metric,  metricListIndex, savedSearchQuery) {
        const index = metric.index;
        const fieldType = metric.fieldType;

        // Build threshold from the configured interval, min, max, insight fields.
        const finalThreshold = [];
        _.each(metric.threshold, function (row) {
          const newRow = {};
          newRow.interval = row.interval + row.intervalUnit;
          newRow.max = row.max;
          newRow.min = row.min;
          newRow.match = row.match;
          newRow.color = row.color;
          newRow.insights = row.insights;
          finalThreshold.push(newRow);
        });

        payload.metrics.push({
          metricListIndex: metricListIndex,
          index: index,
          label: metric.label,
          metricGroup: metric.groupName,
          // Add the metric along with the threshold to the payload request.
          metricType: metric.type || '',
          field: metric.field || '',
          fieldType: fieldType || '',
          filter: metric.filter || '*',
          savedSearchFilter: savedSearchQuery,
          enableAutoBaselining: metric.enableAutoBaseLining,
          intervalMetric: metric.intervalMetric,
          additionalFields: metric.additionalFields,
          threshold: finalThreshold,
          advancedConfig: metric.advancedConfig,
          format: metric.format || ''
        });
      };
      // Go through each metric and add threshold to the payload request.
      // Some of the metrics might be using saved search and some of them
      // might be using index. If saved search is used then we should get the
      // search filter from that saved search and add to request. If index is
      // used then send "*" as a default search filter to the back-end.
      const getMetrics = $scope.vis.params.metrics.map(function (metric, metricListIndex) {
        let savedSearchQuery = '*';
        let savedSearchFilters = [];
        // if the saved search for the metric is undefined (old BMV)
        // empty (configured based on the index not saved search)
        // create the payload directly. No need to search in the saved searches.
        if (!metric.savedSearch || metric.savedSearch.id === '') {
          createPayload(metric, metricListIndex, savedSearchQuery);
          return Promise.resolve(false);
        }
        // else if a metric is configured based on the saved search then
        // get the search filter of the saved search and create the payload.
        else {
          return (savedSearches.get(metric.savedSearch.id))
            .then(function (savedSearch) {
            // get the filter query from the saved search
              savedSearchQuery = savedSearch.searchSource.get('query').query;
              // Check whether any filter is added to the saved search
              savedSearchFilters = savedSearch.searchSource.get('filter');
              _.each(savedSearchFilters, function (savedSearchFilter) {
                const filter = _.omit(savedSearchFilter, function (val, key) {
                  if (key === 'meta' || key[0] === '$') return true;
                  return false;
                });
                // There might be no search query but filter in a saved search. So check whether empty for the first time
                // Get the query applied in the filter and append
                if (savedSearchQuery === '') {
                  savedSearchQuery = ' (' + getFiltersFromSavedSearch(savedSearchFilter, filter, $filter) + ')';
                }
                else {
                  // Append the query from the filters
                  savedSearchQuery = savedSearchQuery + ' AND (' + getFiltersFromSavedSearch(savedSearchFilter, filter, $filter) + ')';
                }
              });
              createPayload(metric, metricListIndex, savedSearchQuery);
              return false;
            })
            .catch((error) => {
              if (error instanceof SavedObjectNotFound) {
                notify.error(
                  'Problem in loading this BMV... The saved search associated with metric "' + metric.label +
                '" no longer exists. Please re-configure this metric');
              } else {
              // Display the error message to the user.
                notify.error(error);
                throw error;
              }
            });
        }
      });

      // prepare data sets to make POST call to the back end
      // to get the time shift values.
      Promise.all(getMetrics).then(function () {
        // The order of the metrics might be changed due to saved search.
        // So we need to sort out the metrics based on the
        // metricListIndex field before sending out the request to back-end.
        // So that order in the response will be as same as configuration.
        payload.metrics = $filter('orderBy')(payload.metrics, ' metricListIndex');
        _.each($scope.vis.params.historicalData, function (obj) {
          const newObj = {};
          newObj.label = obj.label;
          if (obj.timeshiftMetric !== '') {
            newObj.type = 'timeshift';
            if (obj.timeshiftMetric !== 'Custom configuration') {
              newObj.value = obj.timeshiftMetric;
            } else {
              newObj.value = obj.shiftValue + obj.shiftUnit;
            }
          } else {
            newObj.type = 'interval';
            newObj.value = obj.intervalMetric;
          }
          payload.historicalData.push(newObj);
        });
        // get the aggregations configured.
        payload.aggregations = $scope.vis.params.aggregations || [];

        // get the selected time duration from time filter
        const timeDuration = timefilter.getBounds();
        const timeDurationStart = timeDuration.min.valueOf();
        const timeDurationEnd = timeDuration.max.valueOf();

        $scope.metricData = undefined;
        $scope.apiError = false;

        payload.time = {
          'gte': timeDurationStart,
          'lte': timeDurationEnd
        };

        // POST call to the backend to get necessary information and
        // prepare the business metric vis.
        const httpResult = $http.post(urlBase + '/metric/', payload)
          .then(resp => resp.data)
          .catch(resp => { throw resp.data; });

        // process the result
        httpResult.then(function (resp) {
          $scope.metricDatas = resp;
          $scope.darkShade = '';
          let metricRowCount = 0;
          // For case of multiple metric in simple format we are extracting the action buttons.
          $scope.actionButtonForMultipleMetric = $scope.vis.params.actionButtonsData;
          // Prepare historical datasets with 'N.A.' as values when the metrics
          // do not have any data in the selected time range.
          angular.forEach($scope.metricDatas, function (metricData, index) {
            for (const key in metricData) {
              if (metricData.hasOwnProperty(key)) {
                // Case when there are aggregations configured.
                if ($scope.vis.params.aggregations &&
                  $scope.vis.params.aggregations.length > 0) {

                  metricRowCount = getRowsCount(metricData[key].buckets, metricRowCount);

                  if (!metricData[key].hasOwnProperty('buckets')) {
                    metricData[key].buckets = [];
                  }

                  // If there are no buckets for this metric in
                  // the response recieved or if there is no data for
                  // this metric, create a row with 'N.A.'
                  // values.
                  if ((metricData[key].buckets &&
                    metricData[key].buckets.length === 0) ||
                    metricData[key].success === false) {

                    prepareBuckets(metricData[key].buckets,
                      metricsetWithNoData,
                      'N.A.',
                      0,
                      $scope.vis.params.aggregations.length);

                    // If latest value metric is selected , Fill historical data
                    // with 'N.A.'. This is done as we do not support historical
                    // data for 'latest value'.
                  } else if ($scope.vis.params.metrics[index].type === 'latest') {

                    addEmptyHistoricalDataForAggregations(metricData[key].buckets);
                  }

                  // Case when there are no aggregations configured.
                } else {

                  // Prepare historical datasets with 'N.A.' as values when
                  // the metrics do not have any data in the selected time range or
                  // when 'latest value' metric is selected.
                  if (metricData[key].success === false ||
                    $scope.vis.params.metrics[index].type === 'latest') {
                    metricData[key].historicalData = [];
                    populateEmptyHistoricalDataValues(metricData[key].historicalData);
                  }
                }
                // Using the colorLuminance function to make the time shift
                // section background 15% more darker than the metric background color.
                $scope.darkShade = colorLuminance(metricData[key].color, -0.15);
              }
            }
          });

          // Populate the total number of rows in $scope.vis.params.
          $scope.vis.params.rowsCount = metricRowCount;

          // prepend the table headers for the tabular
          // view of BM.
          if ($scope.vis.params.enableTableFormat) {
            $scope.metricDatas.splice(0, 0, headersData);
          }

          // If we are printing the report and we have multiple aggregation,
          // set the height of the table based on the number of rows
          if ($scope.printReport && $scope.vis.params.aggregations.length &&
              $scope.vis.params.enableTableFormat) {
            fixBMVHeightForPrintReport($scope, metricRowCount, $element);
          }
        })
          .catch(function (resp) {
            $scope.data = [];
            const err = new Error(resp.message);
            err.stack = resp.stack;
            $scope.metricDatas = undefined;
            $scope.apiError = true;
          });
      });
    };
    // Once the payload is ready make the POST call to back end.
    makePostCall();

  };

  // This is bad, there should be a single event that triggers a refresh of data.
  // When there is a change in business metric vis configuration
  $scope.$watchMulti(['vis.params.metrics', 'vis.params.interval'], $scope.search);

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);

});
