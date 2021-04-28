import './upload_license.less';

class UploadLicenseCtrl {
  constructor(
    $scope,
    HTTP_SUCCESS_CODE,
    StateService,
    Upload,
    $modalInstance,
    Notifier
  ) {
    $scope.successfulUpload = false;
    const notify = new Notifier();
    // fileUploadError Flag
    $scope.fileUploadError = false;

    // Upload the file...
    $scope.upload = function (file) {
      StateService.updateLicenceDetails(file, Upload)
        .then((response) => {
          if (response.status === HTTP_SUCCESS_CODE) {
            $scope.successfulUpload = true;
            $scope.File = null;
            $scope.closeModal();
            // Notify  success message for successful import.
            notify.info(`File successfully submitted`);
          }
        })
        .catch(function (response) {
          $scope.fileUploadError = true;
          // To print error string to the user.
          // Getting 500 error some times, some times data is null, So added a ternerary condition as below
          const resonseStatusString =
            response.statusText !== undefined
              ? response.statusText
              : 'Some internal server error';
          const responseErrorString =
            response.data['error-string'] !== undefined
              ? response.data['error-string']
              : resonseStatusString;
          $scope.fileUploadErrorMessage = response.data
            ? responseErrorString
            : 'Some internal server error';
        });
      // This is to reset the variable after the upload is done.
      $scope.successfulUpload = false;
    };

    // This method is to enable submit button when we change any selected file
    $scope.onSelect = (file) => {
      if (file) {
        $scope.fileUploadError = false;
      }
    };

    $scope.closeModal = () => {
      $modalInstance.dismiss('cancel');
    };
  }
}

UploadLicenseCtrl.$inject = [
  '$scope',
  'HTTP_SUCCESS_CODE',
  'StateService',
  'Upload',
  '$modalInstance',
  'Notifier',
];
/*eslint-disable*/
export default UploadLicenseCtrl;
/*eslint-enable*/
