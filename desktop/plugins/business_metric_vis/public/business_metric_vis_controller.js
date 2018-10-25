require('ui/courier');
const _ = require('lodash');
const  angular = require('angular');
const chrome = require('ui/chrome');

import 'plugins/business_metric_vis/directives/metric_table.js';
import 'plugins/business_metric_vis/directives/historical_data_percentage.js';
import 'plugins/business_metric_vis/factories/recursion_helper.js';

import { uiModules } from 'ui/modules';

import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { idealTextColor, colorLuminance } from 'ui/utils/color_filter';

const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
module.controller('BusinessMetricVisController', function ($scope, Private, Notifier, $http, $rootScope,
  timefilter, courier, $filter, kbnUrl) {

  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  // Constants used in calculation of css properties
  // in metric display.
  $scope.superScriptConstant = 0.6;
  $scope.noDataContainerConstant = 0.45;
  $scope.noDataIconConstant = 0.55;

  // This function is called when the 'View More' link
  // in the metric visualization is clicked. This will
  // handle the redirection to a dashboard or events of
  // interest page based on users input to reference page.
  $scope.viewDashboardForThisMetric = function (referLink) {
    let referencePage = '';
    if (referLink.type === 'dashboard') {
      referencePage = 'dashboard/' + referLink.dashboard.id;
    }
    else if (referLink.type === 'event') {
      referencePage = referLink.type;
    }
    kbnUrl.redirect('/' + referencePage);
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

    // If the textFontSize is defined, lets use it.
    if ($scope.vis.params.textFontSize) {
      $scope.txtFontSize = $scope.vis.params.textFontSize;

      // If the textFontSize is not defined, then lets set the defaults
    } else {
      // If the metric font size is less than or equal tp 24pt,
      // set the text font size to 70% the size of metric
      // font size.
      if ($scope.vis.params.fontSize && $scope.vis.params.fontSize <= 24) {
        $scope.txtFontSize = $scope.vis.params.fontSize * 70 / 100;

      } else {
        // If the metric font size is greater than 24pt,
        // set the text font size to 16pt.
        $scope.txtFontSize = 16;
      }
    }

    // check if aggregations and historical data is configured
    // and get the length for the same.
    let aggregationsLength = 0;
    let historicalDataLength = 0;

    if ($scope.vis.params.aggregations) {
      aggregationsLength = $scope.vis.params.aggregations.length;
    }

    if ($scope.vis.params.historicalData) {
      historicalDataLength = $scope.vis.params.historicalData.length;
    }

    // calculate the no of columns to set the width of each column
    // we are adding 2 at the end to include the column headers 'Metric' and
    // 'For selected time'.
    const noOfColumns = aggregationsLength + historicalDataLength + 2;
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

      const payload = {
        metrics: [],
        historicalData: [],
        aggregations: [],
        time: {},
        esFilter: dashboardContext()
      };

      $scope.vis.params.metrics.forEach(metric => {

        // get the index selected by the user
        const index = metric.index;

        // get the field type
        const fieldType = metric.fieldType;

        // prepare data sets to make POST call to the back end
        // to configure color schema for metric.
        const finalColorSchema = [];
        _.each(metric.colorSchema, function (row) {
          const newRow = {};
          newRow.interval = row.interval + row.intervalUnit;
          newRow.max = row.max;
          newRow.min = row.min;
          newRow.match = row.match;
          newRow.color = row.color;
          finalColorSchema.push(newRow);
        });

        payload.metrics.push({
          index: index,
          label: metric.label,
          metricType: metric.type || '',
          field: metric.field || '',
          fieldType: fieldType || '',
          filter: metric.filter || '*',
          colorSchema: finalColorSchema
        });

      });

      // prepare data sets to make POST call to the back end
      // to get the time shift values.
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
      })
        .catch(function (resp) {
          $scope.data = [];
          const err = new Error(resp.message);
          err.stack = resp.stack;
          $scope.metricDatas = undefined;
          $scope.apiError = true;
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
