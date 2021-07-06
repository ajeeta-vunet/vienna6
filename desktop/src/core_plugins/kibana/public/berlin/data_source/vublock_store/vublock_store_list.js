import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { VuBlocksListingPage } from './components/VuBlocksListingPage/VuBlocksListingPage';

const app = uiModules.get('app/berlin');

// VuBlocksListingPage react component
app.directive('vuBlocksListingPage', (reactDirective) => {
  return reactDirective(VuBlocksListingPage, []);
});

app.directive('vuBlockStore', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockStore',
    controller: vuBlockStore,
  };
});

function vuBlockStore(StateService, $injector) {
  function init() {
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.VUBLOCK_STORE);
  }

  init();
}
