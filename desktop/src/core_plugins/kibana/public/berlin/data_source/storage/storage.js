import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

const app = uiModules.get('app/berlin');

import './vunet_storage.less';
import '../../styles/vunet_summary_container.less';

app.directive('vunetStorage', function () {
  return {
    restrict: 'E',
    controllerAs: 'storageController',
    controller: storageController,
  };
});

function storageController($injector, $scope) {

  // Always display doc title as 'Storage'
  const Private = $injector.get('Private');
  const docTitle = Private(DocTitleProvider);
  docTitle.change(VunetSidebarConstants.STORAGE);

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