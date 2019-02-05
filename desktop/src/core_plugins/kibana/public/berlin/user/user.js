import { uiModules } from 'ui/modules';

const app = uiModules.get('app/berlin');

import './vunet_users.less';

app.directive('user', function () {
  return {
    restrict: 'E',
    controllerAs: 'userController',
    controller: userController,
  };
});

function userController($scope) {

  function init() {
    // Data for tabs component
    $scope.tabs = [
      { id: 'user', name: 'User Management' },
      { id: 'roles', name: 'User Role Management' }
    ];

    $scope.landingTab = 'user';
    $scope.id = 'user';
  }

  // Set the id of the selected tab to display its
  // contents
  $scope.onTabChange = function (id) {
    $scope.id = id;
  };
  init();
}