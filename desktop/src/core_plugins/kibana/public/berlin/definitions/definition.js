import { uiModules } from 'ui/modules';

const app = uiModules.get('app/berlin');

import './definition.less';

app.directive('vunetDefinations', function () {
  return {
    restrict: 'E',
    controllerAs: 'definationController',
    controller: definationController,
  };
});

function definationController($scope) {

  function init() {
    // Data for tabs component
    $scope.tabs = [
      { id: 'credentials', name: 'Credentials' },
      { id: 'email', name: 'Email Groups' }
    ];

    $scope.landingTab = 'credentials';
    $scope.id = 'credentials';
  }

  // Set the id of the selected tab to display its
  // contents
  $scope.onTabChange = function (id) {
    $scope.id = id;
  };
  init();
}