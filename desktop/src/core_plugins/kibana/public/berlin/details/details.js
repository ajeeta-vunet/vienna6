

/* globals window */

import _ from 'lodash';

class DetailsCtrl {
  constructor($scope, Upload, StateService, HTTP_SUCCESS_CODE, $uibModal, chrome, $rootScope) {
    $scope.showLicenceTab = false;
    $scope.showTenantInfo = true;
    $scope.showLicenceComponentInfo = false;
    $scope.showServerInfoTab = false;
    $scope.tenantData = {};
    StateService.getTenantInfo().then(function (data) {
      $scope.tenantData.name = data.name;
      $scope.tenantData.tenant_description = data.tenant_description;
      $scope.tenantData.tenant_created_time = data.tenant_created_time;
      $scope.tenantData.enterprise_name = data.enterprise_name;
      $scope.tenantData.email = data.email;
      $scope.tenantData.phone_no = data.phone_no;
      $scope.nodes = data.no_of_nodes;
      $scope.gbPerDay = data.gb_per_day;
      $scope.tenantData.licence_expiry_date = data.licence_valid;
    });


    // Check if the binary is for internal
    // or official purpose.
    const checkReleaseType = function (platformVersion) {
      // check if platformVersion is having 'r' or 'R'
      if(platformVersion.match(/[r]/i))
      {
        return true;
      }
      else
      {
        return false;
      }
    };

    // Fetch the release version from the json and display.
    StateService.getReleaseInfo().then(function (data) {
      $scope.platformVersion = data.platform_info.version;
      $scope.showLicenceComponentInfo = checkReleaseType($scope.platformVersion);
      $scope.cairoVersion = data.platform_info.component_version.cairo;
      $scope.berlinVersion = data.platform_info.component_version.berlin;
      $scope.viennaVersion = data.platform_info.component_version.vienna;
    });

    // Function triggered when tenant info is filled and clicked
    // on next
    $scope.showLicencePage = () =>{
      $scope.showLicenceTab = true;
      $scope.showTenantInfo = false;
      StateService.updateTenantInfo(
        $scope.tenantData).then(() => {
      });
    };


    // function triggered when clicked on previous button
    $scope.showTenantInfoPage = () =>{
      $scope.showLicenceTab = false;
      $scope.showTenantInfo = true;
    };

    // function to edit company details from 'about' page.
    $scope.editTenantInfo = (tenantData) => {
      const modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/details/editDetails.html',
        controller: 'EditDetailsCtrl'
      });

      modalInstance.enterprise_name = tenantData.enterprise_name;
      modalInstance.email = tenantData.email;
      modalInstance.phone_no = tenantData.phone_no;
      modalInstance.tenant_description = tenantData.tenant_description;
      modalInstance.tenant_created_time = tenantData.tenant_created_time;
      modalInstance.name = tenantData.name;

      modalInstance.result.then((details) => {
        StateService.updateTenantInfo(details).then(function () {
          $scope.tenantData.enterprise_name = details.enterprise_name;
          $scope.tenantData.email = details.email;
          $scope.tenantData.phone_no = details.phone_no;
        });
      });
    };

    // Toggle functionality of licence upload
    $scope.uploadVisible = false;
    $scope.toggleUpload = function () {
      $scope.uploadVisible = !$scope.uploadVisible;
    };

    // Regex for inputfields
    // Following things are in rootScope because these patterns should
    // be available to access across other controllers. In this case,
    // edit controller also needs the below defined patterns.
    $rootScope.enterpriseNamePattern = /^[a-zA-Z0-9!,.()/@#$%^&*\s]{3,100}$/;
    /*eslint-disable*/
    $rootScope.emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,32})$/i;
    /*eslint-enable*/
    $rootScope.phonePattern = /^\d{10}$/;

    $scope.successfulUpload = false;
    $scope.upload = function (file) {
      StateService.updateLicenceDetails(file, Upload).then((response) => {
        if (response.status === HTTP_SUCCESS_CODE) {
          $scope.successfulUpload = true;
          $scope.File = null;
          $scope.showLicenceTab = false;
          if (chrome.canManageLicense()) {
            $scope.showServerInfoTab = true;
          }
          StateService.getServerInformation().then(function (data) {
            $scope.serverInformation = data;
            /*eslint-disable*/
            $scope.actualServerInformation = angular.copy($scope.serverInformation);
            /*eslint-enable*/
          });
        }
      });
      // This is to reset the variable after the upload is done.
      $scope.successfulUpload = false;
    };

    // Function triggered when server information is edited and
    // 'DONE' button is clicked.
    $scope.saveServerInfo = (updatedServerInformation) => {
      $scope.showServerInfoTab = false;
      // Make the backend call only if server info is modified
      if(!(_.isEqual($scope.actualServerInformation, updatedServerInformation)))
      {
        StateService.editServerInformation(updatedServerInformation).then(function () {
          window.location.reload();
        });
      }
      else {
        window.location.reload();
      }
    };
  }
}

DetailsCtrl.$inject = ['$scope', 'Upload', 'StateService', 'HTTP_SUCCESS_CODE', '$uibModal', 'chrome', '$rootScope'];
/*eslint-disable*/
//export default DetailsCtrl;
/*eslint-enable*/

import detailsDirectiveTemplate from 'plugins/kibana/berlin/details/details_directive.html';
import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');

app.controller('DetailsCtrl', DetailsCtrl);

app.directive('licenceDetails', function () {
  return {
    restrict: 'E',
    controllerAs: 'licenceDetailsCtrl',
    controller: licenceDetailsCtrl,
  };
});

function licenceDetailsCtrl($scope,
  $rootScope,
  StateService,
  $uibModal
) {
  /*eslint-disable*/
  const modalInstance = $uibModal.open({
    animation: true,
    template: detailsDirectiveTemplate,
    controller: 'DetailsCtrl'
  });
  /*eslint-enable*/
}
