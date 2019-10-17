require('ui/courier');
require('ui/directives/business_metric_color_schema');
require('../directives/utm_metric_list_directive.js');
require('../directives/utm_custom_node_directive.js');
require('../directives/utm_custom_link_directive.js');
require('../directives/utm_graph_directive.js');
require('../directives/utm_subgraph_directive.js');
import { uiModules } from 'ui/modules';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { getBusinessMetricList } from 'ui/utils/business_metric_list.js';

const _ = require('lodash');
const module = uiModules.get('kibana/unified_transaction_map_vis', ['kibana', 'kibana/courier']);

module.controller('UnifiedTransactionVisParamsController', function ($scope, $rootScope, Private) {
  const savedObjectsClient = Private(SavedObjectsClientProvider);

  // Gets the list of all business metric visualization configured.
  getBusinessMetricList(savedObjectsClient).then (function (data) {
    $scope.bmvList = data;
  });

  // Initializing empty list for all node, link
  // and graph list to perform move operation.
  $scope.operNodeList = [];
  $scope.operLinkList = [];
  $scope.operGraphList = [];

  // Delete the node selected.
  $scope.removeNode = function (index) {
    $scope.operNodeList.splice(index, 1);
    $scope.vis.params.customNodes.splice(index, 1);
  };

  // Delete the link selected.
  $scope.removeLink = function (index) {
    $scope.operLinkList.splice(index, 1);
    $scope.vis.params.customLinks.splice(index, 1);
  };

  // Delete the graph selected.
  $scope.removeGraph = function (index) {
    $scope.operGraphList.splice(index, 1);
    $scope.vis.params.graphs.splice(index, 1);
  };

  // Display empty fields of node when add node button is clicked.
  $scope.addNode = function () {
    $scope.vis.params.customNodes.splice($scope.vis.params.customNodes.length, 0, {});
    $scope.operNodeList.push({ expanded: false });
  };

  // Display empty fields of graph when add graph button is clicked.
  $scope.addGraph = function () {
    $scope.vis.params.graphs.splice($scope.vis.params.graphs.length, 0, {});
    $scope.operGraphList.push({ expanded: false });
  };

  // Display empty fields of links when add link button is clicked.
  $scope.addLink = function () {
    $scope.vis.params.customLinks.splice($scope.vis.params.customLinks.length, 0, {});
    $scope.operLinkList.push({ expanded: false });
  };

  // To creating a list of node labels when ever user creates a node.
  $scope.$watch('vis.params.customNodes', function () {
    $scope.nodeLabelList = [];
    _.each($scope.vis.params.customNodes, function (customnode) {
      $scope.nodeLabelList.push(customnode.nodeLabel);
    });
  }, true);

  // To creating a list of link labels when ever user creates a link.
  $scope.$watch('vis.params.customLinks', function () {
    $scope.listLabelList = [];
    _.each($scope.vis.params.customLinks, function (customlink) {
      $scope.listLabelList.push(customlink.linkLabel);
    });
  }, true);

  // This will move element inside array
  // from old position to new position
  function move(arr, operList, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    operList.splice(newIndex, 0, operList.splice(oldIndex, 1)[0]);
  }

  // Move a node or link or graph one position above the
  // current position.
  $scope.moveUp =  function (index, resource) {
    if (resource === 'customNodes') {
      move($scope.vis.params.customNodes, $scope.operNodeList, index, index - 1);
    } else if (resource === 'customLinks') {
      move($scope.vis.params.customLinks, $scope.operLinkList, index, index - 1);
    } else if (resource === 'graphs') {
      move($scope.vis.params.graphs, $scope.operGraphList, index, index - 1);
    }
  };

  // Move a node or link or graph one position below the
  // current position.
  $scope.moveDown =  function (index, resource) {
    if (resource === 'customNodes') {
      move($scope.vis.params.customNodes, $scope.operNodeList, index, index + 1);
    } else if (resource === 'customLinks') {
      move($scope.vis.params.customLinks, $scope.operLinkList, index, index + 1);
    } else if (resource === 'graphs') {
      move($scope.vis.params.graphs, $scope.operGraphList, index, index + 1);
    }
  };

  // Event to initialise 'X' and 'Y' positions of all nodes
  // and respective groups
  $rootScope.$on('vusop:utmInitData', (event, nodes) => {
    if (!_.isEqual($scope.vis.params.allNodes, nodes)) {
      $scope.vis.params.allNodes = nodes;
      $scope.$apply();
    }
  });

  // Event to save 'X' and 'Y' position of dragged nodes
  $rootScope.$on('vusop:utmUpdateDataOnDrag', (event, newNodes) => {
    _.each(newNodes, (node) => {
      const id = node.id;
      const x = node.x;
      const y = node.y;

      let visParamsArgsToUpdate = undefined;

      // First we check if dragged node is a parentNode(node) or childNode (nodeGroup)
      // ChildNodes have a parentId property used to identify who their parent is

      // If dragged node is childNode, we need to find its parentArgs in vis.params.allNodes using parentId
      // we iterate over the parentArgs to get the repective metricGroup having same Id as our childNode and update X,Y position

      // If dragged node is parentNode, we need to find that node in vis.params.allNodes using Id
      // update X,Y position

      if (node.parentId) {
        const visParamsNodeArgs = _.find($scope.vis.params.allNodes, (visParamsNode) => {
          return visParamsNode.id === node.parentId;
        });
        visParamsArgsToUpdate = _.find(visParamsNodeArgs.metric_groups, (metricGroup) => {
          return metricGroup.id === id || metricGroup.statusIcon.id === id;
        });
      } else {
        visParamsArgsToUpdate = _.find($scope.vis.params.allNodes, (visParamsNode) => {
          return visParamsNode.id === id;
        });
      }

      // We update the 'X' and 'Y' positions of all the nodes
      // We identify iconNodes with the parentMetricGroupId property
      // Note: ideally we should use a property like 'nodeType: icon' instead of
      // using parentMetricGroupId to identify if its a icon node
      if (visParamsArgsToUpdate) {
        if (node.parentMetricGroupId) {
          visParamsArgsToUpdate.statusIcon.x = x;
          visParamsArgsToUpdate.statusIcon.y = y;
        } else {
          visParamsArgsToUpdate.x = x;
          visParamsArgsToUpdate.y = y;
        }
      }
    });
  });

});
