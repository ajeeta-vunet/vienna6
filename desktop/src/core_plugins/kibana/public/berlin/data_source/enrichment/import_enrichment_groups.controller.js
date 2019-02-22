import '../../styles/vunet_import_form.less';

class ImportEnrichmentGroupsCtrl {
  constructor($scope, HTTP_SUCCESS_CODE, StateService, Upload, $modalInstance) {

    $scope.successfulUpload = false;

    // Function to upload the file we are allowing only xlsx file as of now
    $scope.upload_data_source_enrichment_file = function (uploadFile) {
      StateService.importDataEnrichment(uploadFile, Upload).then(response => {
        if (response.status === HTTP_SUCCESS_CODE) {
          $scope.successfulUpload = true;
          $scope.File = null;
          // We remove the succes message after 4 sec
          setTimeout(function () {
            $scope.closeModal();
          }, 4000);
        }
      });
      // This is to reset the variable after the upload is done
      $scope.successfulUpload = false;
    };

    // Function to download sample file.
    $scope.get_sample_data = () => {
      StateService.downloadSampleDataEnrichment();
    };

    $scope.closeModal = () => {
      $modalInstance.dismiss('cancel');
    };

  }
}

ImportEnrichmentGroupsCtrl.$inject = ['$scope', 'HTTP_SUCCESS_CODE', 'StateService', 'Upload', '$modalInstance'];
/*eslint-disable*/
export default ImportEnrichmentGroupsCtrl;
/*eslint-enable*/
