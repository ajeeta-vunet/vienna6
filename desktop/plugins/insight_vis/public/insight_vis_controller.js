import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { render } from 'mustache';
import MarkdownIt from 'markdown-it';
import 'angular-sanitize';
import '../../../node_modules/quill/dist/quill.snow.css';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';
import d3 from 'd3';
import { htmlIdGenerator } from 'ui_framework/services';

require('quill');
require('ng-quill');

const chrome = require('ui/chrome');
const _ = require('lodash');

const markdownIt = new MarkdownIt({
  html: false,
  linkify: true,
});
// get the insight_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/insight_vis', [
  'kibana',
  'ngSanitize',
  'ngQuill',
]);

module.controller('insightVisController', function (
  $scope,
  Private,
  Notifier,
  $http,
  getAppState,
  $rootScope,
  timefilter,
  kbnUrl,
  StateService,
  $sce
) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Block to insert the line chart in case of proactive insight
  function insertLineChart(insightData) {
    const lineChartId = 'trend-chart-' + insightData.id;
    const lineChartItem = document.querySelector(`#${lineChartId}`);

    // We select the html element we are going to insert
    // the svg and remove all children
    d3.select(`#${lineChartId}`).html('');

    // If advanced variable is not present, we are exiting from the function
    if(!insightData || !insightData.metadata || !insightData.metadata.advanced) {
      return;
    }

    // If trend key is not present or if we have just one value, we are exiting from the function
    if(!insightData.metadata.advanced.trend || insightData.metadata.advanced.trend.length < 2) {
      return;
    }

    const margin = { top: 5, right: 20, bottom: 5, left: 20 };
    const parentWidth = lineChartItem ? lineChartItem.offsetWidth : 120;
    const width = parentWidth - margin.left - margin.right;
    const height = 50 - margin.top - margin.bottom;

    // Date Format for the value
    const parseDate = d3.time.format('%Y-%m-%d %H:%M:%S').parse;

    const x = d3.time.scale()
      .range([0, width]);

    const y = d3.scale.linear()
      .range([height, 0]);

    const line = d3.svg.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.close); });

    // Appending the SVG that contains the trend chart
    const svg = d3.select(`#${lineChartId}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Convering the input data to the necessary object format
    const dataPrimary = insightData.metadata.advanced.trend.map(function (d) {
      return {
        date: parseDate(d[0]),
        close: d[1]
      };
    });

    // Setting axis domains
    x.domain(d3.extent(dataPrimary, function (d) { return d.date; }));
    y.domain(d3.extent(dataPrimary, function (d) { return d.close; }));

    // Finally adding the trend chart visualization
    svg.append('path')
      .datum(dataPrimary)
      .attr('class', 'primary-line')
      .attr('d', line);

    // Checking for secondary data array by the name trend2
    // If it is not present or has only one value, we exit from the function
    if(!insightData.metadata.advanced.trend2 || insightData.metadata.advanced.trend2.length < 2) {
      return;
    }

    // Convering the input data to the necessary object format
    const dataSecondary = insightData.metadata.advanced.trend2.map(function (d) {
      return {
        date: parseDate(d[0]),
        close: d[1]
      };
    });

    // Setting axis domains
    x.domain(d3.extent(dataSecondary, function (d) { return d.date; }));
    y.domain(d3.extent(dataSecondary, function (d) { return d.close; }));

    // Adding the secondary trend chart visualization to the same SVG
    svg.append('path')
      .datum(dataSecondary)
      .attr('class', 'secondary-line')
      .attr('d', line);

    // Responsiveness
    const aspect = width / height;
    d3.select(window)
      .on('resize', function () {
        if(lineChartItem) {
          const targetWidth = lineChartItem.offsetWidth - margin.left - margin.right;
          const targetHeight = (targetWidth / aspect) - margin.top - margin.bottom;
          svg.attr('width', targetWidth);
          svg.attr('height', targetHeight);
        }
      });
  }

  // Block to insert the confidence bar in case of proactive insight
  function insertConfidenceBar(insightData) {
    const confidenceBarId = 'confidence-' + insightData.id;

    const confidenceDiv = document.querySelector(`#${confidenceBarId}`);

    // We select the html element we are going to insert
    // the svg and remove all children
    d3.select(`#${confidenceBarId}`).html('');

    // Removing the icon inside radial progress bar
    if(confidenceDiv) {
      confidenceDiv.innerHTML = '';
    }

    // Exiting the function if confidence variable is not present
    if(!insightData || !insightData.metadata || !insightData.metadata.confidence) {
      return;
    }

    const confidenceValue = insightData.metadata.confidence;

    if(typeof (confidenceValue) !== 'number' && confidenceValue <= 100 && confidenceValue >= 0) {
      return;
    }
    // Inserting the icon inside the radial progress bar
    if(confidenceDiv) {
      confidenceDiv.innerHTML = '<img class="gaugeicon" src="/ui/vienna_images/insight_gauge.png"></i>';
    }

    // Function to insert radial progress bar
    function radialProgress(selector) {
      const parent = d3.select(selector);
      const size = {
        'width': 36,
        'height': 36
      };
      const svg = parent.append('svg')
        .attr('width', size.width)
        .attr('height', size.height);
      const outerRadius = Math.min(size.width, size.height) * 0.45;
      const thickness = 3;
      let value = 0;

      const mainArc = d3.svg.arc()
        .startAngle(0)
        .endAngle(Math.PI * 2)
        .innerRadius(outerRadius - thickness)
        .outerRadius(outerRadius);

      svg.append('path')
        .attr('class', 'progress-bar-bg')
        .attr('transform', `translate(${size.width / 2},${size.height / 2})`)
        .attr('d', mainArc());

      const mainArcPath = svg.append('path')
        .attr('class', 'progress-bar')
        .attr('transform', `translate(${size.width / 2},${size.height / 2})`);

      svg.append('circle')
        .attr('class', 'progress-bar')
        .attr('transform', `translate(${size.width / 2},${size.height / 2 - outerRadius + thickness / 2})`)
        .attr('width', thickness)
        .attr('height', thickness)
        .attr('r', thickness / 2);

      const end = svg.append('circle')
        .attr('class', 'progress-bar')
        .attr('transform', `translate(${size.width / 2},${size.height / 2 - outerRadius + thickness / 2})`)
        .attr('width', thickness)
        .attr('height', thickness)
        .attr('r', thickness / 2);

      return {
        update: function (progressPercent) {
          const startValue = value;
          const startAngle = Math.PI * startValue / 50;
          const angleDiff = Math.PI * progressPercent / 50 - startAngle;
          const startAngleDeg = startAngle / Math.PI * 180;
          const angleDiffDeg = angleDiff / Math.PI * 180;
          const transitionDuration = 0;

          mainArcPath.transition().duration(transitionDuration).attrTween('d', function () {
            return function (t) {
              mainArc.endAngle(startAngle + angleDiff * t);
              return mainArc();
            };
          });
          end.transition().duration(transitionDuration).attrTween('transform', function () {
            return function (t) {
              return `translate(${size.width / 2},${size.height / 2})` +
              `rotate(${(startAngleDeg + angleDiffDeg * t)})` +
              `translate(0,-${outerRadius - thickness / 2})`;
            };
          });
          value = progressPercent;
        }
      };
    }

    const chart = radialProgress(`#${confidenceBarId}`);
    chart.update(confidenceValue);
  }

  // Block to insert description in case of proactive insight
  function insertDescription(insightData) {
    const descriptionID = 'description-' + insightData.id;

    // Dangerously setting inner HTML to retain text formatting
    // such as bold. italics
    const descriptionDiv = document.querySelector(`#${descriptionID}`);
    if(descriptionDiv) {
      descriptionDiv.innerHTML = insightData.data.text;
    }
  }

  // Block to insert the bar charts in case of proactive insight
  function insertBarChart(insightData) {
    const barChartId = 'bar-chart-' + insightData.id;
    const barChartItem = document.querySelector(`#${barChartId}`);

    // We select the html element we are going to insert
    // the svg and remove all children
    d3.select(`#${barChartId}`).html('');

    // If advanced variable is not present, we are exiting from the function
    if(!insightData || !insightData.metadata || !insightData.metadata.advanced) {
      return;
    }

    // If bars key is not present or if we have no items, we are exiting from the function
    if(!insightData.metadata.advanced.bars || insightData.metadata.advanced.bars.length < 1) {
      return;
    }

    let data = insightData.metadata.advanced.bars;

    // Sort bars based on value
    data = data.sort(function (a, b) {
      return d3.ascending(a.value, b.value);
    });

    const margin = { top: 15, right: 60, bottom: 15, left: 60 };
    const parentWidth = barChartItem ? barChartItem.offsetWidth : 120;
    const width = parentWidth - margin.left - margin.right;
    const height = (data.length * 40) - margin.top - margin.bottom;

    // Appending SVG that contains the bar charts
    const svg = d3.select(`#${barChartId}`).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const x = d3.scale.linear()
      .range([0, width])
      .domain([0, d3.max(data, function (d) {
        return d.value;
      })]);

    const y = d3.scale.ordinal()
      .rangeRoundBands([height, 0], .1)
      .domain(data.map(function (d) {
        return d.name;
      }));

    //make y axis to show bar names
    const yAxis = d3.svg.axis()
      .scale(y)
      //no tick marks
      .tickSize(0)
      .orient('left');

    svg.append('g')
      .attr('class', 'insight-bar-y insight-bar-axis')
      .call(yAxis);

    // Appending bar charts
    const bars = svg.selectAll('.insight-bar')
      .data(data)
      .enter()
      .append('g');

    // Appending rects
    bars.append('rect')
      .attr('class', 'insight-bar')
      .attr('y', function (d) {
        return y(d.name);
      })
      .attr('height', '16px')
      .attr('x', 0)
      .attr('width', function (d) {
        return x(d.value);
      });

    //add a value label to the right of each bar
    bars.append('text')
      .attr('class', 'insight-bar-label')
      //y position of the label is halfway down the bar
      .attr('y', function (d) {
        return y(d.name) + 26 / 2;
      })
      //x position is 3 pixels to the right of the bar
      .attr('x', function (d) {
        return x(d.value) + 3;
      })
      .text(function (d) {
        return d.value;
      });
  }

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();
  // Returns HTML render for html Instght
  $scope.render = (a, b) => $sce.trustAsHtml(render(a, b));
  // Returns HTML render for Markdown Instght
  $scope.renderMd = (a, b) => $sce.trustAsHtml(markdownIt.render(render(a, b)));

  // This function will determine weather a reference link is present or not
  $scope.hasLink = function (refLink) {
    return (typeof refLink === 'string') || refLink.enabled;
  };

  // If all the configured insights in visualizaton has N.A.,
  // then show custom error message
  $scope.validateData = function (data) {
    let showNoDataToShow = true;
    data.forEach(insight => {
      // Check if the insight type is text
      if(insight.insightType === 'text') {
        if(insight.cardType === 'default') {
          // If the card type is default, make sure the list variable "value"
          // is not undefined or N.A
          if(typeof insight.metadata.value[0] !== 'undefined' && insight.metadata.value[0] !== 'N.A.') {
            showNoDataToShow = false;
          }
        } else {
          // If the card type is predictive or proactive, make sure the dict variable "advanced"
          // is not undefined or empty
          if(typeof insight.metadata.advanced !== 'undefined' && !_.isEmpty(insight.metadata.advanced)) {
            showNoDataToShow = false;
          }
        }
      }
      // Else check all the keys in Value object is N.A.
      else {
        let value;
        // eslint-disable-next-line guard-for-in
        for (value in insight.data) {
          if(insight.data[value] !== 'N.A.') {
            showNoDataToShow = false;
          }
        }
      }
    });
    return showNoDataToShow;
  };

  //Function to decide whether to show/hide a particular insight in Insight Vis
  $scope.showInsight = function (insight) {
    // Check if the insight type is text
    if(insight.insightType === 'text') {
      if(insight.cardType === 'default') {
        // If the card type is default, make sure the list variable "value"
        // is not undefined or N.A
        if(typeof insight.metadata.value[0] !== 'undefined' && insight.metadata.value[0] !== 'N.A.') {
          return true;
        }
      } else {
        // If the card type is predictive or proactive, make sure the dict variable "advanced"
        // is not undefined or empty
        if(typeof insight.metadata.advanced !== 'undefined' && !_.isEmpty(insight.metadata.advanced)) {
          return true;
        }
      }
    }
    // Else check all the keys in Value object is N.A.
    else {
      let value;
      // eslint-disable-next-line guard-for-in
      for (value in insight.data) {
        if(insight.data[value] !== 'N.A.')return true;
      }
    }
    return false;

  };

  // This function is called when the 'View More' link
  // in the metric visualization is clicked. This will
  // handle the redirection to a dashboard or events of
  // interest page based on users input to reference page.
  $scope.viewDashboardForThisMetric = function (refLink)
  {
    // If referenceLink is disabled then do nothing
    if (!$scope.hasLink(refLink)) {
      return;
    }

    let referencePage = '';

    if (typeof refLink === 'string') {
      // If the Dashboard name has a space in it. Replace the space with hyphen -
      refLink = refLink.split(' ').join('-');
      referencePage = prepareLinkInfo(
        'dashboard/',
        refLink,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        getAppState,
        Private,
        timefilter
      );
    } else if (refLink.type === 'dashboard') {
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
        timefilter
      );
    } else if (refLink.type === 'event') {
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
        timefilter
      );
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

    // If user hasn't configured bmv and insights yet, return
    if (!$scope.vis.params.bmv && !$scope.vis.params.insights) {
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

    // THis flag has been used to show loading as api is being called
    $scope.loadingInsights = true;

    const httpResult = $http.post(urlBase + '/insights/', body)
      .then((resp) => resp.data)
      .catch((resp) => {
        throw resp.data;
      });

    // Perform operation after getting response.
    httpResult.then(function (resp) {
      _.each(resp.insights, function (insight, index) {
        const idGenerator = htmlIdGenerator(); // Generating a unique ID to assign to the HTML elements for d3 to target
        insight.id = idGenerator();
        insight.cardType = body.insights[index].cardType;
        // Calling the functions to draw charts and bars after a delay to make sure
        // the element is present when d3 starts execution
        setTimeout(function () {
          insertConfidenceBar(insight);
          insertDescription(insight);
          insertLineChart(insight);
          insertBarChart(insight);
        }, 300);
      });
      $scope.isLoaded = true;
      $scope.data = resp.insights;
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
