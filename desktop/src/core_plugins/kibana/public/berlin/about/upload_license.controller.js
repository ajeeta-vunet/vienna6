import './upload_license.less';

class UploadLicenseCtrl {
  constructor($scope, StateService, Upload, $modalInstance) {

    $scope.successfulUpload = false;

    // Upload the file...
    $scope.upload = function (file) {
      StateService.updateLicenceDetails(file, Upload).then((response) => {
        if (response.status === 200) {
          $scope.successfulUpload = true;
          $scope.File = null;
          // We remove the succes message after 4 sec
          setTimeout(function () {
            $scope.closeModal();
          }, 4000);
        }
      });
      // This is to reset the variable after the upload is done.
      $scope.successfulUpload = false;
    };

    $scope.closeModal = () => {
      $modalInstance.dismiss('cancel');
    };
  }
}

UploadLicenseCtrl.$inject = ['$scope', 'StateService', 'Upload', '$modalInstance'];
/*eslint-disable*/
export default UploadLicenseCtrl;
/*eslint-enable*/
