import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

const app = uiModules.get('app/berlin');

import './definition.less';

app.directive('vunetDefinations', function () {
  return {
    restrict: 'E',
    controllerAs: 'definationController',
    controller: definationController,
  };
});

function definationController($injector, $scope) {

  function init() {

    // Always display doc title as 'Definitions'
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.DEFINITIONS);

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