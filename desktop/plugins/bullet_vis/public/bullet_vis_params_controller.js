require('ui/courier');
require('ui/directives/business_metric_color_schema');
require('../directives/bullet_graph_directive.js');
require('../../insight_vis/directives/insight_config_container_directive');
import { uiModules } from 'ui/modules';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { getBusinessMetricList, getMetricListWithAggLengthInBMV } from 'ui/utils/business_metric_list.js';

const module = uiModules.get('kibana/bullet_vis', ['kibana', 'kibana/courier']);

module.controller('bulletVisParamsController', function ($scope, $rootScope, Private) {

  const savedObjectsClient = Private(SavedObjectsClientProvider);

  // Gets the list of all business metric visualization configured.
  getBusinessMetricList(savedObjectsClient).then (function (data) {
    $scope.bmvList = data;
  });

  // Gets the list of all business metric visualizations with aggregation length.
  getMetricListWithAggLengthInBMV(savedObjectsClient).then (function (data) {
    $scope.metricList = data;
  });

  // Initializing empty list for all bullet.
  $scope.operBulletList = [];

  // Initialize aggLength to zero.
  $scope.opts = { 'aggLength': 0 };

  // Initializing empty list for all insights.
  $scope.operInsightList = [];

  // Delete the bullet selected.
  $scope.removeBullet = function (index) {
    $scope.operBulletList.splice(index, 1);
    $scope.vis.params.bullets.splice(index, 1);
  };

  // Display empty fields of bullet when add bullet button is clicked.
  $scope.addBullet = function () {
    $scope.vis.params.bullets.splice($scope.vis.params.bullets.length, 0, {});
    $scope.operBulletList.push({ expanded: false });
  };

  // This will move element inside array
  // from old position to new position
  function move(arr, operList, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    operList.splice(newIndex, 0, operList.splice(oldIndex, 1)[0]);
  }

  // Display empty fields of insight when add insight button is clicked.
  $scope.addInsight = function () {
    $scope.vis.params.insights.splice($scope.vis.params.insights.length, 0, {});
    $scope.operInsightList.push({ expanded: false });
  };

  // Delete the insight selected.
  $scope.removeInsight = function (index) {
    $scope.operInsightList.splice(index, 1);
    $scope.vis.params.insights.splice(index, 1);
  };

  // Move a bullet or insight one position above the
  // current position.
  $scope.moveUp =  function (index, resource) {
    if (resource === 'insight') {
      move($scope.vis.params.insights, $scope.operInsightList, index, index - 1);
    } else if(resource === 'bullet') {
      move($scope.vis.params.bullets, $scope.operBulletList, index, index - 1);
    }
  };

  // Move a  bullet or insight one position below the
  // current position.
  $scope.moveDown =  function (index, resource) {
    if (resource === 'insight') {
      move($scope.vis.params.insights, $scope.operInsightList, index, index + 1);
    } else if(resource === 'bullet') {
      move($scope.vis.params.bullets, $scope.operBulletList, index, index + 1);
    }
  };

});
