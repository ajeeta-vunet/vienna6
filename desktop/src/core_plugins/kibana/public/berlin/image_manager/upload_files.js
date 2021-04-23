import './files.less';

class UploadFilesCtrl {
  constructor($scope, HTTP_SUCCESS_CODE, StateService, Upload, $modalInstance, MAXIMUM_IMAGE_FILE_SIZE, Notifier) {
    // const imageTypeList = [''];
    const notify = new Notifier();
    $scope.successfulUpload = false;
    const imageTypeList = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

    // fileUploadError Flag pass to the checkFileSizeAndType directive.
    $scope.fileUploadError = false;

    // This function gets called on selecting a file
    $scope.checkFileSizeAndType = (file) => {
      // Creating a regex to check file name that gets uploaded.
      // The regex will check the following:
      // Will have characters between 2 to 30.
      // only contains alphanumeric characters with special characters ( _.- )
      // This is done to prevent issues in loading the image urls
      const regex = RegExp('^[a-zA-Z0-9_.-]{2,29}$');
      if(file && file.size > MAXIMUM_IMAGE_FILE_SIZE) {
        // Error message to display if file size is more than 50 KB.
        $scope.fileUploadError = true;
        $scope.imageUploadErrorMessage = 'Size of this file exceeds limit of 50 KB';
      } else if ((file && !imageTypeList.includes(file.type))) {
        // Error message to display if file type is not in png, svg, jpeg and jpg.
        $scope.fileUploadError = true;
        $scope.imageUploadErrorMessage = 'Only png, svg, jpg or jpeg image files are allowed';
      } else if(regex.test(file.name) === false) {
        $scope.fileUploadError = true;
        $scope.imageUploadErrorMessage = `Image file name length must be between 3-30 characters.
          Name may only contain alphanumeric characters and ( _.- ) characters.`;
      } else if(file) {
        // Set error to false if file is there with size less than 50 KB
        // and file type is in imageTypeList.
        $scope.fileUploadError = false;
      }
    };

    // fileUploadError Flag
    $scope.fileUploadError = false;

    // function to upload file
    $scope.uploadImageFiles = (File, fileUsage, imageName) => {
      return StateService.uploadImageFile(Upload, fileUsage, File, imageName)
        .then(function (response) {
          if (response.status === HTTP_SUCCESS_CODE) {
            $modalInstance.close();

            // Notify  success message for successful upload.
            notify.info(`Image successfully Uploaded`);

          } else {
            $scope.fileUploadError = true;
          }
        }).catch(function (response) {
          $scope.fileUploadError = true;
          // To print error string to the user.
          $scope.fileUploadErrorMessage = response.data['error-string'];
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
