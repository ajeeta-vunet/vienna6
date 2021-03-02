require('ui/courier');
const _ = require('lodash');
const angular = require('angular');
const chrome = require('ui/chrome');

import 'plugins/business_metric_vis/directives/metric_table.js';
import 'plugins/business_metric_vis/directives/historical_data_percentage.js';
import 'plugins/business_metric_vis/factories/recursion_helper.js';

import { noop } from 'lodash';
import { uiModules } from 'ui/modules';

import AggConfigResult from 'ui/vis/agg_config_result';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { idealTextColor, colorLuminance } from 'ui/utils/color_filter';
// import { fixBMVHeightForPrintReport } from 'ui/utils/print_report_utils';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';
import { SavedObjectNotFound } from 'ui/errors';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { getFiltersFromSavedSearch } from 'ui/filter_manager/filter_manager.js';
import moment from 'moment';

const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
const utcRegex = new RegExp('\\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\\b');
module.controller('BusinessMetricVisController', function ($scope, Private,
  Notifier, $http, $rootScope, getAppState, config,
  timefilter, courier, $filter, kbnUrl, $element, savedSearches, StateService, $timeout, confirmModal) {


  const timeFormat = config.get('dateFormat');

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

  // This function will be called when the action button is clicked in the vertical tabular format
  // It creates the arguments to be sent to the backend api call.
  // actionName - Name of the action button
  // data - Bucketing and metric details in json format. Sample format is given below.
  // {"Column0":"SBI","Column1":"9002","Column1":{"value":Down,"formattedValue":"Down","color":"#05a608"}
  // The above sample format for 2 buckets (Bank, port) and a metric (status).
  $scope.confirmationToStartActionForVerticalTableDirective = function (actionName, data) {
    // By default create an empty json argument
    // as there might be no bucket aggregation involved.
    $scope.bucketArgsToSend = {};
    $scope.actionToSendOnSubmit = actionName;
    // Action button will support maximum 2 buckets
    // If no bucket is configured then only make the metrics
    // If there is only one bucket then make only the main bucket
    if ($scope.vis.params.aggregations.length === 1) {
      $scope.bucketArgsToSend.bucket = data.Column0;
    }
    // If there are two buckets then make both main and sub buckets
    else if ($scope.vis.params.aggregations.length === 2) {
      $scope.bucketArgsToSend.bucket = data.Column0;
      $scope.bucketArgsToSend.subBucket = data.Column1;
    }
    // Go though each metric and check whether the metric is enabled or not
    // If the metric is hidden then don't send it
    let metricIndex = $scope.vis.params.aggregations.length;
    angular.forEach($scope.vis.params.metrics, function (metric, index) {
      if (!metric.hideMetric) {
        $scope.bucketArgsToSend['metricName' + index] = metric.label;
        $scope.bucketArgsToSend['metricValue' + index] = data['Column' + metricIndex].formattedValue;
        metricIndex = metricIndex + 1;
      }
    });

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
  if (currentRoute.includes('/visualize/create?type=business_metric')) {
    $scope.isVisualizationSaved = false;
  } else {
    $scope.isVisualizationSaved = true;
  }

  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  $scope.onFilterClick = function (field, value, indexId, negate) {
    const $state = getAppState();
    const meta = [];
    const filter = {};
    filter.meta = { 'index': indexId, 'negate': negate };
    filter.query = {};
    filter.query.match = {};
    filter.query.match[field] = { 'query': value, 'type': 'phrase' };
    meta.push(filter);
    if ($state.query.language === 'lucene') {
      $state.$newFilters = meta;
    }
    $state.$newFilters = meta;
  };
  // Constants used in calculation of css properties
  // in metric display.
  $scope.actionButtonFontConstant = 2;
  $scope.actionButtonPaddingConstant = .7;
  $scope.actionButtonWidthConstant = 12.5;
  $scope.drillDownHelpIconConstant = 5;
  $scope.superScriptConstant = 0.6;
  $scope.noDataContainerConstant = 0.30;
  $scope.noDataIconConstant = 0.55;

  $scope.sort = {
    columnIndex: null,
    columnName: null,
    direction: null
  };

  self.sort = {
    columnIndex: null,
    columnName: null,
    direction: null
  };

  $scope.sortColumn = function (colIndex, colName, sortDirection = 'asc') {
    if (self.sort.columnIndex === colIndex) {
      const directions = {
        null: 'asc',
        'asc': 'desc',
        'desc': null
      };
      sortDirection = directions[self.sort.direction];
    }
    self.sort.columnIndex = colIndex;
    self.sort.columnName = colName;
    self.sort.direction = sortDirection;
    if ($scope.sort) {
      _.assign($scope.sort, self.sort);
    }
  };

  function valueGetter(row) {
    let value = row[self.sort.columnName];
    if (value && value.value != null) value = value.value;
    if (typeof value === 'boolean') value = value ? 0 : 1;
    if (value instanceof AggConfigResult && value.valueOf() === null) value = false;
    return value;
  }

  function resortRows() {
    if ($scope.verticalDatas) {
      const sort = self.sort;
      const orderBy = $filter('orderBy');
      if (sort.direction !== null) {
        const headersData = $scope.verticalDatas[0];
        $scope.verticalDatas.splice(0, 1);
        $scope.verticalDatas = orderBy($scope.verticalDatas, valueGetter, sort.direction === 'desc');
        $scope.verticalDatas.splice(0, 0, headersData);
      }
    }
  }


  // This function is called when the 'View More' link
  // in the metric visualization is clicked. This will
  // handle the redirection to a dashboard or events of
  // interest page based on users input to reference page.
  $scope.viewDashboardForThisMetric = function (refLink, metricFilter, value) {
    let referencePage = '';
    let searchString = '';
    let fieldName = undefined;
    let fieldValue = '';

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
    if (refLink.useFieldAsFilter) {
      fieldName = refLink.field;
      fieldValue = value;
    }
    if (refLink.type === 'dashboard' || refLink.dashboard) {
      referencePage = prepareLinkInfo(
        'dashboard/',
        refLink.dashboard.id,
        searchString,
        refLink.retainFilters,
        fieldName,
        fieldValue,
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
    if(!refLink.openInNewWindow) {
      kbnUrl.change('/' + referencePage);
    }
    else if(refLink.openInNewWindow && refLink.openInNewWindow === true) {
      window.open('/app/vienna#/' + referencePage, '_blank', 'location=yes,fullscreen=yes,scrollbars=yes,status=yes');
    }
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
      $scope.aggregationsLength = aggregationsLength;
    }

    if ($scope.vis.params.historicalData) {
      historicalDataLength = $scope.vis.params.historicalData.length;
    }
    if ($scope.vis.params.actionButtonsData) {
      // If action button are configured the length will be 1 as we are calculating the length of columns(Action Buttons will come in 1 column)
      actionButtonsLength = 1;
    }

    // Check whether, more than one metrics needs to te displayed.
    // If it is only one metric, we would be displaying them
    // with CSS class used for single metric
    let displayedMetrics = 0;
    _.each($scope.vis.params.metrics, function (metric) {
      if (!metric.hideMetric) {
        displayedMetrics += 1;
      }
    });
    $scope.displayedMetrics = displayedMetrics;

    if (aggregationsLength === 0) {
      // Check whether, more than one metrics needs to te displayed.
      // If it is only one metric, we would be displaying them
      // with CSS class used for single metric
      //  let displayedMetrics = 0;
      //  _.each($scope.vis.params.metrics, function (metric) {
      //    if (!metric.hideMetric) {
      //      displayedMetrics += 1;
      //    }
      //  });
      $scope.displayedMetrics = displayedMetrics;
    }

    // calculate the no of columns to set the width of each column
    // we are adding 2 at the end to include the column headers 'Metric' and
    // 'For selected time'.
    //const noOfColumns = aggregationsLength + historicalDataLength + actionButtonsLength + 2;
    const noOfColumns = $scope.vis.params.tabularFormat === 'vertical' ?
      aggregationsLength + actionButtonsLength + (displayedMetrics * (historicalDataLength + 1)) :
      aggregationsLength + historicalDataLength + actionButtonsLength + 2;

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
      if (fValue === 'For Selected Time') {
        metricset.actionButtonsColumnName = 'Actions';
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
        // We test response to the check if this is a timestamp and if so
        // we would change the format to a standard time format set in Advance Settings under Manage Resources.
        if (utcRegex.test(item.key)) {
          const m = moment(item.key);
          item.key = m.local().format(timeFormat);
        }
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
      const createPayload = function (metric, metricListIndex, savedSearchQuery) {
        const index = metric.index;
        const fieldType = metric.fieldType;
        let metricType = metric.type;
        let metricArg = metric.metricArg;
        // Median is nothing but 50th percentile.
        // So if the selected metric type is median then
        // send 50 as percents always
        if (metric.type === 'median') {
          metricType = 'percentiles';
          metricArg = '50';
        }
        // Build threshold from the configured interval, min, max, insight fields.
        const finalThreshold = [];
        _.each(metric.threshold, function (row) {
          const newRow = {};
          newRow.interval = row.interval + row.intervalUnit;
          newRow.comparison = row.comparison;
          newRow.valueStr = row.valueStr;
          newRow.value = row.value;
          newRow.valueMin = row.valueMin;
          newRow.action = row.action;
          newRow.severity = row.severity;
          newRow.min = row.min;
          newRow.max = row.max;
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
          metricType: metricType || '',
          field: metric.field || '',
          fieldType: fieldType || '',
          metricArg: metricArg,
          advancedConfig: metric.advancedConsfig || '',
          hideMetric: metric.hideMetric || false,
          scripted: metric.scripted || false,
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

      // This function will be called for the 2nd metric and so on...
      const updateMetricAndHistoricalData = function (metric, metricList, row, columnName, colIndex) {
        let value;
        let formattedValue;
        let color;
        angular.forEach(metricList, function (metricObj) {
          //for (let index = 0; index < metricList.length; index++) {
          const label = metricObj.label;
          if (metric.label === label) {
            if (metric.value !== undefined) {
              value = metric.value;
              formattedValue = metric.formattedValue;
              color = metric.color;
            }
            else {
              value = 'N.A.';
              formattedValue = 'N.A.';
              color = 'N.A.';
            }
            row[columnName + colIndex] = { value: value, formattedValue: formattedValue, color: color };
            colIndex = colIndex + 1;
            // Add historic Data
            if (metric.hasOwnProperty('historicalData')) {
              angular.forEach(metric.historicalData, function (hist, index) {
                const histColor = $scope.setTrendColor(hist.icon, metricList[index].upTrendColor);
                row[columnName + colIndex] = {
                  value: hist.value,
                  formattedValue: hist.formattedValue,
                  color: histColor,
                  icon: hist.icon,
                  percentageChange: hist.percentageChange
                };
                colIndex = colIndex + 1;
              });
            }
            else {
              angular.forEach($scope.vis.params.historicalData, function () {
                row[columnName + colIndex] = { value: 'N.A.', formattedValue: 'N.A.', percentageChange: -1 };
                colIndex = colIndex + 1;
              });
            }
          }
        });
      };

      // This function updates the historical data for the current metric
      const updateHistoricalDataForMatrix = function (key, list) {
        if (key.metric.hasOwnProperty('historicalData')) {
          angular.forEach(key.metric.historicalData, function (hist) {
            list[key.key][key.metric.label][hist.label] = {
              value: hist.formattedValue, color: hist.color,
              icon: hist.icon,
              percentageChange: hist.percentageChange
            };
          });
        }
      };


      // This function iterates through buckets for each metric and
      // collects the column header (colHeader - 1st bucket),
      // row header (rowHeader - 2nd bucket)
      // and the final metrics data (destList)
      const buildHeadersForMatrix = function (result, destList, colHeader, rowHeader, bucketHeader) {
        angular.forEach(result, function (key) {
          // Check whether bucket is used...
          // The first bucket would be the column header. So add the bucket to the column header array.
          if (key.hasOwnProperty('buckets')) {
            bucketHeader = key.formattedKey;
            if (key.hasOwnProperty('key') && !colHeader.includes(key.formattedKey)) {
              colHeader.push(key.formattedKey);
            }
            // Check whether second bucket is used
            buildHeadersForMatrix(key.buckets, destList, colHeader, rowHeader, bucketHeader);
          }
          else {
            let row = {};
            let rowExists = false;
            // The 2nd bucket would be the row header. So add the second bucket to row header array.
            // Check whether the bucket already exists...
            if (!rowHeader.includes(key.formattedKey))
            {
              rowHeader.push(key.formattedKey);
            }
            // Always check whether the incoming bucket already exists.
            // The incoming bucket might be already added for the previous metric.
            angular.forEach(destList, function (metric, column) {
              if (column === (colHeader.length ? bucketHeader : key.formattedKey)) {
                row = destList[column];
                rowExists = true;
              }
            });

            // If the bucket already exists then add the new metric to the existing bucket
            // rather than duplicating the bucket.
            if (rowExists) {
              // If column header is not empty then it's a 2 buckets matrix.
              if (colHeader.length) {
                if (row.hasOwnProperty(key.formattedKey)) {
                  row[key.formattedKey][key.metric.label] = { value: key.metric.formattedValue, color: key.metric.color };
                  updateHistoricalDataForMatrix(key, row);
                }
                else {
                  row[key.formattedKey] = { [key.metric.label]: { value: key.metric.formattedValue, color: key.metric.color } };
                  updateHistoricalDataForMatrix(key, row);
                }
              }
              // If column header is empty then it's single bucket matrix.
              else {
                row[key.metric.label] = { value: key.metric.formattedValue, color: key.metric.color };
                updateHistoricalDataForMatrix(key, row);
              }
            }
            // If the bucket not already exists then add as a new bucket.
            else {
              // If column header is not empty then it's a 2 buckets matrix.
              // We need to add the metric against the column header - row header
              // for ex; {column header: {row header {value: 0, color: #454433}}}
              if (colHeader.length) {
                destList[bucketHeader] = { [key.formattedKey]: { [key.metric.label]:
                  { value: key.metric.formattedValue, color: key.metric.color } } };

                updateHistoricalDataForMatrix(key, destList[bucketHeader]);
              }
              // else it's single bucket matrix.
              // We need to add the metric against the column header
              // for ex; {column header: {value: 0, color: #454433}}
              else {
                destList[key.formattedKey] = { [key.metric.label]:
                  { value: key.metric.formattedValue, color: key.metric.color } };
                updateHistoricalDataForMatrix(key, destList[key.formattedKey]);
              }
            }
          }
        });
      };

      // This function receives each metric from the json response sent by back-end,
      // iterates through metric's buckets (if used) and store the bucket value and
      // metric value in an array object for the vertical view.

      // Sample response for a single metric BMV
      //[{"Total": {"value": 9,"groupName": "Total","label": "Total","severity": null,
      //"color": "#05a608","formattedValue": "9","description": "","insights": "Looks all fine",
      //"visualization_name": "Total","success": true,"metricIcon": ""}}]

      //Sample final output
      //[{"Column0":"Total"},{"Column0":{"value":9,"formattedValue":"9","color":"#05a608"}}]

      // Sample response for a single metric and single bucket BMV
      //[{"Total":
        //{"buckets":
        //[{"fieldName": "channel","key": "Easy Pay","metric": {
        //"value": 3,"visualization_name": "Total","groupName": "Total","metricIcon": "",
        //"success": true,"severity": null,"label": "Total","color": "#05a608",
        //"formattedValue": "3","description": "","insights": "Looks all fine"}}
        //]
        //}
      //}]

      //Sample final output for a single bucket and a single metric would be as following
      //[{"Column0":"channel","Column1":"Total"},
      //{"Column0":"Easy Pay","Column1":{"value":3,"formattedValue":"3","color":"#05a608"}}]

      // In the final arry, the first item would be the header info for the table.
      // The rest of the items are data row.

      const iterateResults = function (result, destList, stack, metricList, columnName, metricIndex, metricName, rowIndex = 1) {
        angular.forEach(result, function (key, value) {
          // For each metric, very first time the metric name will be empty
          // So get the metric name and assign to it. This will be used later.
          if (metricName === '') metricName = value;
          // If buckets are used, pick the key (bucket value)
          // and store it in an stack array
          if (key.hasOwnProperty('buckets')) {
            if (key.hasOwnProperty('key')) {
              stack.push(key.key);
            }
            // If more than 1 bukets are used,
            // pick the next bucket and repeat this process
            // until we reach the metric part.
            iterateResults(key.buckets, destList, stack, metricList, columnName, metricIndex, metricName, rowIndex);
            stack.pop(key.key);
          }
          else {
            let row = {};
            let colIndex = 0;
            // Go through each key in the stack array
            // and add it to to row json as below
            //{"Column0":"system","Column1":"process"},,"Column2":"diskio"}]
            angular.forEach(stack, function (key) {
              row[columnName + colIndex] = key;
              colIndex = colIndex + 1;
            });
            let metric = {};
            // If bucket is used then the metric details will be available in the metric key
            if (key.hasOwnProperty('metric')) {
              row[columnName + colIndex] = key.key;
              metric = key.metric;
            }
            // If bucket is not used then the metric key will not be available and
            // we can use the key as metric
            else {
              metric = key;
            }
            // Always check whether row already exists for the bucket.
            // if available, pick that data and update it for the upcoming metrics.

            // if no buckets used then there ll be only 2 objects in the array.
            // 1. Header 2. data
            // So get the 2nd object and update it from the 2nd metric
            let rowExists = {};
            if ($scope.vis.params.aggregations.length === 0 && metricIndex > 0) {
              rowExists = destList[1];
            }
            // else if bucket is used then row might be already exists...
            // find the row by the bucket value and update it from the 2nd metric
            else if (Object.keys(row).length > 0) {
              rowExists = $filter('filter')(destList, row);
            }
            // As mentioned in the previous steps, the first item in the
            // deslList would be the header containing the bucket name and
            // metric name. Get the column index for the incoming metric and
            // update it.
            let headerIndex = 0;
            angular.forEach(destList[0], function (header) {
              if (header === metricName) {
                colIndex = headerIndex;
                return;
              }
              headerIndex = headerIndex + 1;
            });
            // if row exists for the bucket already then update it.
            if (Object.keys(rowExists).length > 0) {
              row = rowExists.length > 0 ? rowExists[0] : rowExists;
              updateMetricAndHistoricalData(metric, metricList, row, columnName, colIndex);
            }
            else {
              // If not exists add as a new row
              let index = 0;
              angular.forEach(destList[0], function (metric, column) {
                const metric1 = {};
                if (Object.keys(row).length > 0 && !row.hasOwnProperty(column)) {
                  metric1.value = 0;
                  metric1.formattedValue = 0;
                  metric1.label = metric;
                  updateMetricAndHistoricalData(metric1, metricList, row, columnName, index);
                }
                index = index + 1;
              });
              updateMetricAndHistoricalData(metric, metricList, row, columnName, colIndex);
              destList.push(row);
             }
           }
           rowIndex = rowIndex + 1;
        });
      };


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

        if ($scope.vis.params.enableTableFormat) {
          payload.tabularFormat = $scope.vis.params.tabularFormat;
        }

        // THis flag has been used to show loading as api is being called
        $scope.isLoading = true;

        // POST call to the backend to get necessary information and
        // prepare the business metric vis.
        const httpResult = $http.post(urlBase + '/metric/', payload)
          .then(resp => resp.data)
          .catch(resp => { throw resp.data; });

        // process the result
        httpResult.then(function (resp) {
          $scope.resp = resp;
          $scope.metricDatas = resp;
          $scope.isLoading = false;
          $scope.darkShade = '';
          let metricRowCount = 0;
          // The tabularformat for the old BMVs would be undefined. So show old BMVs in horizontal forat by default
          if ($scope.vis.params.enableTableFormat && ($scope.vis.params.tabularFormat === undefined ||
            $scope.vis.params.tabularFormat === 'horizontal')) {
            $scope.vis.params.tabularFormat = 'horizontal';
            // For case of multiple metric in simple format we are extracting the action buttons.
            $scope.actionButtonForMultipleMetric = $scope.vis.params.actionButtonsData;
            // Prepare historical datasets with 'N.A.' as values when the metrics
            // do not have any data in the selected time range.
            angular.forEach($scope.metricDatas, function (metricData, index) {
              for (const key in metricData) {
                if (metricData.hasOwnProperty(key)) {
                  // We test response to the check if this is a timestamp and if so
                  // we would change the format to a standard time format set in Advance Settings under Manage Resources.
                  if (utcRegex.test(metricData[key].formattedValue)) {
                    const m = moment(metricData[key].formattedValue);
                    metricData[key].formattedValue = m.local().format(timeFormat);
                  }
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
          }
          else if ($scope.vis.params.enableTableFormat && $scope.vis.params.tabularFormat === 'vertical') {

            // Here the verticalDatas array will have the actual header and data.
            // The first item in the array would be column header and the rest are row data.
            // The sample output for the verticalDatas is below.
            // [{"Column0":"host","Column1":"type","Column2":"total"},
            // {"Column0":"127.0.0.1","Column1":"process",
            // "Column2":{"value":44458,"formattedValue":"44,458","color":"#05a608"}]
            $scope.verticalDatas = [];
            // Here the columnMeta is the array containing the reference link,
            // show/hide, back ground color and historical data details for each metric.
            // The sample output for the columnmeta is below.
            // [{"Reference Link":{"dashboard":{"allowedRolesJSON":"[{\"name\":\"admin\",\"permission\":\"modify\"},
            // {\"name\":\"modify\",\"permission\":\"\"},{\"name\":\"view\",\"permission\":\"\"},
            // {\"name\":\"ANSRadmin\",\"permission\":\"\"}]","id":"42ff5910-33c7-11e9-873d-0d17f41ef83a",
            // "title":"New Dashboard"},"field":"host","retainFilters":false,"searchString":"",
            // "useFieldAsFilter":true},"historicData":false},{"plain text":"","historicData":false}]
            $scope.columnMeta = [];

            const item = {};
            let colIndex = 0;
            const columnName = 'Column';
            // go through bucket aggreagtions and check whether reference link
            // is created for any bucketing field.
            // If the selected bucketing field is available in the referene link
            // section then add the reference link details to the column meta array.
            for (let index = 0; index < $scope.vis.params.aggregations.length; index++) {
              // Add bucket names to header
              let label = $scope.vis.params.aggregations[index].customLabel;
              const field = $scope.vis.params.aggregations[index].field;
              if (label === '') {
                label = $scope.vis.params.aggregations[index].field;
              }
              item[columnName + colIndex] = label;
              colIndex = colIndex + 1;
              const refLink = {};
              let match = false;
              // If reference link is configured
              if ($scope.vis.params.linkInfo.length) {
                // go though the reference links and check whether
                // the reference link field is used in bucket aggregations.
                for (const i in $scope.vis.params.linkInfo) {
                  if (field === $scope.vis.params.linkInfo[i].field) {
                    refLink['Reference Link'] = $scope.vis.params.linkInfo[i];
                    match = true;
                  }
                }
              }
              // if not found then the corresponding aggregation bucket is just a
              // normal text and not a reference link.
              if (!match) {
                refLink['plain text'] = '';
              }
              refLink.historicData = false;
              // Set it to false as the aggregation header should be always visible
              $scope.columnMeta.push(refLink);
            }

            // Go through metrics and get the show/hide metric, background color
            // and reference link details to the column meta array.
            // We need to check the reference link only for the latest value metric type.
            angular.forEach($scope.vis.params.metrics, function (metric, index) {
              const refLink = {};
              const metricIndex = index;
              // Add metric names and historic data names to header
              item[columnName + colIndex] = metric.label;
              colIndex = colIndex + 1;
              const field = metric.field;
              const type = metric.type;
              // Set it to true/false based on the hideMetric.
              refLink.hide = metric.hideMetric;
              // Set it to true/false based on the bg color.
              refLink.bgColorEnabled = metric.bgColorEnabled;
              refLink.historicData = false;
              if (type === 'latest') {
                if ($scope.vis.params.linkInfo.length) {
                  for (const i in $scope.vis.params.linkInfo) {
                    if (field === $scope.vis.params.linkInfo[i].field) {
                      refLink['Reference Link'] = $scope.vis.params.linkInfo[i];
                      break;
                    }
                  }
                }
              }
              $scope.columnMeta.push(refLink);

              // Go though historical data and get show/hide, bg color, historical data
              // and add to the column data array
              angular.forEach($scope.vis.params.historicalData, function (hist) {
                const refLink = {};
                item[columnName + colIndex] = hist.label;
                colIndex = colIndex + 1;
                // We need to hide historical data for the hidden metric also.
                // So set it to true/false based on the corrosponding metric's hideMetric.
                refLink.hide = $scope.vis.params.metrics[metricIndex].hideMetric;
                refLink.bgColorEnabled = $scope.vis.params.metrics[metricIndex].bgColorEnabled;
                refLink.historicData = true;
                $scope.columnMeta.push(refLink);
              });
            });
            // At this point item json will have only column header info.
            // Add it to the vertical datas array as the first item.
            $scope.verticalDatas.push(item);
            // Iterate through the response received from the backend
            // and add the metric details to the vertical data as row data from the 2nd item.
            angular.forEach(resp, function (metricData, index) {
              iterateResults(metricData, $scope.verticalDatas, [], $scope.vis.params.metrics, columnName, index, '');
            });
            metricRowCount = $scope.verticalDatas.length;
          }
          else if ($scope.vis.params.enableTableFormat && $scope.vis.params.tabularFormat === 'matrix') {
            // This list will have the column headers for the matrix from the first bucket
            $scope.matrixColHeader = [];
            // This list will have the row headers for the matrix from the second bucket
            $scope.matrixRowHeader = [];
            // This json will have the final data for each metric against the buckets
            // after iterating the backend response
            $scope.matrixDatas = {};
            // Let's proceed if there is atleast one bucket aggregation
            if ($scope.vis.params.aggregations.length > 0)
            {
              $scope.matrixMetrics = [];
              // Lets add the metrics and historical metrics to the above list
              // which will be used for the nested table
              angular.forEach($scope.vis.params.metrics, function (metric, index) {
                $scope.matrixMetrics.push({ label: metric.label, type: 'metric', hide: metric.hideMetric });
                angular.forEach($scope.vis.params.historicalData, function (hist) {
                  $scope.matrixMetrics.push({ label: metric.label, histLabel: hist.label, type: 'historical', hide: metric.hideMetric});
                });
              });
              // Iterate each metric in the response and build
              // column header, row header and metrics
              angular.forEach(resp, function (metricData) {
                buildHeadersForMatrix(metricData, $scope.matrixDatas, $scope.matrixColHeader, $scope.matrixRowHeader, '');
              });
              // if only one bucket is configured then there is no row header.
              // Copy row header to column header and add first bucket to the row header
              // So that only one row will be displayed for single bucket matrix
              if ($scope.vis.params.aggregations.length === 1) {
                $scope.matrixColHeader = $scope.matrixRowHeader;
                $scope.matrixRowHeader = [];
                $scope.matrixRowHeader.push($scope.vis.params.aggregations[0].label);
              }
            }
          }
          // Populate the total number of rows in $scope.vis.params.
          $scope.vis.params.rowsCount = metricRowCount;
          // prepend the table headers for the tabular
          // view of BM.
          if ($scope.vis.params.enableTableFormat && $scope.vis.params.tabularFormat === 'horizontal') {
            $scope.metricDatas.splice(0, 0, headersData);
            $scope.horizontalDatas = $scope.metricDatas;
          }

          // If we are printing the report and we have multiple aggregation,
          // set the height of the table based on the number of rows
          if ($scope.printReport && $scope.vis.params.aggregations.length &&
            $scope.vis.params.enableTableFormat) {

            /* This has been commented out as some of the last rows were getting cut in print reports. This was because we have
              taken the height of the row as 31 always but this fails when there is word wrapping in the row because of large
              amount of content. Hence not we are not calculating the height of the BMV table manually, rather whatever is the height
              of the BMV table is being taken dynamically automatically.
            */
            // fixBMVHeightForPrintReport($scope, metricRowCount, $element);
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

  $scope.$watchMulti(['[]sort'], resortRows);

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
