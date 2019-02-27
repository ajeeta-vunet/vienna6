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

  // Event to update Node's X and Y value.
  $rootScope.$on('vusop:utmMapData', (event, newNodes) => {
    _.each($scope.vis.params.customNodes, function (customNodes) {
      _.each(newNodes, function (newnode) {
        if (customNodes.nodeLabel === newnode.id) {
          customNodes.nodeX = newnode.X;
          customNodes.nodeY = newnode.Y;
        }
      });
    });
    $scope.$apply();
  });
});
