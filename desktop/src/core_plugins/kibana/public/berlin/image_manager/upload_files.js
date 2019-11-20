import './files.less';

class UploadFilesCtrl {
  constructor($scope, HTTP_SUCCESS_CODE, StateService, Upload, $modalInstance, MAXIMUM_IMAGE_FILE_SIZE, Notifier) {
    // const imageTypeList = [''];
    const notify = new Notifier();
    $scope.successfulUpload = false;
    const imageTypeList = ['image/png', 'image/jpeg', 'image/svg', 'image/jpg'];

    // fileUploadError Flag pass to the checkFileSizeAndType directive.
    $scope.fileUploadError = false;

    // This function gets called on selecting a file
    $scope.checkFileSizeAndType = (file) => {

      if(file && file.size > MAXIMUM_IMAGE_FILE_SIZE) {
        // Error message to display if file size is more than 50 KB.
        $scope.fileUploadError = true;
        $scope.imageUploadErrorMessage = 'Size of this file exceeds limit of 50 KB';
      } else if ((file && !imageTypeList.includes(file.type))) {
        // Error message to display if file type is not in png, svg, jpeg and jpg.
        $scope.fileUploadError = true;
        $scope.imageUploadErrorMessage = 'Only png, svg, jpg or jpeg image files are allowed';
      } else if(file) {

        // Set error to false if file is there with size less than 50 KB
        // and file type is in imageTypeList.
        $scope.fileUploadError = false;
      }
    };

    // function to upload file
    $scope.uploadImageFiles = (File, fileUsage, imageName) => {
      return StateService.uploadImageFile(Upload, fileUsage, File, imageName).then(function (response) {
        if (response.status === HTTP_SUCCESS_CODE) {
          $modalInstance.close();

          // Notify  success message for successful upload.
          notify.info(`Image successfully Uploaded`);

        } else {
          $scope.fileUploadError = true;
        }
      });
    };

    // To close a modal.
    $scope.closeModal = () => {
      $modalInstance.dismiss('cancel');
    };

  }
}

UploadFilesCtrl.$inject = ['$scope', 'HTTP_SUCCESS_CODE', 'StateService', 'Upload', '$modalInstance',
  'MAXIMUM_IMAGE_FILE_SIZE', 'Notifier'];
/*eslint-disable*/
export default UploadFilesCtrl;
/*eslint-enable*/
