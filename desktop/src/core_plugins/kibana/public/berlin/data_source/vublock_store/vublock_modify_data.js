import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { VuBlockManagerPage } from './components/VuBlockManagerPage/VuBlockManagerPage';
import './styling/vublock_store_list.less';
const app = uiModules.get('app/berlin');

// VuBlockManagerPage react component
app.directive('vuBlockManagerPage', (reactDirective) => {
  return reactDirective(VuBlockManagerPage, [
    'vuBlockId'
  ]);
});

app.directive('vuBlockStoreModifyData', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockStoreModifyData',
    controller: vuBlockStoreModifyData,
  };
});

function vuBlockStoreModifyData(StateService, $injector, $scope, $rootScope, $route) {

  function init() {
    $scope.vuBlockId = $route.current.locals.vuBlockId;
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.VUBLOCK_STORE);
  }

  init();
}
