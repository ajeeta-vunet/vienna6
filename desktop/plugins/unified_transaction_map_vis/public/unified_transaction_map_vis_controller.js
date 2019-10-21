import { uiModules } from 'ui/modules';
import $ from 'jquery';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { colors } from 'ui/utils/severity_colors.js';
import { viewDashboardOrEventForThisMetric } from 'ui/utils/view_dashboard_or_event_for_this_metric.js';

const chrome = require('ui/chrome');
const _ = require('lodash');

// get the kibana/unified_transaction_map_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/unified_transaction_map_vis', ['kibana']);

module.controller('utmVisController', function ($scope, Private, Notifier, getAppState, $http, $rootScope,
  timefilter, kbnUrl) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  // Returns the params for the selected node by mapping the id
  // There are two kinds of nodes. parentNode(node) and childNode (nodeGroup)
  // We also return a boolean to detect if provided nodeId is parentNode or not
  const getNodeParams = (dataSet, selectedNodeId) => {
    let isParentNode = false;
    const selectedNodeParams = _.find(dataSet, (node) => {
      // If a node is selected we can easily get the nodeParams by mapping the id
      if (node.id === selectedNodeId) {
        isParentNode = true;
        return true;
      }
      // If a nodeGroup or nodeGroup is selected we need to iterate over the nodeGroups of
      // all the nodes to get the nodeParams
      return _.find(node.metric_groups, (metricGroup) => {
        return metricGroup.id === selectedNodeId || metricGroup.statusIcon.id === selectedNodeId;
      });
    });
    return {
      selectedNodeParams,
      isParentNode
    };
  };

  // when a node is dragged we select its respective groups as well
  // when a group is selected we select all groups belonging to that node
  // All selected items are moved during the drag event
  $scope.onNodeDragStart = (draggedNodeId) => {
    const dataSet = $scope.data.nodes;
    const metricGroupIds = [];

    // Get the params of the selected node from the dataSet
    const { selectedNodeParams, isParentNode } = getNodeParams(dataSet, draggedNodeId);

    if (selectedNodeParams && selectedNodeParams.metric_groups) {
      _.each(selectedNodeParams.metric_groups, (metricGroup) => {
        metricGroupIds.push(metricGroup.id);
        metricGroupIds.push(metricGroup.statusIcon.id);
      });
      if (isParentNode) {
        metricGroupIds.push(selectedNodeParams.id);
      }
      return {
        'action': 'selectNodes',
        'val': metricGroupIds
      };
    }
  };

  // Function to update Node's new X and Y values.
  $scope.onNodeDragEnd = (draggedNodeList, nodePositions) => {
    // We generate a object containing id, X, Y
    // position for all nodes which have dragged
    const updatedNodePositions = [];
    _.each(draggedNodeList, (nodeId) => {
      const obj = {};
      const node = nodePositions[nodeId];
      if (node) {
        obj.id = nodeId;
        obj.x = node.x;
        obj.y = node.y;
        updatedNodePositions.push(obj);
      }
    });

    // There are two kinds of nodes. parentNode(node) and childNode (nodeGroup)
    // We append parentId property to ChildNodes to identify their parent
    // We append parentMetricGroupId property to ChildNode's icon to identify which node's icon they are
    _.each(updatedNodePositions, (updatedNode) => {
      const nodeParams = _.find($scope.processedData.nodes, (node) => {
        return node.id === updatedNode.id;
      });
      if (nodeParams && nodeParams.parentId) {
        updatedNode.parentId = nodeParams.parentId;
      }
      if (nodeParams && nodeParams.parentMetricGroupId) {
        updatedNode.parentMetricGroupId = nodeParams.parentMetricGroupId;
      }
    });
    // Broadcast an event to visParams controller to update node positions
    $rootScope.$broadcast('vusop:utmUpdateDataOnDrag', updatedNodePositions);
  };

  $scope.toggleSidebar = false;

  $scope.metricDrillDown = (refLink) => {
    viewDashboardOrEventForThisMetric(getAppState, Private, timefilter, kbnUrl, refLink);
  };

  // We align the nodes groups below their respective nodes where required
  // We obtain the 'X' and 'Y' positions of all nodes and generate an object of the following format
  // "allNodes" : [
  //   {
  //     "id": "n1",
  //     "x": -203,
  //     "y": -18,
  //     "metric_groups": [
  //       {
  //         "id": "n1 + BMV_rtt",
  //         "x": -203,
  //         "y": 42
  //         "statusIcon" : {
  //           "id": "n1 + BMV_rtt" + icon,
  //           "x": -193,
  //           "y": 42
  //         }
  //       }
  //     ]
  //   },
  // ]
  // finally allNodes is then saved to visParams
  $scope.onNetworkStabilized = (nodePositions) => {
    const dataSet = $scope.data.nodes;
    const allNodes = [];
    const nodesToMove = [];

    _.each(dataSet, (node) => {
      let metricGroupList = [];
      let offset = 80;
      const pos = nodePositions[node.id];
      const parentNodeId = node.id;
      const parentNodeX = pos.x;
      const parentNodeY = pos.y;

      // We find out if a existing metricGroup has been removed
      // We do this by checking if the length of the metric_groups array has changed
      let metricGroupLengthFlag = false;
      const visParamNode = _.find($scope.vis.params.allNodes, (visParamNode) => {
        return visParamNode.id === parentNodeId;
      });
      if (visParamNode && visParamNode.metric_groups.length !== node.metric_groups.length) {
        metricGroupLengthFlag = true;
      }

      // We align the metricGroups below its node in the following cases
      // 1) If a new node has been added
      // 2) For an existing node, if a new metricGroup has been added or existing metricGroup has been removed
      // 3) If new icons have been added

      // If none of these conditions are satisfied no algining is done
      // and we take the already existing 'X' and 'Y' positions
      _.each(node.metric_groups, (metricGroup) => {
        if ((metricGroup.x === 0 && metricGroup.y === 0) || metricGroupLengthFlag ||
            (metricGroup.statusIcon.x === 0 && metricGroup.statusIcon.y === 0)) {
          metricGroupList = [];
          // If any of above conditions are satisfied we need to reiterate over all the metricGroups
          // and realign all the metricGroups below their node
          _.each(node.metric_groups, (group) => {
            const groupNodeId = group.id;
            const groupNodeX = parentNodeX;
            const groupNodeY = parentNodeY + offset;

            const groupIconId = group.statusIcon.id;
            const groupIconX = groupNodeX - 120;
            const groupIconY = groupNodeY;

            nodesToMove.push({ id: groupNodeId, x: groupNodeX, y: groupNodeY });
            nodesToMove.push({ id: groupIconId, x: groupIconX, y: groupIconY });

            metricGroupList.push({
              'id': groupNodeId,
              'x': groupNodeX,
              'y': groupNodeY,
              'statusIcon': {
                'id': groupIconId,
                'x': groupIconX,
                'y': groupIconY
              }
            });
            offset += 35;
          });
          return false;
        }
        metricGroupList.push({
          'id': metricGroup.id,
          'x': metricGroup.x,
          'y': metricGroup.y,
          'statusIcon': {
            'id': metricGroup.statusIcon.id,
            'x': metricGroup.statusIcon.x,
            'y': metricGroup.statusIcon.y
          }
        });
      });

      allNodes.push({
        'id': parentNodeId,
        'x': parentNodeX,
        'y': parentNodeY,
        'metric_groups': metricGroupList
      });
    });

    // Broadcast an event to visParams controller to initialise all node's X and Y values
    $rootScope.$broadcast('vusop:utmInitData', allNodes);
    return {
      'action': 'moveNode',
      'val': nodesToMove
    };
  };

  // On select of node we prepare the required data for displaying the sidebar
  // Sidebar displays node specific details
  $scope.onNodeSelect = (selectedNodeId, nodeImageGroups) => {
    const dataSet = $scope.data.nodes;

    // Get the params of the selected node from the dataSet
    const { selectedNodeParams } = getNodeParams(dataSet, selectedNodeId);

    // We generate successCount and failureCount for every metricGroup
    _.each(selectedNodeParams.metric_groups, (metricGroup) => {
      metricGroup.successCount = 0;
      metricGroup.failureCount = 0;
      _.each(metricGroup.metricList, (metric) => {
        // If metric color is green we increment the success count
        if (metric.color === colors.green) {
          metricGroup.successCount++;
        }
        else {
          metricGroup.failureCount++;
        }
      });
    });
    // Get image to be displayed on the sidebar
    if (nodeImageGroups[selectedNodeParams.group]) {
      selectedNodeParams.imagePath = nodeImageGroups[selectedNodeParams.group].image;
    }
    selectedNodeParams.borderColor = selectedNodeParams.color.border;
    selectedNodeParams.isNode = true;
    $scope.selectedNodeParams = selectedNodeParams;
    $scope.toggleSidebar = true;
    $scope.$apply();

    // If a node is clicked we highlight the clicked node and highlight all metricGroups belonging to that node
    // If a metricGroup is clicked we identify which node this metricGroup belongs to
    // and highlight all metricGroups belonging to that node
    const metricGroupIds = [selectedNodeId];
    if (selectedNodeParams.id === selectedNodeId) {
      _.each(selectedNodeParams.metric_groups, (metricGroup) => {
        metricGroupIds.push(metricGroup.id);
        metricGroupIds.push(metricGroup.statusIcon.id);
      });
    }
    return {
      'action': 'selectNodes',
      'val': metricGroupIds
    };
  };

  // On select of link we prepare the required data for displaying the sidebar
  // Sidebar displays link specific details
  $scope.onLinkSelect = (selectedEdgeId) => {
    const dataSet = $scope.data.edges;

    // Get the params of the selected node from the dataSet
    const selectedEdgePrams = _.find(dataSet, (edge) => {
      return edge.id === selectedEdgeId;
    });

    _.each(selectedEdgePrams.metric_groups, (metricGroup) => {
      metricGroup.successCount = 0;
      metricGroup.failureCount = 0;

      _.each(metricGroup.metricList, (metric) => {
        // If metric color is green we increment the success count
        if (metric.color === colors.green) {
          metricGroup.successCount++;
        }
        else {
          metricGroup.failureCount++;
        }
      });

    });

    selectedEdgePrams.borderColor = selectedEdgePrams.color;
    selectedEdgePrams.imagePath = '/ui/vienna_images/link_image_utm.svg';
    selectedEdgePrams.isNode = false;
    $scope.selectedNodeParams = selectedEdgePrams;
    $scope.toggleSidebar = true;
    $scope.$apply();
  };

  // Update toggleSidebar flag used to show/hide sidebar
  $scope.hideSidebar = () => {
    $scope.toggleSidebar = false;
  };

  // On Node or edge deselect if no items are selected we hide sidebar
  $scope.onItemDeselect = (deselectedItemList) => {
    if (deselectedItemList && deselectedItemList.length === 0) {
      $scope.hideSidebar();
    }
    $scope.$apply();
  };

  // Hide side bar when node is de-selected
  $scope.onNodeDeselect = (deselectedNodeList) => {
    $scope.onItemDeselect(deselectedNodeList);
  };

  // Hide side bar when edge is de-selected
  $scope.onEdgeDeselect = (deselectedEdgeList) => {
    $scope.onItemDeselect(deselectedEdgeList);
  };

  // following methods are passed to vis_map
  // these methods are invoked on occurance of various events in the UTM
  $scope.utmEventArgs = {
    onNodeSelect: $scope.onNodeSelect,
    onLinkSelect: $scope.onLinkSelect,
    onEdgeDeselect: $scope.onEdgeDeselect,
    onNodeDeselect: $scope.onNodeDeselect,
    onNodeDragStart: $scope.onNodeDragStart,
    onNodeDragEnd: $scope.onNodeDragEnd,
    onNetworkStabilized: $scope.onNetworkStabilized,
  };

  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {
    // Hide the sidebar
    $scope.hideSidebar();

    // Function to set the font for responsive design
    // If the visualisation is resized we need the sidebar to be responsive as well
    // We adjust font of sidebar according to size of visualisation
    const utmVisContainerWidth = $('.utm-vis-container').width();
    if(utmVisContainerWidth >= 500 && utmVisContainerWidth <= 600) {
      $scope.sidebarFontSize = '10px';
    } else if(utmVisContainerWidth >= 600 && utmVisContainerWidth <= 700) {
      $scope.sidebarFontSize = '11px';
    } else if(utmVisContainerWidth >= 700 && utmVisContainerWidth <= 850) {
      $scope.sidebarFontSize = '12px';
    } else if(utmVisContainerWidth >= 850 && utmVisContainerWidth <= 1000) {
      $scope.sidebarFontSize = '13px';
    } else if(utmVisContainerWidth >= 1000 && utmVisContainerWidth <= 1200) {
      $scope.sidebarFontSize = '14px';
    } else if(utmVisContainerWidth >= 1200 && utmVisContainerWidth <= 1300) {
      $scope.sidebarFontSize = '15px';
    } else if(utmVisContainerWidth >= 1300 && utmVisContainerWidth <= 1400) {
      $scope.sidebarFontSize = '16.5px';
    } else if(utmVisContainerWidth >= 1400 && utmVisContainerWidth <= 1550) {
      $scope.sidebarFontSize = '17px';
    } else if(utmVisContainerWidth >= 1550 && utmVisContainerWidth <= 1750) {
      $scope.sidebarFontSize = '18px';
    }

    /* To pass node placement type to the vis-map directive.
     * For custom nodes and links, graph pass physicsAndDragNDrop.
     */

    // If allnodes defined in visParams is of length 0 then use physicsAndDragNDrop
    if (!$scope.vis.params.allNodes) {
      $scope.nodePlacementType = 'physicsAndDragNDrop';
    } else {
      $scope.nodePlacementType = 'dragNDrop';
    }

    let esFilter = dashboardContext();

    // Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    const customNodes = $scope.vis.params.customNodes;
    const customLinks = $scope.vis.params.customLinks;
    const allNodes = $scope.vis.params.allNodes ? $scope.vis.params.allNodes : [];
    const graphs = $scope.vis.params.graphs;
    const body = {
      customNodes: customNodes || '',
      customLinks: customLinks || '',
      graphs: graphs || '',
      time: {},
      esFilter: esFilter,
      allNodes: allNodes
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
    // 'nodes':[
    //   {
    //     'id':1,
    //     'font':{
    //       'multi':'html'
    //     },
    //     'label':Node1,
    //     'group':'Router',
    //     'x':'-848',
    //     'y':'-141'    'color':{
    //       'hover':{
    //         'border':'green'
    //       },
    //       'border':'green',
    //       'highlight':{
    //         'border':'green'
    //       }
    //     },
    //     'metric_groups':[
    //       {
    //         'x':-482,
    //         'y':-146,
    //         'success':true,
    //         'id':'n2 + BMV_rtt',
    //         'group':'metric',
    //         'font':{
    //           'color':'green'
    //         },
    //         'label':'BMV_rtt',
    //         'metricList':[
    //           {
    //             'formattedValue':'125',
    //             'visualization_name':'BMV_rtt',
    //             'value':'N.A.',
    //             'color':'green',
    //             'historicalData':[
    //               {
    //                 'percentageChange':165.71,
    //                 'reference':414.06,
    //                 'icon':'fa-caret-up',
    //                 'formattedValue':'1100.2',
    //                 'label':'Interval Last 90 Days',
    //                 'value':1100.2
    //               }
    //             ],
    //             'success':false,
    //             'status':1,
    //             'label':'Max RTT',
    //             'description':'blah',
    //             'visualization_type':'business_metric'
    //           },
    //         ],
    //       },
    //     ],
    //   }
    // ],
    // 'edges':[
    //   {
    //     'id':1,
    //     'from':2,
    //     'to':1,
    //     'label':[
    //       Link1,
    //       [
    //         {
    //           metric:'val',
    //           color:'#0D8EFF',
    //           historicalData:{
    //             percentage:'inPercent',
    //             value:'val',
    //             label:'name'
    //           }
    //         }
    //       ]
    //     ]    'font':{
    //       'multi':'html'
    //     }    'color':'green',
    //     'metric_groups':[
    //       {
    //         'x':-482,
    //         'y':-146,
    //         'success':true,
    //         'id':'n2 + BMV_rtt',
    //         'group':'metric',
    //         'font':{
    //           'color':'green'
    //         },
    //         'label':'BMV_rtt',
    //         'metricList':[
    //           {
    //             'formattedValue':'125',
    //             'visualization_name':'BMV_rtt',
    //             'value':'N.A.',
    //             'color':'green',
    //             'historicalData':[
    //               {
    //                 'percentageChange':165.71,
    //                 'reference':414.06,
    //                 'icon':'fa-caret-up',
    //                 'formattedValue':'1100.2',
    //                 'label':'Interval Last 90 Days',
    //                 'value':1100.2
    //               }
    //             ],
    //             'success':false,
    //             'status':1,
    //             'label':'Max RTT',
    //             'description':'blah',
    //             'visualization_type':'business_metric'
    //           },
    //         ],
    //       },
    //     ],
    //   }
    // ]
    const httpResult = $http.post(urlBase + '/utMap/', body)
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    // Perform operation after getting response.
    httpResult.then(function (resp) {
      // Process backend response to generate json in required format
      // processed data is fed into visMap to generate graphs
      const processData = (data) => {
        const additionalNodes = [];
        const processedData = JSON.parse(JSON.stringify(data));

        // Process edge data
        _.each(data.edges, function (edge) {
          // labels will not be displayed for edges
          edge.label = '';
          // We create a copy of metricGroup label, so later on we can truncate the label string
          _.each(edge.metric_groups, function (metricGroup) {
            metricGroup.labelUnformatted = metricGroup.label;
          });
        });

        // Process node data
        _.each(data.nodes, function (node) {
          if (node.metric_groups) {
            _.each(node.metric_groups, function (metricGroup) {
              const iconNode = {};

              // We create a copy of metricGroup label, so later on we can truncate the label string
              metricGroup.labelUnformatted = metricGroup.label;
              // If metricGroup's label is greater than 20 characters we truncate it to 18
              if (metricGroup.label.length > 20) {
                metricGroup.label = metricGroup.label.slice(0, 18) + '..';
              }

              // Add required properties for metricGroup
              metricGroup.parentId = node.id;
              metricGroup.statusIcon.id = metricGroup.id + ' +' + ' icon';

              // Add required properties for iconNode
              iconNode.parentId = node.id;
              iconNode.parentMetricGroupId = metricGroup.id;
              iconNode.id = metricGroup.statusIcon.id;
              iconNode.x = metricGroup.statusIcon.x;
              iconNode.y = metricGroup.statusIcon.y;

              // We display icon for each metricGroup based on its state
              switch (metricGroup.font.color) {
                case colors.green:
                  iconNode.group = 'iconGreen';
                  break;
                case colors.yellow:
                  iconNode.group = 'iconYellow';
                  break;
                case colors.orange:
                  iconNode.group = 'iconOrange';
                  break;
                case colors.red:
                  iconNode.group = 'iconRed';
                  break;
                default:
                  throw 'icon does not exist for the color ' + metricGroup.font.color;
              }
              metricGroup.font.color = 'black';

              additionalNodes.push(metricGroup);
              additionalNodes.push(iconNode);
            });
          }
        });
        _.each(additionalNodes, function (node) {
          processedData.nodes.push(node);
        });
        return processedData;
      };

      $scope.data = resp;
      $scope.processedData = processData(resp);
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
