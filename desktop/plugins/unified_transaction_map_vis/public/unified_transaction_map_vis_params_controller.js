require('ui/courier');
require('ui/directives/business_metric_color_schema');
require('../directives/utm_metric_list_directive.js');
require('../directives/utm_custom_node_directive.js');
require('../directives/utm_custom_link_directive.js');
import { uiModules } from 'ui/modules';
const _ = require('lodash');
const module = uiModules.get('kibana/unified_transaction_map_vis', ['kibana', 'kibana/courier']);

module.controller('UnifiedTransactionVisParamsController', function ($scope, $rootScope) {

  // Delete the node selected.
  $scope.removeNode = function (index) {
    $scope.vis.params.customNodes.splice(index, 1);
  };

  // Delete the link selected.
  $scope.removeLink = function (index) {
    $scope.vis.params.customLinks.splice(index, 1);
  };

  // Display empty fields of node when add node button is clicked.
  $scope.addNode = function () {
    $scope.vis.params.customNodes.splice($scope.vis.params.customNodes.length, 0, {});
  };

  // Display empty fields of links when add link button is clicked.
  $scope.addLink = function () {
    $scope.vis.params.customLinks.splice($scope.vis.params.customLinks.length, 0, {});
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
  function move(arr, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    $scope.operNodeList.splice(newIndex, 0, $scope.operNodeList.splice(oldIndex, 1)[0]);
  }

  // Move a metric one position above the
  // current position.
  $scope.moveUp =  function (index) {
    move($scope.vis.params.customNodes, index, index - 1);
  };

  // Move a metric one position below the
  // current position.
  $scope.moveDown =  function (index) {
    move($scope.vis.params.customNodes, index, index + 1);
  };

  // Event to update Node's X and Y value.
  $rootScope.$on('vusop:utmMapData', (event, newNodes) => {
    _.each($scope.vis.params.customNodes, function (customNodes, index) {
      _.each(newNodes, function (newnode, nodeIndex) {
        if (index === nodeIndex) {
          customNodes.nodeX = newnode.X;
          customNodes.nodeY = newnode.Y;
        }
      });
    });
    $scope.$apply();
  });
});
