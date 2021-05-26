import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { AssetsPage } from './components/AssetsPage/AssetsPage';

require('plugins/kibana/assetsPage/assets.less');

const app = uiModules.get('app/assets', []);

//Assets react component
app.directive('assetsPage', (reactDirective) => {
  return reactDirective(AssetsPage, [
    'assetList',
    'deviceTypeList',
    'vendorList',
    'assetDetailsSummary',
  ]);
});

app.directive('assetsApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'assetsApp',
    controller: function ($route, $scope, Private) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.ASSETS);
        $scope.$emit('application.load');
      }

      //passing these to the AssetsPage react component
      $scope.assetList = $route.current.locals.assetList;
      $scope.deviceTypeList =
        $route.current.locals.vendorDeviceInfo.device_list;
      $scope.vendorList = $route.current.locals.vendorDeviceInfo.vendor_list;
      $scope.assetDetailsSummary = $route.current.locals.assetDetailsSummary;

      init();
    },
  };
});
