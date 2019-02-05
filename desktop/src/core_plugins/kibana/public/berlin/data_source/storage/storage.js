import { uiModules } from 'ui/modules';

const app = uiModules.get('app/berlin');

import './vunet_storage.less';

app.directive('vunetStorage', function () {
  return {
    restrict: 'E',
    controllerAs: 'storageController',
    controller: storageController,
  };
});

function storageController($scope) {

  function init() {

    // Data for tabs component
    $scope.tabs = [
      { id: 'live', name: 'Live Indices' },
      { id: 'archived', name: 'Archived Indices' }
    ];

    $scope.landingTab = 'live';
    $scope.id = 'live';
  }

  // Set the id of the selected tab to display its
  // contents
  $scope.onTabChange = function (id) {
    $scope.id = id;
  };
  init();
}