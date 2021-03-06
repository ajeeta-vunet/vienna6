import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui_framework/src/vunet_components/vunet_sidebar/vunet_sidebar_constants';
import { DiscoveryPage } from './components/DiscoveryPage/DiscoveryPage';

require('plugins/kibana/discovery/discovery.less');

const app = uiModules.get('app/discovery', []);

//Discovery react component
app.directive('discoveryPage', (reactDirective) => {
  return reactDirective(DiscoveryPage, ['credList', 'sourceIpAddressList']);
});

app.directive('discoveryApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'discoveryApp',
    controller: function ($route, $scope, Private) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.DISCOVERY);
        $scope.$emit('application.load');
      }

      //passing these to the DiscoveryPage react component
      $scope.credList = $route.current.locals.credList;
      $scope.sourceIpAddressList = $route.current.locals.sourceIpAddressList;

      init();
    },
  };
});
