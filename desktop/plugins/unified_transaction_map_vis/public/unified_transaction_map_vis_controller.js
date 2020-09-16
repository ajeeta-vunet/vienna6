import { uiModules } from 'ui/modules';
import $ from 'jquery';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { colors } from 'ui/utils/severity_colors.js';
import { viewDashboardOrEventForThisMetric } from 'ui/utils/view_dashboard_or_event_for_this_metric.js';
import { Notifier } from 'ui/notify/notifier';

const chrome = require('ui/chrome');
const _ = require('lodash');
const notify = new Notifier({ location: 'UTM' });

// get the kibana/unified_transaction_map_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/unified_transaction_map_vis', ['kibana']);

module.controller('utmVisController', function ($scope, Private, Notifier, getAppState, $http, $rootScope,
  timefilter, kbnUrl) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // UTM visualisation can be created using different templates
  // The following are the types of templates
  const templateTypes = {
    displayMetricGroups: 'Display Metric Groups',
    displayMetric: 'Display Metric'
  };

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();

  const nodesWithDashboardObj = {};
  // returns a boolean if a node has a dashboard configured
  $scope.doesNodeHasDashboard = (nodeId) => {
    return nodesWithDashboardObj.hasOwnProperty(nodeId);
  };

  // Returns the params for the selected node by mapping the id
  // There are two kinds of nodes. parentNode(node) and childNode (nodeGroup)
  // We also return a boolean to detect if provided nodeId is parentNode or not
  const getNodeParams = (dataSet, selectedId) => {
    let isParentNode = false;
    const selectedItemParams = _.find(dataSet, (node) => {
      // If a node is selected we can easily get the nodeParams by mapping the id
      if (node.id === selectedId) {
        isParentNode = true;
        return true;
      }

      // We need to identify selected-node using Id.
      // - We first check if its a metric-groups node or the icon node attached to metric groups.
      // - If we are using metrics template, we check the metric node and the icon nodes attached to the metric.
      return _.find(node.metric_groups, (metricGroup) => {

        // depending on the template we need to iteratre over metricGroups or metrics
        if ($scope.vis.params.utmTemplate === templateTypes.displayMetricGroups) {
          // check if selectedId is metricGroup's id or its icon id
          if (metricGroup.id === selectedId || metricGroup.statusIcon.id === selectedId) {
            return true;
          }
        } else {
          // check if selectedId is metric's id or metricLabel's id or its icon id
          return _.find(metricGroup.metricList, (metric) => {
            return metric.id === selectedId ||
              metric.statusIcon.id === selectedId ||
              metric.valueNode.id === selectedId;
          });
        }

      });
    });
    return {
      selectedItemParams,
      isParentNode
    };
  };

  // Given two numbers on a number line, we find the centre point
  // Eg: a = 6, b = 12, centrePoint = 9
  // Eg: a = -6, b = -12, centrePoint = -9
  // Eg: a = -6, b = 6, centrePoint = 0
  const getCenterPoint = (a, b) => {
    const absoluteDistance = Math.abs(a - b);
    const absoluteDistanceHalf = absoluteDistance / 2;
    return a < b ? a + absoluteDistanceHalf : b + absoluteDistanceHalf;
  };

  // given the data and the type (node/edge),
  // this function gives the parentNodeId, parentNodeX, parentNodeY and offSet
  // these are required to align metricGroup/metric below the respective parent node
  const getParentParamsForAlignemnt = (data, allNodePositions, type) => {
    let initialOffset = 110;
    let parentNodeId = undefined;
    let parentNodeX = undefined;
    let parentNodeY = undefined;

    if (type === 'node') {
      const pos = allNodePositions[data.id];
      parentNodeId = data.id;
      parentNodeX = pos.x;
      parentNodeY = pos.y;
    } else {
      // initial offset for link is 0
      initialOffset = 0;

      // link's from node
      const fromId = data.from;
      const fromPos = allNodePositions[fromId];
      const fromNodeX = fromPos.x;
      const fromNodeY = fromPos.y;

      // link's to node
      const toId = data.to;
      const toPos = allNodePositions[toId];
      const toNodeX = toPos.x;
      const toNodeY = toPos.y;

      parentNodeId = data.id;
      parentNodeX = getCenterPoint(fromNodeX, toNodeX);
      parentNodeY = getCenterPoint(fromNodeY, toNodeY);
    }

    return {
      parentNodeId,
      parentNodeX,
      parentNodeY,
      initialOffset
    };
  };

  // align MetricGroup's textNodes and iconNodes below it's respective node/edge
  const alignItemsForTemplateDisplayMetricGroups = (dataSet, allNodePositions, type, forceAlignFlag) => {
    const allItems = [];
    const itemsToMove = [];
    _.each(dataSet, (data) => {
      let metricGroupList = [];

      const {
        parentNodeId,
        parentNodeX,
        parentNodeY,
        initialOffset
      } = getParentParamsForAlignemnt(data, allNodePositions, type);

      let offset = initialOffset;
      let numMetricGroupChangeFlag = false;
      const visParamsAllItem = type === 'node' ? $scope.vis.params.allNodes : $scope.vis.params.allLinks;

      // We find out if a existing metricGroup has been removed
      // We do this by checking if the length of the metric_groups array has changed
      const visParamData = _.find(visParamsAllItem, (visParamItem) => {
        return visParamItem.id === parentNodeId;
      });
      if (visParamData && visParamData.metric_groups && visParamData.metric_groups.length !== data.metric_groups.length) {
        numMetricGroupChangeFlag = true;
      }

      // We align the metricGroups below its node in the following cases
      // 1) If a new node has been added
      // 2) For an existing node, if a new metricGroup has been added or existing metricGroup has been removed
      // 3) If new icons have been added

      // If none of these conditions are satisfied no algining is done
      // and we take the already existing 'X' and 'Y' positions
      _.each(data.metric_groups, (metricGroup) => {

        if ((metricGroup.x === 0 && metricGroup.y === 0) || numMetricGroupChangeFlag || forceAlignFlag) {
          metricGroupList = [];
          // If any of above conditions are satisfied we need to reiterate over all the metricGroups
          // and realign all the metricGroups below their node
          _.each(data.metric_groups, (group) => {

            // offset calculations
            const groupIconOffset = ((group.widthConstraint / 2) + 35);

            // align groupNode below node
            const groupNodeId = group.id;
            const groupNodeX = parentNodeX;
            const groupNodeY = parentNodeY + offset;

            // align groupIcon to the left side of groupNode
            const groupIconId = group.statusIcon.id;
            const groupIconX = groupNodeX - groupIconOffset;
            const groupIconY = groupNodeY;

            // after calculating postions push them into 'itemsToMove' array
            itemsToMove.push({ id: groupNodeId, x: groupNodeX, y: groupNodeY });
            itemsToMove.push({ id: groupIconId, x: groupIconX, y: groupIconY });

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
          },
          'metricList': []
        });
      });

      allItems.push({
        'id': parentNodeId,
        'x': parentNodeX,
        'y': parentNodeY,
        'metric_groups': metricGroupList
      });
    });

    return { allItems, itemsToMove };
  };

  // align Metric's textNodes and iconNodes below it's respective node/edge
  const alignItemsForTemplateDisplayMetric = (dataSet, allNodePositions, type, forceAlignFlag) => {
    const allItems = [];
    const itemsToMove = [];
    _.each(dataSet, (data) => {
      const metricGroupList = [];
      const allMetrics = [];
      const metricGroupListObj = {};

      const {
        parentNodeId,
        parentNodeX,
        parentNodeY,
        initialOffset
      } = getParentParamsForAlignemnt(data, allNodePositions, type);

      let offset = initialOffset;
      let numMetricChangeFlag = false;

      // get the visParams data depending on 'type'
      const visParamsAllItem = (type === 'node') ? $scope.vis.params.allNodes : $scope.vis.params.allLinks;

      // from visParamsAllItem get params for a particular item
      const { selectedItemParams } = getNodeParams(visParamsAllItem, parentNodeId);

      // find the total number of metrics for a particular node in visParam
      let visParamAllMetricsLength = 0;
      if (selectedItemParams && selectedItemParams.metric_groups) {
        _.each(selectedItemParams.metric_groups, (metricGroup) => {
          if (metricGroup.metricList) {
            visParamAllMetricsLength += metricGroup.metricList.length;
          }
        });
      }

      // 1) generate a 'metricGroupListObj' object of the following format
      // "metricGroupListObj": {
      //   "metric_group_1_id":{
      //     "metricList":{
      //       "metric_1_id":{},
      //       "metric_2_id":{},
      //     }
      //   },
      //   "metric_group_2_id":{
      //     "metricList":{
      //       "metric_1_id":{},
      //       "metric_2_id":{},
      //     }
      //   },
      // }
      // 2) generate a 'allMetrics' list which has list of all metrics for a node
      _.each(data.metric_groups, (metricGroup) => {
        // populate the 'metricGroupListObj' with metricGroup info
        metricGroupListObj[metricGroup.id] = {
          id: metricGroup.id,
          x: metricGroup.x,
          y: metricGroup.y,
          statusIcon: metricGroup.statusIcon,
          metricListObj: {}
        };

        _.each(metricGroup.metricList, (metric) => {
          // populate the 'metricGroupListObj' with metric info
          metricGroupListObj[metricGroup.id].metricListObj[metric.id] = metric;

          // push all metrics of a particular node into a single array 'allMetrics'
          allMetrics.push({ ...metric, metricGroupId: metricGroup.id });

          // check if metric is a new node
          if (metric.x === 0 && metric.y === 0) {
            numMetricChangeFlag = true;
          }
        });
      });

      // if our current 'allMetrics' length is not same as 'visParamAllMetrics' length
      // that means a new metric got added or a old metric was deleted
      if (visParamAllMetricsLength !== allMetrics.length) {
        numMetricChangeFlag = true;
      }


      // We align the metricList below its node in the following cases
      // 1) If a new node has been added
      // 2) For an existing node, if a new metric has been added or existing metric has been removed
      // 3) If forceAlignFlag is true
      if (numMetricChangeFlag || forceAlignFlag) {
        // Perform alignment for nodes
        _.each(allMetrics, (metric) => {

          // offset calculations
          const metricIconOffset = ((metric.widthConstraint / 2) + 35);
          const metricValueOffset = 100 + (((metric.maxCharacterLength - 10) / 10) * 40);

          // align metric below the node
          const metricNodeId = metric.id;
          const metricNodeX = parentNodeX;
          const metricNodeY = parentNodeY + offset;

          // align metric icon to left of the metric
          const metricIconId = metric.statusIcon.id;
          const metricIconX = metricNodeX - metricIconOffset;
          const metricIconY = metricNodeY;

          // align metricValue to right of the metric
          const metricValueId = metric.valueNode.id;
          const metricValueX = metricNodeX + metricValueOffset;
          const metricValueY = metricNodeY;

          // the three items (metric, metricIcon, metricValue ) needs to be realigned
          itemsToMove.push({ id: metricNodeId, x: metricNodeX, y: metricNodeY });
          itemsToMove.push({ id: metricIconId, x: metricIconX, y: metricIconY });
          itemsToMove.push({ id: metricValueId, x: metricValueX, y: metricValueY });

          // update respective vals in dict
          const metricListObj = metricGroupListObj[metric.metricGroupId].metricListObj;
          const metricListObjItem = metricListObj[metricNodeId];
          metricListObjItem.x = metricNodeX;
          metricListObjItem.y = metricNodeY;
          metricListObjItem.statusIcon.x = metricIconX;
          metricListObjItem.statusIcon.y = metricIconY;
          metricListObjItem.valueNode.x = metricValueX;
          metricListObjItem.valueNode.y = metricValueY;

          // update offset so each metric comes below one another
          offset += 35;
        });
      } else {
        // Don't perform alignment for nodes
        // take existing values
        _.each(allMetrics, (metric) => {
          // If none of the above conditions are satisfied, no algining is done
          // We take the already existing 'X' and 'Y' positions
          const metricListObj = metricGroupListObj[metric.metricGroupId].metricListObj;
          const metricListObjItem = metricListObj[metric.id];
          metricListObjItem.x = metric.x;
          metricListObjItem.y = metric.y;
          metricListObjItem.statusIcon = metric.statusIcon;
          metricListObjItem.valueNode = metric.valueNode;
        });
      }

      // convert the 'metricGroupListObj' object to a list (metricGroupList)
      _.forOwn(metricGroupListObj, (value) => {
        const metricList = [];
        _.forOwn(value.metricListObj, (value) => {
          const metricItem = {
            id: value.id,
            x: value.x,
            y: value.y,
            statusIcon: {
              id: value.statusIcon.id,
              x: value.statusIcon.x,
              y: value.statusIcon.y
            },
            valueNode: {
              id: value.valueNode.id,
              x: value.valueNode.x,
              y: value.valueNode.y
            }
          };
          metricList.push(metricItem);
        });

        const metricGroupItem = {
          id: value.id,
          x: 0,
          y: 0,
          statusIcon: { id: value.statusIcon.id, x: 0, y: 0 },
          metricList: metricList
        };
        metricGroupList.push(metricGroupItem);
      });

      allItems.push({
        'id': parentNodeId,
        'x': parentNodeX,
        'y': parentNodeY,
        'metric_groups': metricGroupList
      });
    });
    return { allItems, itemsToMove };
  };

  // when a node is dragged we select its respective groups as well
  // when a group is selected we select all groups belonging to that node
  // All selected items are moved during the drag event
  $scope.onNodeDragStart = (draggedNodeId) => {
    const nodesDataSet = $scope.data.nodes;
    const edgesDataSet = $scope.data.edges;
    const itemsToSelect = [];

    // Get the params of the selected node from the dataSet
    let { selectedItemParams, isParentNode } = getNodeParams(nodesDataSet, draggedNodeId);

    // if 'draggedNodeId' was not found in nodesDataSet lets search for it in edgesDataSet
    if (!selectedItemParams) {
      ({ selectedItemParams, isParentNode } = getNodeParams(edgesDataSet, draggedNodeId));
    }

    // If the selected node has metric_groups, we need to select all metric_groups/metrics
    if (selectedItemParams && selectedItemParams.metric_groups) {
      // push items to be selected inside 'pushItemsToSelect' array
      _.each(selectedItemParams.metric_groups, (metricGroup) => {
        // if template is 'Display Metric Groups', we select 'group' and 'statusIcon'
        if ($scope.vis.params.utmTemplate === templateTypes.displayMetricGroups) {
          itemsToSelect.push(metricGroup.id);
          itemsToSelect.push(metricGroup.statusIcon.id);
        }
        // if template is with 'Display Metric', we select 'metric', 'statusIcon' and 'valueNode'
        else {
          _.each(metricGroup.metricList, (metric) => {
            itemsToSelect.push(metric.id);
            itemsToSelect.push(metric.statusIcon.id);
            itemsToSelect.push(metric.valueNode.id);
          });
        }
      });
    }

    // if parent node is dragged we select that also
    if (isParentNode) {
      itemsToSelect.push(selectedItemParams.id);
    }

    // return nodes to selected back to vis_map
    return [{
      action: 'selectNodes',
      val: itemsToSelect
    }];
  };

  // Function to update Node's new X and Y values.
  $scope.onNodeDragEnd = (draggedItemList, allNodePositions) => {
    const selectedTemplate = $scope.vis.params.utmTemplate;
    const nodesDataSet = $scope.data.nodes;
    const edgesDataSet = $scope.data.edges;
    let itemsToMove = [];

    // We generate a object containing id, X, Y
    // position for all nodes which have dragged
    let updatedItemPositions = [];
    _.each(draggedItemList, (itemId) => {
      const obj = {};
      const item = allNodePositions[itemId];
      if (item) {
        obj.id = itemId;
        obj.x = item.x;
        obj.y = item.y;
        updatedItemPositions.push(obj);
      }
    });

    // After a node has finished dragging, we need re-align the metricGroup/metrics of the node's edges
    _.each(updatedItemPositions, (node) => {
      const { selectedItemParams, isParentNode } = getNodeParams(nodesDataSet, node.id);

      // peform alignment of node's edges metricGroup/metrics only if it is a parent node
      // textNodes and imageNodes used for displaying metricGroup/metrics are not parentNodes
      if (selectedItemParams && isParentNode) {
        // when a parent node is dragged
        // we find all the edges connected to that node
        // we drag all textNodes/iconNodes belonging to that edges
        _.each(edgesDataSet, (edgesData) => {
          if (edgesData.from === node.id || edgesData.to === node.id) {

            // call respective function depending on template
            if (selectedTemplate === templateTypes.displayMetricGroups) {
              // get nodesItemsToMove
              ({ itemsToMove } = alignItemsForTemplateDisplayMetricGroups(
                [edgesData],
                allNodePositions,
                'edge',
                true
              ));
            } else {
              // get nodesItemsToMove
              ({ itemsToMove } = alignItemsForTemplateDisplayMetric(
                [edgesData],
                allNodePositions,
                'edge',
                true
              ));
            }
          }
        });
      }
    });

    // we need to update the position of items which need to be moved as well
    updatedItemPositions = updatedItemPositions.concat(itemsToMove);

    // Broadcast an event to visParams controller to update node positions
    $rootScope.$broadcast('vusop:utmUpdateDataOnDrag', updatedItemPositions);

    // update positons
    return [{
      action: 'moveNode',
      val: itemsToMove
    }];
  };

  $scope.toggleSidebar = false;

  $scope.metricDrillDown = (refLink) => {
    viewDashboardOrEventForThisMetric(getAppState, Private, timefilter, kbnUrl, refLink);
  };

  // We align all the textNodes and iconNodes below their respective nodes where required
  // We obtain the 'X' and 'Y' positions of all nodes and generate an object of the following format
  // this is then stored in allNodes, allLinks and saved to visParams
  // [
  //   {
  //     "id": "n1",
  //     "x": -203,
  //     "y": -18,
  //     "metric_groups": [
  //       {
  //         "id": "n1 + BMV_rtt",
  //         "x": -203,
  //         "y": 42,
  //         "statusIcon" : {
  //           "id": "n1 + BMV_rtt" + icon,
  //           "x": -193,
  //           "y": 42
  //         },
  //         "metricList": [
  //           {
  //             "id": "n1 + BMV_rtt + maxRtt",
  //             "x": -203,
  //             "y": 42,
  //             "statusIcon" : {
  //               "id": "n1 + BMV_rtt + maxRtt" + icon,
  //               "x": -193,
  //               "y": 42
  //             },
  //           }
  //         ]
  //       }
  //     ]
  //   },
  // ]
  $scope.onNetworkStabilized = (allNodePositions) => {
    const selectedTemplate = $scope.vis.params.utmTemplate;
    let allNodes = [];
    let allLinks = [];
    let nodesItemsToMove = [];
    let edgesItemsToMove = [];

    // generate allNodes, allLinks and items to move
    // call respective function depending on template
    if (selectedTemplate === templateTypes.displayMetricGroups) {
      // get allNodes and nodesItemsToMove
      const nodeResult = alignItemsForTemplateDisplayMetricGroups(
        $scope.data.nodes,
        allNodePositions,
        'node',
        false
      );
      allNodes = nodeResult.allItems;
      nodesItemsToMove = nodeResult.itemsToMove;

      // get allLinks and edgesItemsToMove
      const edgeResult = alignItemsForTemplateDisplayMetricGroups(
        $scope.data.edges,
        allNodePositions,
        'edge',
        false
      );
      allLinks = edgeResult.allItems;
      edgesItemsToMove = edgeResult.itemsToMove;
    }
    else {
      // get allNodes and nodesItemsToMove
      const nodeResult = alignItemsForTemplateDisplayMetric(
        $scope.data.nodes,
        allNodePositions,
        'node',
        false
      );
      allNodes = nodeResult.allItems;
      nodesItemsToMove = nodeResult.itemsToMove;

      // get allLinks and edgesItemsToMove
      const edgeResult = alignItemsForTemplateDisplayMetric(
        $scope.data.edges,
        allNodePositions,
        'edge',
        false
      );
      allLinks = edgeResult.allItems;
      edgesItemsToMove = edgeResult.itemsToMove;
    }

    // Broadcast an event to visParams controller to initialise all node's X and Y values
    $rootScope.$broadcast('vusop:utmInitData', { allNodes, allLinks });

    // update positons
    return [{
      action: 'moveNode',
      val: nodesItemsToMove.concat(edgesItemsToMove)
    }];
  };

  // A generic function which can be caled onNodeSelect or onLinkSelect
  $scope.onItemSelect = (selectedItemId, imageGroups) => {
    const nodeDataSet = $scope.data.nodes;
    const edgeDataSet = $scope.data.edges;
    const itemsToSelect = [];

    // Get the params of the selected node from the dataSet
    let type = 'node';
    let { selectedItemParams } = getNodeParams(nodeDataSet, selectedItemId);

    // if 'draggedNodeId' was not found in nodesDataSet lets search for it in edgesDataSet
    if (!selectedItemParams) {
      type = 'edge';
      ({ selectedItemParams } = getNodeParams(edgeDataSet, selectedItemId));
    }

    // if template is 'Display Metric Groups' we need to prepare data to be displayed on sidebar
    if ($scope.vis.params.utmTemplate === templateTypes.displayMetricGroups) {
      // We generate successCount and failureCount for every metricGroup
      _.each(selectedItemParams.metric_groups, (metricGroup) => {
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

      // node specific items
      if (type === 'node') {
        // Get image to be displayed on the sidebar
        if (imageGroups[selectedItemParams.group]) {
          selectedItemParams.imagePath = imageGroups[selectedItemParams.group].image;
        }
        selectedItemParams.borderColor = selectedItemParams.color.border;

        // edge specific items
      } else {
        selectedItemParams.imagePath = '/ui/vienna_images/link_image_utm.svg';
        selectedItemParams.borderColor = selectedItemParams.color;
      }

      selectedItemParams.isNode = (type === 'node');
      $scope.selectedNodeParams = selectedItemParams;
      $scope.toggleSidebar = true;
      $scope.$apply();

      // If a node is clicked we highlight the clicked node and highlight all metricGroups belonging to that node
      // If a metricGroup is clicked we identify which node this metricGroup belongs to
      // and highlight all metricGroups belonging to that node

      // selectedItemParams.id can be a nodeId or edgeId. only push if its a node
      if (type === 'node') { itemsToSelect.push(selectedItemParams.id); }
      _.each(selectedItemParams.metric_groups, (metricGroup) => {
        // select metricGroup and statusIcon
        itemsToSelect.push(metricGroup.id);
        itemsToSelect.push(metricGroup.statusIcon.id);
      });
    }
    // if template is 'without sidebar' we don't need to prepare data to be displayed on sidebar
    else {
      // If a node is clicked we highlight the clicked node and highlight all metricGroups belonging to that node
      // If a metricGroup is clicked we identify which node this metricGroup belongs to
      // and highlight all metricGroups belonging to that node

      // selectedItemParams.id can be a nodeId or edgeId. only push if its a node
      if (type === 'node') { itemsToSelect.push(selectedItemParams.id); }
      _.each(selectedItemParams.metric_groups, (metricGroup) => {
        _.each(metricGroup.metricList, (metric) => {

          // get the metric of the selectedItemId
          if (metric.valueNode.id === selectedItemId) {
            // check if drillDown has been configured
            if (metric.view_more) {
              $scope.metricDrillDown(metric.view_more);
            }
          }

          // select metricLabel, metricValue and statusIcon
          itemsToSelect.push(metric.id);
          itemsToSelect.push(metric.statusIcon.id);
          itemsToSelect.push(metric.valueNode.id);
        });
      });
    }
    return [{
      action: 'selectNodes',
      val: itemsToSelect
    }];
  };

  // On select of node we prepare the required data for displaying the sidebar
  // Sidebar displays node specific details
  $scope.onNodeSelect = (selectedNodeId, nodeImageGroups) => {
    const actionObj = $scope.onItemSelect(selectedNodeId, nodeImageGroups);
    return actionObj;
  };

  // On select of link we prepare the required data for displaying the sidebar
  // Sidebar displays link specific details
  $scope.onLinkSelect = (selectedEdgeId) => {
    const actionObj = $scope.onItemSelect(selectedEdgeId);
    return actionObj;
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
    // If all configuration empty then its a new visualisation
    $scope.isNewVisualisation = $scope.vis.params.graphs.length === 0 &&
      $scope.vis.params.customNodes.length === 0 &&
      $scope.vis.params.customLinks.length === 0;

    // If user hasn't configured anything yet, return
    // this happens when new a visualisation is oppened for the first time
    // no needs to make api call for first time
    if ($scope.isNewVisualisation) {
      return;
    }

    // utm template selected by the user
    const selectedTemplate = $scope.vis.params.utmTemplate;

    // Hide the sidebar
    $scope.hideSidebar();

    // Function to set the font for responsive design
    // If the visualisation is resized we need the sidebar to be responsive as well
    // We adjust font of sidebar according to size of visualisation
    const utmVisContainerWidth = $('.utm-vis-container').width();
    if (utmVisContainerWidth >= 500 && utmVisContainerWidth <= 600) {
      $scope.sidebarFontSize = '10px';
    } else if (utmVisContainerWidth >= 600 && utmVisContainerWidth <= 700) {
      $scope.sidebarFontSize = '11px';
    } else if (utmVisContainerWidth >= 700 && utmVisContainerWidth <= 850) {
      $scope.sidebarFontSize = '12px';
    } else if (utmVisContainerWidth >= 850 && utmVisContainerWidth <= 1000) {
      $scope.sidebarFontSize = '13px';
    } else if (utmVisContainerWidth >= 1000 && utmVisContainerWidth <= 1200) {
      $scope.sidebarFontSize = '14px';
    } else if (utmVisContainerWidth >= 1200 && utmVisContainerWidth <= 1300) {
      $scope.sidebarFontSize = '15px';
    } else if (utmVisContainerWidth >= 1300 && utmVisContainerWidth <= 1400) {
      $scope.sidebarFontSize = '16.5px';
    } else if (utmVisContainerWidth >= 1400 && utmVisContainerWidth <= 1550) {
      $scope.sidebarFontSize = '17px';
    } else if (utmVisContainerWidth >= 1550 && utmVisContainerWidth <= 1750) {
      $scope.sidebarFontSize = '18px';
    }

    // If allnodes defined in visParams is of length 0 then use withPhysics
    if ($scope.vis.params.allNodes.length === 0 &&
      $scope.vis.params.allLinks.length === 0) {
      $scope.nodePlacementType = 'physicsAndDragNDrop';
    } else {
      $scope.nodePlacementType = 'dragNDrop';
    }

    let esFilter = dashboardContext();

    // Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    const customNodes = $scope.vis.params.customNodes;
    const customLinks = $scope.vis.params.customLinks;
    const allNodes = $scope.vis.params.allNodes;
    const allLinks = $scope.vis.params.allLinks;
    const graphs = $scope.vis.params.graphs;
    const body = {
      customNodes: customNodes || '',
      customLinks: customLinks || '',
      graphs: graphs || '',
      time: {},
      esFilter: esFilter,
      allNodes: allNodes,
      allLinks: allLinks
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
    //         'id':'n2 + BMV_rtt',
    //         'x':-482,
    //         'y':-146,
    //         statusIcon: { 'id':'n2 + BMV_rtt + icon', 'x':0, 'y':0 }
    //         'success':true,
    //         'group':'metric',
    //         'font':{
    //           'color':'green'
    //         },
    //         'label':'BMV_rtt',
    //         'metricList':[
    //           {
    //             'id': 'n2 + BMV_rtt + Max RTT',
    //             'x': 0,
    //             'y': 0,
    //             statusIcon: { 'id':'n2 + BMV_rtt + Max RTT + icon', 'x':0, 'y':0 }
    //             valueNode: { 'id':'n2 + BMV_rtt + Max RTT + valueNode', 'x':0, 'y':0 }
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
    //         'id':'n2 + BMV_rtt',
    //         'x':-482,
    //         'y':-146,
    //         statusIcon: { 'id':'n2 + BMV_rtt + icon', 'x':0, 'y':0 }
    //         'success':true,
    //         'group':'metric',
    //         'font':{
    //           'color':'green'
    //         },
    //         'label':'BMV_rtt',
    //         'metricList':[
    //           {
    //             'id': 'n2 + BMV_rtt + Max RTT',
    //             'x': 0,
    //             'y': 0,
    //             statusIcon: { 'id':'n2 + BMV_rtt + Max RTT + icon', 'x':0, 'y':0 }
    //             valueNode: { 'id':'n2 + BMV_rtt + Max RTT + valueNode', 'x':0, 'y':0 }
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

    // THis flag has been used to show loading as api is being called
    $scope.isLoading = true;

    const httpResult = $http.post(urlBase + '/utMap/', body)
      .then(resp => resp.data)
      .catch(resp => {
        // if error string is present display it
        if (resp.data['error-string']) {
          notify.error(resp.data['error-string']);
        }
        throw resp.data;
      });

    // Perform operation after getting response.
    httpResult.then(function (resp) {

      // Process data for template: 'Display Metric Groups'
      // Process backend response to generate json in required format
      // processed data is fed into visMap to generate graphs
      const processDataForTemplateDisplayMetricGroups = (dataList, type) => {
        const additionalNodes = [];

        // Process data
        _.each(dataList, function (data) {
          if (type === 'edge') {
            // labels will not be displayed for edges
            data.label = '';
          }

          if (data.metric_groups) {
            // we iterate over the merticList for first time to find out which
            // metric.label has the max number of characters
            let maxCharacterLength = 0;
            _.each(data.metric_groups, function (metricGroup) {
              if (metricGroup.label.length > maxCharacterLength) {
                maxCharacterLength = metricGroup.label.length;
              }
            });

            // we calculate the widthConstraint of the textNode based on 'maxCharacterLength'
            const widthConstraint = ((maxCharacterLength * 215) / 20) + 40;

            _.each(data.metric_groups, function (metricGroup) {
              const iconNode = { ...metricGroup.statusIcon };

              // We create a copy of metricGroup label, so later on we can truncate the label string
              metricGroup.labelUnformatted = metricGroup.label;

              // Add required properties for metricGroup
              metricGroup.font.color = 'black';
              metricGroup.widthConstraint = widthConstraint;

              // push additional nodes into processedData
              additionalNodes.push(metricGroup);
              additionalNodes.push(iconNode);
            });
          }
        });
        return additionalNodes;
      };

      // Process data for template: 'Display Metric'
      // Process backend response to generate json in required format
      // processed data is fed into visMap to generate graphs
      const processDataForTemplateDisplayMetric = (dataList, type) => {
        const additionalNodes = [];

        // Process data
        _.each(dataList, function (data) {
          if (type === 'edge') {
            // labels will not be displayed for edges
            data.label = '';
          }

          if (data.metric_groups) {
            let maxCharacterLength = 0;

            _.each(data.metric_groups, function (metricGroup) {
              if (metricGroup.metricList) {
                // we iterate over the merticList for first time to find out which
                // metric.label has the max number of characters
                _.each(metricGroup.metricList, function (metric) {
                  if (metric.label.length > maxCharacterLength) {
                    maxCharacterLength = metric.label.length;
                  }
                });
              }
            });

            // we calculate the widthConstraint of the textNode based on 'maxCharacterLength'
            const widthConstraint = ((maxCharacterLength * 215) / 20) + 40;

            _.each(data.metric_groups, function (metricGroup) {
              if (metricGroup.metricList) {
                _.each(metricGroup.metricList, function (metric) {
                  const iconNode = { ...metric.statusIcon };
                  const metricValueNode = { ...metric.valueNode };

                  // We create a copy of metric label, so later on we can truncate the label string
                  metric.labelUnformatted = metric.label;
                  metric.maxCharacterLength = maxCharacterLength;
                  metric.widthConstraint = widthConstraint;

                  // if metricValueNode has drillDown available then make it blue color
                  if (metric.view_more) {
                    // For nodes which have dashboards configured, we store their id in nodesWithDashboardObj.
                    // later on, given a nodeId it is easy to figure out if it has bashboard
                    nodesWithDashboardObj[metricValueNode.id] = metricValueNode.id;
                    metricValueNode.font.color = 'blue';
                  }

                  metricValueNode.widthConstraint = 100;

                  // If metricValueNode.label is greater than 8 characters,
                  // display only first 8 characters and append '..' to it
                  if (metricValueNode.label.length > 8) {
                    metricValueNode.label = metricValueNode.label.slice(0, 8) + '..';
                  }

                  // The 'value' attribute is used in vis.js to scale the size of nodes
                  // we are getting a key with the name 'value' from backend
                  // we don't need this feature. delete this key
                  delete metric.value;

                  // push all items
                  additionalNodes.push(metric);
                  additionalNodes.push(iconNode);
                  additionalNodes.push(metricValueNode);
                });
              }
            });
          }
        });
        return additionalNodes;
      };

      $scope.data = resp;
      $scope.isLoading = false;

      // deepClone resp
      const processedData = JSON.parse(JSON.stringify(resp));
      let additionalNodeItems = [];
      let additionalEdgeItems = [];

      // populate additionalEdgeItems and additionalEdgeItems depending on template
      if (selectedTemplate === templateTypes.displayMetricGroups) {
        additionalNodeItems = processDataForTemplateDisplayMetricGroups(resp.nodes, 'node');
        additionalEdgeItems = processDataForTemplateDisplayMetricGroups(resp.edges, 'edge');
      } else {
        additionalNodeItems = processDataForTemplateDisplayMetric(resp.nodes, 'node');
        additionalEdgeItems = processDataForTemplateDisplayMetric(resp.edges, 'edge');
      }

      processedData.nodes = processedData.nodes.concat(additionalNodeItems, additionalEdgeItems);

      // finally store processedData on scope
      $scope.processedData = processedData;
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
