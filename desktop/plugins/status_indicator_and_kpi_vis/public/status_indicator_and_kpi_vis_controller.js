const _ = require('lodash');
const chrome = require('ui/chrome');

import d3 from 'd3';
import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { viewDashboardOrEventForThisMetric } from 'ui/utils/view_dashboard_or_event_for_this_metric.js';
import { getImages } from 'ui/utils/vunet_image_utils.js';
const module = uiModules.get('kibana/status_indicator_and_kpi_vis', ['kibana']);
module.controller('statusIndicatorAndKpiVisController', function ($scope, Private,
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
  $scope.viewDashboardForThisMetric = function (kpiBlock) {
    const refLink = kpiBlock.view_more;
    viewDashboardOrEventForThisMetric(getAppState, Private, timefilter, kbnUrl, refLink);
  };

  // Get the updated metricImageDict list with uploaded images.
  getImages(StateService).then(function (iconDict) {
    $scope.metricImageDict =  iconDict;
  });

  // We generate a gauge with an image in the centre
  // and append it into the KPI visualisation
  function  insertGauge() {
    _.each($scope.responseData, (bmv) => {
      _.forOwn(bmv.metrics, (value, key) => {
        const metric = bmv.metrics[key];
        const w = 170;
        const h = 170;
        const outerRadius = (w / 2) - 10;
        const innerRadius = (w / 2) - 15;

        // define the arc in the shape of a horse-shoe
        const arc = d3.svg.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
          .cornerRadius(15)
          .startAngle(-Math.PI / 4)
          .endAngle(Math.PI + (Math.PI / 4));

        // We select the html element we are going to insert
        // the svg and remove all children
        d3.select(`#${metric.id}`).html('');

        // Create the svg inside the requried html element
        const svg = d3.select(`#${metric.id}`)
          .append('svg')
          .attr('width', w)
          .attr('height', h)
          .append('g')
          .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');

        // Insert the arc into the svg
        svg.append('path')
          .attr('d', arc)
          .attr('transform', 'rotate(-90)')
          .attr('fill', metric.color);

        if (metric.metricIcon) {
          // insert image in the centre of svg
          svg.append('image')
            .attr('xlink:href', $scope.metricImageDict[metric.metricIcon])
            .attr('width', w / 3).attr('height', h / 3)
            .attr('x', -w / 6).attr('y', -h / 5);
        }
      });
    });
  }

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
        resp.bmv.KpiMetrics = {};

        // Format the response bmv for KPI visualisation
        _.each(resp.bmv, (bmv) => {
          _.forOwn(bmv.metrics, (value, key) => {
            const metric = bmv.metrics[key];
            const metricValue = metric.formattedValue;

            // Add attribute 'id' (<visualizationName> + <metricLabel>)
            metric.id = metric.visualization_name.replace(/ /g, '_') + '_' + metric.label.replace(/ /g, '_');

            // Add attributes 'formattedValueData' and 'formattedValueMeasure'
            // if formattedValue = 100KB, formattedValueData = 100, formattedValueMeasure = KB
            metric.formattedValueMeasure = metricValue.match(/[^\d]*$/)[0];
            metric.formattedValueData = metricValue.replace(metric.formattedValueMeasure, '');
            // Here we create a single list containing all the metrics
            resp.bmv.KpiMetrics[metric.id] = value;
          });
        });

        $scope.responseData = resp.bmv;

        // Format the response bmv for status visualisation
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

        // Insert gauge into the KPI visualisation
        // This action needs to be performed synchronously after the
        // resonse is processed and UI is rendered.
        // We use a setTimeout inside a recursive function to achieve this.
        const metric = $scope.responseData.KpiMetrics;
        const metricId = Object.values(metric)[0].id;
        let timeOutHandler = undefined;
        let counter = 1;
        const maxIteration = 5;
        const insertGaugeHadler = () => {
          if (counter <= maxIteration) {
            // exit recursive loop when required elements are present in dom and metricImageDict.
            if (document.getElementById(metricId) && $scope.metricImageDict) {
              insertGauge();
              clearTimeout(timeOutHandler);
            } else {
              timeOutHandler = setTimeout(insertGaugeHadler, 300);
            }
            counter++;
          }
        };

        // If KPI template is 'gauge' insert image inside it
        if ($scope.vis.params.kpiTemplate === 'Gauge template') {
          insertGaugeHadler();
        }
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
