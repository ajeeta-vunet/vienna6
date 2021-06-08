import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import Devices from './components/devices/devices';
import './deviceConfiguration.less';

const app = uiModules.get('app/deviceConfiguration', []);

// Devices react component(also the root component for DCM)
app.directive('devices', (reactDirective) => {
  return reactDirective(Devices);
});

app.directive('deviceConfigurationApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'deviceConfigurationApp',
    controller: function ($scope, Private) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.DEVICE_CONFIGURATION);
        $scope.$emit('application.load');
      }
      init();
    },
  };
});