import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';

const chrome = require('ui/chrome');
const _ = require('lodash');

// get the kibana/unified_transaction_map_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/unified_transaction_map_vis', ['kibana']);

module.controller('utmVisController', function ($scope, Private, Notifier, $http, $rootScope,
  timefilter) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);


  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  // Function to update Node's new X and Y values.
  $scope.onNodeDragEnd = function (positions, nodes) {
    _.each(nodes, function (node) {
      _.each(positions, function (position, nodeIndex) {
        if (node.id === nodeIndex) {
          node.X = position.x;
          node.Y = position.y;
        }
      });
    });
    // Broadcase an event with new nodes information.
    // This event updates node's X and Y value with new positions.
    $rootScope.$broadcast('vusop:utmMapData', nodes);
  };

  // Set the 4 colors to display nearest color.
  const colors = {
    black: '#000',
    orange: '#FFA500',
    green: '#008000',
    red: '#F00'
  };

  // sets the nearest color.
  const getNearestColor = require('nearest-color').from(colors);

  // returns the label having label name and metric with
  // color coming from nearest color.
  $scope.createLabel = function (labelname, metric, color) {
    let label = '';

    // For physicsAndDragNDrop nodePlacementType(graph) always return label with <code>
    if ($scope.nodePlacementType === 'physicsAndDragNDrop') {
      return ('\n<code>' +  labelname + ': ' + metric + '</code>');
    }

    // For custom nodes and links label will be displayed with color code.
    if (color.name === 'black') {
      label = '\n<code>' +  labelname + ': ' + metric + '</code>';
    } else if (color.name === 'green') {
      label = '\n<i>' + labelname + ': ' + metric + '</i>';
    } else if (color.name === 'orange') {
      label = '\n<b>' + labelname + ': ' + metric + '</b>';
    } else if (color.name === 'red') {
      label = '\n<b><i>' + labelname + ': ' + metric + '</i></b>';
    }
    return label;
  };

  // gets the metric list and sets label and metric color.
  // returns an object with hover and nonhover metric list.
  // Input: metricList - list  of
  //      [{placement: "Down", onHover: "False", color: "#678a6b", metric: "426", label: "count"}]
  // Output:Ex- {hover: "<i>Average of documents: 109.09</i>",
  //         noHover: "<b>count: 438</b><b>bmv 1 average: 2587.71</b>"}
  $scope.getMetricLabel = function (metricList) {
    let labelListForHover = '';
    let  labelListForGraph = '';
    let metricLabel = '';

    _.each(metricList, function (metric) {
      const color =  getNearestColor(metric.color);
      metricLabel =  $scope.createLabel(metric.label, metric.formattedValue, color);

      // If onHover selects true then add metric with labelListForHover.
      if (metric.onHover === 'True') {
        labelListForHover = labelListForHover + metricLabel;
      } else {
        // If onHover selects false then add metric with  labelListForGraph.
        labelListForGraph =  labelListForGraph + metricLabel;
      }
    });

    // create an object with hover and noHover list.
    const  allMetricLabels = {
      hover: labelListForHover,
      noHover: labelListForGraph
    };

    return  allMetricLabels;
  };

  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    /* To pass node placement type to the vis-map directive.
     * For custom nodes and links pass dragNDrop and for
     * graph pass physicsAndDragNDrop.
     */
    if ($scope.vis.params.customNodes.length > 0) {
      $scope.nodePlacementType = 'dragNDrop';
    } else if ($scope.vis.params.graphs.length > 0) {
      $scope.nodePlacementType = 'physicsAndDragNDrop';
    }

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    const customNodes = $scope.vis.params.customNodes;
    const customLinks = $scope.vis.params.customLinks;
    const graphs = $scope.vis.params.graphs;
    const body = {
      customNodes: customNodes || '',
      customLinks: customLinks || '',
      graphs: graphs || '',
      time: {},
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

    // POST call to the backend to get necessary information and
    // prepare the business metric vis.
    // Response from backend should be :
    // 'nodes': [{
    //   'id': 1,
    //   'font': {
    //     'multi': 'html'
    //   },
    //  'label': [Node1, [{metric: val, color: #0D8EFF, historicalData: {percentage:
    //                                         //inPercent, value: val, label: name}}]
    //   'group': 'Router',
    //   'x': '-848',
    //   'y': '-141'
    // }],
    // 'edges': [{
    //   'id': 1,
    //   'from': 2,
    //   'to': 1,
    //   'label': [Link1, [{metric: val, color: #0D8EFF, historicalData: {percentage:
    //                                         //inPercent, value: val, label: name}}]
    //   'font': {
    //     'multi': 'html'
    //   }
    // }]
    const httpResult = $http.post(urlBase + '/utMap/', body)
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    // Perform operation after getting response.
    httpResult.then(function (resp) {
      _.each (resp, function (res) {
        _.each (res, function (resource) {
          let label = '';
          let isNode = false;

          // If color is other than black or blue then link is colored based on color coming
          // from the  back end.
          if(resource.color && resource.color !== '#0D8EFF' && resource.color !== 'black') {
            resource.color = getNearestColor(resource.color).name;
          }

          // display dashed lines for link_type is local.
          if (resource.link_type === 'local') {
            resource.dashes = true;
          }

          // Check resource is node or label
          // if it is node then set isNode to true.
          // This is to display resource label for node.
          // For link resource label won't be displayed.
          if((resource.x && resource.y) || (resource.x === 0 && resource.y === 0)) {
            isNode = true;
          }

          // Check if metric is configured for node or link.
          if (resource.label[1] !== undefined) {

            // Check metric value is coming or not.
            // And create a label for that node or link.
            if (resource.label[1][0].formattedValue) {
              label = $scope.getMetricLabel(resource.label[1]);

              // Show metrics On Hover
              if (label.hover.length > 0) {
                // This has to be styled properly.
                // Will take care this in next ER.
                resource.title =  '<p>' + label.hover + '</p>';
              }

              // For Node display name and metrics
              // else display only metrics
              if (isNode === true) {
                resource.label = resource.label[0] + label.noHover;
              } else {
                resource.label = label.noHover;
              }
            }
          } else if(isNode === true) {
            // Display labe name and metrics if it is node
            // else display only metrics
            resource.label = resource.label[0];
          } else {
            resource.label = '';
          }

        });
      });
      $scope.data = resp;
    });

  };


  // This is bad, there should be a single event that triggers a refresh of data.
  // When there is a change in business metric vis configuration
  $scope.$watchMulti(['vis.params.customNodes', 'vis.params.customLinks', 'vis.params.graphs'], $scope.search);

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);
});
