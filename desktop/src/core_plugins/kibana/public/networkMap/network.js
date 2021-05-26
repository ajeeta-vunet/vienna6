import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { NetworkMap } from './components/NetworkMap/NetworkMap';

require('plugins/kibana/assetsPage/assets.less');

const app = uiModules.get('app/assets', []);

//Assets react component
app.directive('networkMap', (reactDirective) => {
  return reactDirective(NetworkMap, ['assetList', 'assetDetailsSummary']);
});

app.directive('networkMapApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'networkMapApp',
    controller: function ($route, $scope, Private) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.ASSETS);
        $scope.$emit('application.load');
      }

      // passing these to the AssetsPage react component
      $scope.assetList = $route.current.locals.assetList;
      $scope.assetDetailsSummary = $route.current.locals.assetDetailsSummary;

      init();
    },
  };
});
