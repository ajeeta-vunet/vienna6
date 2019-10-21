import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { getBusinessMetricList } from 'ui/utils/business_metric_list.js';
import { uiModules } from 'ui/modules';
require('ui/courier');

const module = uiModules.get('kibana/status_indicator_and_kpi_vis', ['kibana']);
module.controller('statusIndicatorAndKpiVisParamsController', function ($scope, $rootScope, Private) {

  const savedObjectsClient = Private(SavedObjectsClientProvider);
  // Gets the list of all business Parameter visualization configured.
  getBusinessMetricList(savedObjectsClient).then(function (data) {
    $scope.bmvList = data;
  });

  $scope.visualizationTypes = ['Status Indicator', 'KPI'];

  $scope.kpiTemplateList = ['Vertical Alignment', 'Horizontal Alignment'];

  // This has been done for auto referesh when it is enabled
  $scope.search = function () {
    $rootScope.$broadcast('courier:searchRefresh');
  };


  // This array is user to hold the boolean value of parameters whether they are open or collapsed
  $scope.openConfigureParameter = [];

  // Delete one of the parameters configured.
  $scope.removeParameter = function (index) {
    $scope.vis.params.parameters.splice(index, 1);
    $scope.openConfigureParameter.splice(index, 1);
  };

  // Add a new Parameter configuration.
  $scope.addParameter = function () {
    $scope.vis.params.parameters.splice($scope.vis.params.parameters.length, 0, {});
    $scope.openConfigureParameter.push({ expanded: false });
  };

  // This will move element inside array from old position to new position for parameters
  function moveParameter(arr, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    $scope.openConfigureParameter.splice(newIndex, 0, $scope.openConfigureParameter.splice(oldIndex, 1)[0]);
  }

  // Move a Parameter one position above the current position.
  $scope.moveUpParameter = function (index) {
    moveParameter($scope.vis.params.parameters, index, index - 1);
  };

  // Move a Parameter one position below the current position.
  $scope.moveDownParameter = function (index) {
    moveParameter($scope.vis.params.parameters, index, index + 1);
  };

});
