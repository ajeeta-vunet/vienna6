import './upload_license.less';

class UploadLicenseCtrl {
  constructor($scope, StateService, Upload, $modalInstance, Notifier) {

    $scope.successfulUpload = false;
    const notify = new Notifier();

    // Upload the file...
    $scope.upload = function (file) {
      StateService.updateLicenceDetails(file, Upload).then((response) => {
        if (response.status === 200) {
          $scope.successfulUpload = true;
          $scope.File = null;
          $scope.closeModal();

          // Notify  success message for successful import.
          notify.info(`File successfully submitted`);
        }
      }).catch(() => {
        $scope.closeModal();
      });
      // This is to reset the variable after the upload is done.
      $scope.successfulUpload = false;
    };

    $scope.closeModal = () => {
      $modalInstance.dismiss('cancel');
    };
  }
}

UploadLicenseCtrl.$inject = ['$scope', 'StateService', 'Upload', '$modalInstance', 'Notifier'];
/*eslint-disable*/
export default UploadLicenseCtrl;
/*eslint-enable*/
