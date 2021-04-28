import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { LicenseUsagePage } from './LicenseUsagePage';
import UploadLicenseTemplate from './LicenseUpload/upload_license.html';
import UploadLicenseCtrl from './LicenseUpload/upload_license.controller.js';

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
    controller: function ($route, $scope, Private, $modal) {
      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.LICENSE_USAGE);
      }
      //passing these to the LicenseUsagePage react component
      $scope.licenseModulesUsageLimit =
        $route.current.locals.licenseModulesUsageLimit;
      $scope.licenseModulesActiveUsage =
        $route.current.locals.licenseModulesActiveUsage;
      //This method will execute once user try to upload license file
      $scope.openLicenseModal = function () {
        $modal
          .open({
            animation: true,
            template: UploadLicenseTemplate,
            controller: UploadLicenseCtrl,
            windowClass: 'upload-license-modal',
          })
          .result.then(
            function () {
              // Nothing to do once the license upload modal is submitted.
            },
            function () {
              // This callback is added to avoid the following
              // warning in console:Possibly unhandled rejection: cancel
              // 'Possibly unhandled rejection: cancel'
            }
          );
      };
      init();
    },
  };
});
