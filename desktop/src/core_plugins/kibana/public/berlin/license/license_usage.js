import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { LicenseUsagePage } from './LicenseUsagePage';

const app = uiModules.get('app/berlin', []);

//License usage react component
app.directive('licenseUsagePage', (reactDirective) => {
  return reactDirective(LicenseUsagePage, [
    'licenseModulesUsageLimit',
    'licenseModulesActiveUsage',
  ]);
});

app.directive('licenseUsageApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'licenseUsageApp',
    controller: function ($route, $scope, Private) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.LICENSE_USAGE);
      }
      //passing these to the LicenseUsagePage react component
      $scope.licenseModulesUsageLimit = $route.current.locals.licenseModulesUsageLimit;
      $scope.licenseModulesActiveUsage = $route.current.locals.licenseModulesActiveUsage;

      init();
    },
  };
});
