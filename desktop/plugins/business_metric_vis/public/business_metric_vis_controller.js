require('ui/courier');
const _ = require('lodash');
const chrome = require('ui/chrome');

import { uiModules } from 'ui/modules';
import { RegistryFieldFormatsProvider } from 'ui/registry/field_formats';

import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';

const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
module.controller('BusinessMetricVisController', function ($scope, Private, Notifier, $http, $rootScope,
  timefilter, courier, $filter, kbnUrl) {

  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);
  const fieldFormats = Private(RegistryFieldFormatsProvider);
  console.log('In BusinessMetricVisController');

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  /**
   *    CSS provides HSL color mode that controls Hue, Saturation,
   *    Luminosity(Lightness) and optionaly Opacity
   *
   *    color: hsla(50, 80%, 20%, 0.5);
   *    background-color: hsl(120, 100%, 50%);
   *
   *    hex —> hex color value such as “#abc” or “#123456″ (the hash is optional)
   *    lum —> luminosity factor: -0.1 is 10% darker, 0.2 is 20% lighter
  **/
  function colorLuminance(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    let rgb = '#';
    let c;
    let i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }
    return rgb;
  }

  // This function is called when the 'View More' link
  // in the metric visualization is clicked. This will
  // handle the redirection to a dashboard or events of
  // interest page based on users input to reference page.
  $scope.viewDashboardForThisMetric = function () {
    let referencePage = $scope.vis.params.referenceLink.dashboard.id;
    if ($scope.vis.params.referenceLink.type === 'dashboard') {
      referencePage = 'dashboard/' + referencePage;
    }
    kbnUrl.redirect('/' + referencePage);
  };

  // This function returns a function that can
  // be used to get the format of the field.
  const fieldFormatter = function () {
    let format = $scope.fieldObj && $scope.fieldObj.format;
    if (!format) format = fieldFormats.getDefaultInstance('string');
    return format.getConverterFor();
  };

  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    // This function will prepare the arguments
    // and makes a POST call to the back end and gets
    // the response data to be displayed.
    const makePostCall = function () {

      // Making the post call...
      console.log('In BusinessMetricVisController: making post call');

      // get the index selected by the user
      const index = $scope.vis.params.index.title;

      // get the metric object properties
      const metric = $scope.vis.params.metric;
      if (!metric) return;

      // get the field type
      const fieldType = $scope.vis.params.metric.fieldType;

      // prepare data sets to make POST call to the back end
      // to get the time shift values.
      const finalTimeshift = [];
      _.each(metric.timeShift, function (obj) {
        const newObj = {};
        newObj.value = obj.value + obj.unit;
        newObj.label = obj.label;
        finalTimeshift.push(newObj);
      });

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

      // get the selected time duration from time filter
      const timeDuration = timefilter.getBounds();
      const timeDurationStart = timeDuration.min.valueOf();
      const timeDurationEnd = timeDuration.max.valueOf();

      $scope.metricData = undefined;
      $scope.apiError = false;

      console.log('In BusinessMetricVisController: urlbase is ', urlBase);
      // POST call to the backend to get necessary information and
      // prepare the business metric vis.
      const httpResult = $http.post(urlBase + '/metric/', {
        index: index,
        metricType: metric.type || '',
        field: metric.field || '',
        fieldType: fieldType || '',
        filter: metric.filter || '*',
        esFilter: dashboardContext(),
        colorSchema: finalColorSchema,
        timeshift: finalTimeshift,
        time: { 'gte': timeDurationStart, 'lte': timeDurationEnd }
      })
        .then(resp => resp.data)
        .catch(resp => { throw resp.data; });

      // process the result
      httpResult.then(function (resp) {

        console.log('HTTP response is ', resp);

        $scope.metricData = resp;

        // Get the function to evaluate the field format.
        const fieldFormatFunc = fieldFormatter();

        console.log('Vis params metric is ', $scope.vis.params.metric);
        // Do not show the metric value unit for count and unique count.
        if ($scope.vis.params.metric.type === 'count' ||
           $scope.vis.params.metric.type === 'cardinality') {
          $scope.metricData.formattedValue = $scope.metricData.value;
        } else {
          // get the metric value with its unit.
          $scope.metricData.formattedValue = fieldFormatFunc($scope.metricData.value);
        }

        // Get the timeshift values with its unit.
        _.each($scope.metricData.timeshift, function (timeshiftObj) {

          // If property 'value' exists in the response received.
          if(timeshiftObj.value) {

            // Do not show the metric value unit for count and unique count.
            if ($scope.vis.params.metric.type === 'count' ||
                $scope.vis.params.metric.type === 'cardinality') {
              timeshiftObj.formattedValue = timeshiftObj.value;
            } else {

              // get the time shift values with its unit.
              timeshiftObj.formattedValue = fieldFormatFunc(timeshiftObj.value);
            }
          }

          // If property 'value' does not exist in the response received.
          else {
            timeshiftObj.formattedValue = '';
          }
        });

        // Using the colorLuminance function to make the time shift
        // section background 15% more darker than the metric background color.
        $scope.darkShade = colorLuminance($scope.metricData.color, -0.15);
      })
        .catch(function () {
          $scope.data = [];
          $scope.metricData = undefined;
          $scope.apiError = true;
        });
    };

    // This will set the indexFields with the fields according to the data
    // source selected. It also takes care of grouping the fields.
    // according to their types.
    if ($scope.vis.params.index !== undefined) {
      courier.indexPatterns.get($scope.vis.params.index.id).then(function (data) {

        // Check if fieldObj is populated.
        // If not get the index fields and fieldObj.
        if($scope.fieldObj === undefined) {
          let fields = data.fields.raw;
          fields = $filter('filter')(fields, { aggregatable: true });
          $scope.indexFields = fields.slice(0);

          // get the field object from the field name
          _.each($scope.indexFields, function (field) {
            if ($scope.vis.params.metric.field === field.name) {
              $scope.fieldObj = field;
              return;
            }
          });
        }

        // make post call to get the data to be displayed
        // for business metric vis.
        makePostCall();
      });
    }
  };

  // This is bad, there should be a single event that triggers a refresh of data.
  // When there is a change in business metric vis configuration
  $scope.$watchMulti(['vis.params.index', 'vis.params.metric', 'vis.params.interval'], $scope.search);

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);

});
