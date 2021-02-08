import '../../styles/vunet_import_form.less';
import './files.less';

class UploadFilesCtrl {
  constructor($scope, HTTP_SUCCESS_CODE, StateService, Upload, $modalInstance, MAXIMUM_FILE_SIZE, Notifier) {

    const notify = new Notifier();
    $scope.successfulUpload = false;

    // fileUploadError Flag pass to the checkFileSize directive.
    $scope.fileUploadError = false;

    // This function gets called on selecting a file
    $scope.checkFileSize = (file) => {

      // Error message to display if file size is more than 200 MB.
      if(file && file.size > MAXIMUM_FILE_SIZE) {
        $scope.fileUploadError = true;
        $scope.fileUploadErrorMessage = 'Size of this file exceeds limit of 200 MB';
      } else if(file) {

        // Set error to false if file is there with size less than 200 MB.
        $scope.fileUploadError = false;
      }
    };

    // function to upload file
    $scope.uploadFiles = (File) => {
      return StateService.uploadFgwFiles(File, Upload)
      .then(function (response) {
        if (response.status === HTTP_SUCCESS_CODE) {
          $modalInstance.close();
          // Notify  success message for successful upload.
          notify.info(`File successfully Uploaded`);

        }
        else {
          $scope.fileUploadError = true;
          // To print error string to the user.
          $scope.fileUploadErrorMessage = response.data['error-string'];
        }
      })
      .catch(function (response) {
          $scope.fileUploadError = true;
          // To print error string to the user.
          $scope.fileUploadErrorMessage = response.data['error-string'];
      })
    };

    // To close a modal.
    $scope.closeModal = () => {
      $modalInstance.dismiss('cancel');
    };

  }
}

UploadFilesCtrl.$inject = ['$scope', 'HTTP_SUCCESS_CODE', 'StateService', 'Upload', '$modalInstance', 'MAXIMUM_FILE_SIZE', 'Notifier'];
/*eslint-disable*/
export default UploadFilesCtrl;
/*eslint-enable*/
