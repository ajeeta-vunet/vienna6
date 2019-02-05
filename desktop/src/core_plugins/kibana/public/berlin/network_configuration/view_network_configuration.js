/*eslint-disable*/
export default function ViewNetworkConfigCtrl($scope, StateService, $uibModalInstance) {
/*eslint-enable*/
  // Data to feed to modal component
  $scope.viewConfig = false;
  $scope.viewConfigDiff = false;
  $scope.viewRouterConfig = false;
  $scope.configuration_collector_name = $uibModalInstance.data.name;
  $scope.selectedConfigInstanceList = $uibModalInstance.selectedConfigInstanceList;

  // This function will help to collapase the instance list and
  // clearing the list used to store the instances selected to
  // perform 'View' or 'Diff' operations.
  $scope.clearRouterConfigList = function () {
    $scope.routerconfigList = [];
    $scope.selectedConfigInstanceList = [];
    $scope.configInstanceList = [];
  };

  // This function is called when the config icon for any of
  // the router is clicked.
  $scope.getRouterConfigList = function () {
    // This code will run when the config button is clicked to close the
    // div showing the router config instances.
    if ($scope.routerconfigList && $scope.routerconfigList[0] === $scope.configuration_collector_name) {
      $scope.clearRouterConfigList();
      return;
    }
    $scope.clearRouterConfigList();
    $scope.routerconfigList.push($scope.configuration_collector_name);
    // This will make a backend call to fetch all the router config
    // instance for a particular router.
    StateService.getRouterConfigInstances($scope.configuration_collector_name).then(function (data) {
      $scope.configInstanceList = data.configurations;
    });
  };

  // Get router specific configuration
  $scope.getRouterConfigList();

  // This will update the selectedConfigInstanceList when any
  // operations are made on checkboxes.
  $scope.toggleSelection = function toggleSelection(instance) {
    const idx = $scope.selectedConfigInstanceList.indexOf(instance);
    // Is currently selected
    if (idx > -1) {
      $scope.selectedConfigInstanceList.splice(idx, 1);
    }
    // Is newly selected
    else {
      $scope.selectedConfigInstanceList.push(instance);
    }
    // Allow only 2 checkboxes to be selected
    // at max.
    if ($scope.selectedConfigInstanceList.length > 2) {
      $scope.selectedConfigInstanceList.splice(0, 1);
    }
  };

  // This function will decide when to enable the'View' button
  // based on number of checkboxes selected.
  $scope.disableViewButton = function () {
    if ($scope.selectedConfigInstanceList.length === 1) {
      return false;
    }
    else {
      return true;
    }
  };

  // This function will decide when to enable the'Diff' button
  // based on number of checkboxes selected.
  $scope.disbleDiffButton = function () {
    if ($scope.selectedConfigInstanceList.length === 2) {
      return false;
    }
    else {
      return true;
    }
  };

  $scope.cancelConfiguration = () => {
    $uibModalInstance.close();
  };

  // Function to display the config file for a particular router
  $scope.displayRouterConfig = function () {
    StateService.getRouterConfigContent($scope.configuration_collector_name, $scope.selectedConfigInstanceList[0])
      .then(function (data) {
        $scope.routerConfigData = data;
      });
    $scope.viewRouterConfig = true;
    $scope.viewConfig = true;
    $scope.viewConfigDiff = false;
  };

  // Function to display the diff between two config files
  // for a particular router
  $scope.displayRouterConfigDiff = function () {
    StateService.getRouterConfigDiffContent($scope.configuration_collector_name,
      $scope.selectedConfigInstanceList[0], $scope.selectedConfigInstanceList[1])
      .then(function (data) {
        $scope.routerConfigDiffData = data;
      });
    $scope.viewRouterConfig = true;
    $scope.viewConfigDiff = true;
    $scope.viewConfig = false;
  };

  // Download the selected configuration item
  $scope.downloadSingleConfigurationItem = function () {
    StateService.downloadSingleConfigurationItem($scope.configuration_collector_name, $scope.selectedConfigInstanceList[0]);
  };

}
