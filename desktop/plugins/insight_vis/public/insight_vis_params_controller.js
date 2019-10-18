require('ui/courier');
require('ui/directives/business_metric_color_schema');
require('../directives/insight_config_container_directive');
require('../directives/insight_metric_list_directive');
require('../directives/insight_value_template_directive');

import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/insight_vis', ['kibana', 'kibana/courier']);

module.controller('insightVisParamsController', function ($scope) {

  // Initializing empty list for all insights
  $scope.operInsightList = [];

  // Display empty fields of graph when add graph button is clicked.
  $scope.addInsight = function () {
    $scope.vis.params.insights.splice($scope.vis.params.insights.length, 0, {});
    $scope.operInsightList.push({ expanded: false });
  };

  // Delete the graph selected.
  $scope.removeInsight = function (index) {
    $scope.operInsightList.splice(index, 1);
    $scope.vis.params.insights.splice(index, 1);
  };

  // This will move element inside array from old position to new position for parameters
  function move(arr, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    $scope.operInsightList.splice(newIndex, 0, $scope.operInsightList.splice(oldIndex, 1)[0]);
  }

  // Move a Parameter one position above the current position.
  $scope.moveUp = function (index) {
    move($scope.vis.params.insights, index, index - 1);
  };

  // Move a Parameter one position below the current position.
  $scope.moveDown = function (index) {
    move($scope.vis.params.insights, index, index + 1);
  };

});
