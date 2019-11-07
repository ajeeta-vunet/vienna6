import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import angular from 'angular';
require('../../insight_vis/directives/insight_config_container_directive');

const chrome = require('ui/chrome');
import d3 from 'd3';
require('./bullet.js');

// get the kibana/bullet_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/bullet_vis', ['kibana']);

module.controller('bulletVisController', function ($scope, $element, Private, Notifier, $http, $rootScope,
  timefilter) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  // It prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    const bullets = $scope.vis.params.bullets;
    const insights = $scope.vis.params.insights;

    const body = {
      bmv: bullets || '',
      time: {},
      insights: insights || [],
      request_type: 'bullet',
      esFilter: esFilter,
    };

    // get the selected time duration from time filter
    const timeDuration = timefilter.getBounds();
    const timeDurationStart = timeDuration.min.valueOf();
    const timeDurationEnd = timeDuration.max.valueOf();

    body.time = {
      'gte': timeDurationStart,
      'lte': timeDurationEnd
    };

    // To Make API call
    const httpResult = $http.post(urlBase + '/insights/', body)
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

      // Function to prepare bulletChart instance.
    const prepareBulletInstance = function (bulletConfig, respDict, bulletChartData, key, bulletKey) {
      // Instance of bullet graph.
      const bulletDict = {};
      bulletDict.threshold = [];

      // If result is N.A. then consider value as 0.
      bulletDict.currentMetric = respDict.metrics[bulletConfig.metric].value !== 'N.A.' ?
        [respDict.metrics[bulletConfig.metric].value] : [0];

      // If result is N.A. then consider value as 0.
      bulletDict.maxMetric = respDict.metrics[bulletConfig.maxMetric].value !== 'N.A.' ?
        [respDict.metrics[bulletConfig.maxMetric].value] : [0];

      // Title for bullet graph.
      bulletDict.title =  key;

      // Bullet graph color.
      bulletDict.barColor = bulletConfig.color;

      // Update range with threshold if configured in BMV.
      if (respDict.metrics[bulletConfig.metric].threshold && respDict.metrics[bulletConfig.metric].threshold.length > 0) {
        respDict.metrics[bulletConfig.metric].threshold.map(range => {
          // Update range with threshold value if max value of threshold is less than max metric value.
          if (!(bulletDict.threshold.includes(range.max)) && bulletDict.maxMetric[0] > range.max) {
            bulletDict.threshold.push(range.max);
          } else if (!(bulletDict.threshold.includes(bulletDict.maxMetric[0])) && bulletDict.maxMetric[0] < range.max) {
            // If max value of threshold is greater than max metric value update range with max metric value.
            bulletDict.threshold.push(bulletDict.maxMetric[0]);
          }

        });
      } else if (!(bulletDict.threshold.includes(bulletDict.maxMetric[0]))) {
        // Update range with max metric value if threshold is not configured in BMV.
        bulletDict.threshold.push(bulletDict.maxMetric[0]);
      }

      // Update bulletChartData object with list of bullet objects.
      if (bulletChartData.hasOwnProperty(bulletKey)) {
        bulletChartData[bulletKey].push(bulletDict);
      } else {
        bulletChartData[bulletKey] = [bulletDict];
      }

    };

    // Perform operation after getting response.
    httpResult.then(function (resp) {

      // Get the length of response for displaying No
      // Results Found message if responseLength is <=0 .
      $scope.reponseLength = Object.keys(resp.bmv).length;
      const insightsData = resp.insights;
      const respDict = resp.bmv;

      // BuletChart data.
      const bulletChartData = {};

      // This function is used to prepare the bulletChartData objects which is having
      // key and value with list of bullets belongs to that key.
      const prepareBulletList = function (bulletKey, respDict, bulletConfig, bulletChartData) {
        // Iterate through respDict
        for (const key in respDict) {
          if (respDict.metrics) {
            // If buckects is not configured.
            prepareBulletInstance(bulletConfig, respDict, bulletChartData, key, bulletKey);
          } else if (respDict[key].metrics) {
            // If object in a list has metrics then prepare a bullet list (For single bucket level).
            prepareBulletInstance(bulletConfig, respDict[key], bulletChartData, key, bulletKey);
          } else if (!respDict[key].metrics) {
            delete respDict[key].fieldName;
            // Calls a prepareBulletList (recursive function) until it finds metrics.
            prepareBulletList(key, respDict[key], bulletConfig, bulletChartData);
          }
        }
      };

      // Create bullet graph with configured bullets
      $scope.vis.params.bullets.map((bulletConfig)  => {
        // call prepareBulletList to prepare bulletList.
        prepareBulletList(bulletConfig.name.title, respDict[bulletConfig.name.title], bulletConfig, bulletChartData);
      });

      // Update bulletDescription field in bulletChartData
      // if insights are configured to show description against each bullet graph
      insightsData.map(insight => {
        // For each group of bullets.
        for (const bullet in bulletChartData) {
          if (bulletChartData.hasOwnProperty(bullet)) {
            for (const insightKey in insight.data) {
              if (insight.data.hasOwnProperty(insightKey)) {
                // map the title for each group of bullets.
                if (insightKey === bullet) {
                  // Iterate through each bullet in group of bullets and update the bulletDescription by maping bullet title with insight.
                  bulletChartData[bullet].map(bulletBucketData => {
                    if (insight.data[insightKey][bulletBucketData.title] && insight.data[insightKey][bulletBucketData.title]) {
                      bulletBucketData.bulletDescription = insight.data[insightKey][bulletBucketData.title].TEXT;
                    } else {
                      bulletBucketData.bulletDescription = '';
                    }
                  });
                }
              }
            }
          }}
      });

      let margin;
      let width;
      let height;
      // let totalheight;
      let chart;
      let totalwidth;

      // Initialize totalwidth and totalheight by taking element's width and height.
      angular.element(document).ready(function () {

        if($scope.vis.params.isVertical) {
          // Comented code for Vertical
          // totalwidth = document.getElementById('bullet-vis-container').offsetWidth;
          // totalheight = ((document.getElementById('bullet-vis-container').offsetHeight === 0)) ?
          //   450 : document.getElementById('bullet-vis-container').offsetHeight;
        } else {
          // For horizontal graph.
          totalwidth = document.getElementById('bullet-vis-container').offsetWidth;
          // totalheight = ((document.getElementById('bullet-vis-container').offsetHeight === 0)) ?
          //   300 : document.getElementById('bullet-vis-container').offsetHeight;
        }
      });

      if ($scope.vis.params.isVertical) {
        // Comented code for Vertical
        // margin = { top: 50, right: 40, bottom: 100, left: 120 };
        // width = 192 - margin.left - margin.right;
        // height = totalheight - margin.top - margin.bottom;
        // chart = d3.bulletChart()
        //   .orient('bottom')
        //   .width(width)
        //   .height(height);

      } else {
        // chart for horizontal graph, margin values is for text to append title and max value.
        margin = { top: 8, right: 150, bottom: 20, left: 160 };
        width = totalwidth - margin.left - margin.right;
        // We are fixing the height for horizontal.
        height = 20;
        // Horizontal chart.
        chart = d3.bulletChart()
          .orient('left')
          .width(width)
          .height(height);
      }

      // Function to wrap the long text if it is more than width
      // and append in tspan to text element.
      function wrap(text, width) {
        text.each(function () {
          text = d3.select(this);
          const words = text.text().split(/\s+/).reverse();
          let word;
          let line = [];
          const y = text.attr('y');
          const dy = parseFloat(text.attr('dy'));
          let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            // Create a new tspan if number of characters is more than the width.
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(' '));
              line = [word];
              tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', 1.4 + 'em').text(word);
            }
          }
        });
      }

      // Create div element for tooltip to append graph.
      const div = d3.select($element[0]).append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      // To remove all child elements.
      document.getElementById('bullet-vis-container').innerHTML = '';

      // Iterate through bulletChartData to display bullet graph.
      for (const bullet in bulletChartData) {
        if (bulletChartData.hasOwnProperty(bullet)) {
          // Create element for each bullet graph and append as child to div element.
          // Add id attribute to each element.
          const element = document.createElement('div');
          element.id = 'bullet' + bullet;

          // Create titleElement to display title for group of bullets.
          const titleElement = document.createElement('div');

          if (titleElement.id !== 'bullet' + bullet) {
            titleElement.id = 'bullet' + bullet;
            titleElement.classList.add('title-element');
            titleElement.innerHTML = bullet;
          }

          const documentElement = document.getElementById('bullet-vis-container');

          // Append titleElement and element as chield elements to
          // documentElement element(container element).
          documentElement.appendChild(titleElement);
          documentElement.appendChild(element);

          // Remove all svg before updating svg elements.
          d3.select(element).selectAll('svg').remove();

          // pass bullet json to d3 create bullet graph.
          const svg = d3.select(element).selectAll('svg').data(bulletChartData[bullet])
            .enter().append('svg')
            .attr('class', 'bullet')
            .attr('width', totalwidth)
            .attr('height', height);

          svg.append('g')
            .on('mouseover', function (d) {
              // Append tooltip for each bullet graph by taking height and width.
              div.transition()
                .duration(200)
                .style('opacity', .9);
              div.html('Current Value: ' + d.currentMetric +  '<br/>' + 'Max Value: ' + d.maxMetric)
                .style('left', (d3.mouse(element)[0]) + 'px')
                .style('top', (d3.event.clientY - 140) + 'px');
            }).on('mouseout', function () {
              div.transition()
                .duration(200)
                .style('opacity', 0);
            })
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').call(chart);


          // Get the height and width using bbox to update
          // while dragging the container(in dashboard).
          const bboxValues =  svg.node().getBBox();

          if ($scope.vis.params.isVertical) {
            // Comented code for Vertical
            // d3.select(element).selectAll('svg').attr('width', (bboxValues.width + margin.left + margin.right)  + 'px')
            //   .attr('height', ((bboxValues.height + margin.top + margin.bottom)) + 'px');
          } else {
            // update height and width while resizing( dragging in dashboard) the contaner element.
            d3.select(element).selectAll('svg').attr('width', (bboxValues.width + margin.left + margin.right)  + 'px')
              .attr('height', ((bboxValues.height + margin.top + margin.bottom)) + 'px');
          }

          // Create title for svg.
          let title;
          let tailInfo;
          let subtext;
          const maxWidth = width + 165;
          // const maxHeight = height - 390;
          if ($scope.vis.params.isVertical) {
            // Comented code for Vertical
            // title = svg.append('g')
            //   .style('text-anchor', 'end')
            //   .attr('transform', 'translate(' + width  + ',' + (height + 20) + ')');
            // tailInfo = svg.append('g')
            //   .attr('text-anchor', 'start')
            //   .attr('transform', 'translate(' + width + 80 + ',' + maxHeight + ')');

            // subtext = svg.append('g')
            //   .attr('text-anchor', 'start')
            //   .attr('transform', 'translate(' + width + 80 + ',' + maxHeight + ')');
          } else {
            //Commented is for horizontal.
            title = svg.append('g')
              .style('text-anchor', 'end')
              .attr('transform', 'translate(170,' + height / 2 + ')');

            tailInfo = svg.append('g')
              .attr('text-anchor', 'start')
              .attr('transform', 'translate(' +  maxWidth + ',' + height / 2 + ')');

            subtext = svg.append('g')
              .attr('text-anchor', 'start')
              .attr('transform', 'translate(' +  maxWidth + ',' + height / 2 + ')');
          }

          // For title in each bullet graph
          title.append('text')
            .attr('class', 'title')
            .attr('dx', '-1em')
            .attr('dy', '1em')
            .text(function (d) { return d.title; });

          // For max value(comparative value) in each bullet graph
          tailInfo.append('svg:text')
            .attr('class', 'title')
            .attr('dx', '0em')
            .attr('dy', '0.5em')
            .text(function (d) { return d.maxMetric; });

          // For description in each bullet graph, description
          // will wrap using (wrap function) if it cross 130 characters.
          subtext.append('svg:text')
            .attr('class', 'subtitle')
            .attr('dx', '0em')
            .attr('dy', '2.5em').text(function (d) {
              return d.bulletDescription ? d.bulletDescription : '';
            }).call(wrap, 130);

          // This provides color selected by user
          // to fill bullet bar
          d3.select(element).selectAll('.bullet .measure.s0')
            .data(bulletChartData[bullet])
            .style('fill', (d) => {
              return d.barColor;
            });
        }
      }
    });

  };


  // This is bad, there should be a single event that triggers a refresh of data.
  // When there is a change in business metric vis configuration
  $scope.$watchMulti(['vis.params.bullets', 'vis.params.insights'], $scope.search);

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);
});
