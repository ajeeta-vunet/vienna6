import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { PIIDataPage } from './components/PIIDataPage/PIIDataPage';

const app = uiModules.get('app/encrypt', []);

//PIIDataPage react component
app.directive('piiDataPage', (reactDirective) => {
  return reactDirective(PIIDataPage, []);
});

app.directive('piiDataApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'piiDataApp',
    controller: function ($route, $scope, Private) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.PIIDATA);
        $scope.$emit('application.load');
      }

      init();
    },
  };
});
