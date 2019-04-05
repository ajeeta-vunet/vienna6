import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

const app = uiModules.get('app/berlin');

import './vunet_users.less';

app.directive('user', function () {
  return {
    restrict: 'E',
    controllerAs: 'userController',
    controller: userController,
  };
});

function userController($injector, $scope) {

  function init() {

    // Always display doc title as 'User'
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.USER);

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