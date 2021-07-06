import './styles/_import_vublock_popup.less';

class importvublockPopupCtrl {
  constructor($scope, vublockList, importType, vuBlockId, $injector, $uibModalInstance, StateService, Upload, HTTP_SUCCESS_CODE, chrome) {
    // const Private = $injector.get('Private');
    $scope.vublockList = vublockList;
    $scope.importType = importType;
    $scope.vuBlockId = vuBlockId;
    $scope.successfulUpload = false;
    $scope.data_source = $scope.vuBlockId + '.xlsx';
    const tentantInfo = chrome.getTenantBu();
    $scope.indexStringInfo = tentantInfo[0] + '-' + tentantInfo[1];
    $scope.loading = false;

    $scope.dataSourceImportLink =
      chrome.getUrlBase() +
      '/vublock/' +
      vuBlockId +
      '/source_bulk/export?blank=True';

    // This function imports a xls file containing the data source types
    // for a vublock.
    $scope.upload_data_source_file = function (uploadFile) {
      $scope.loading = true;
      StateService.importVublockDataSources(uploadFile, Upload, vuBlockId)
        .then(() => {
          $scope.loading = false;
          $scope.successfulUpload = true;
          // We reload the page after 400 msec as it takes some time
          // for ES to index the documents
          setTimeout(function () {
          }, 400);
        })
        .catch((err) => {
          $scope.loading = false;
          $scope.errorFile = 'file://' + err.data.error_file;
          $scope.errorMessage = err.data.message;
        });
      // This is to reset the variable after the upload is done
      $scope.successfulUpload = false;
    };

    // This function imports a json file containing the data for one or more vublock
    // into a vublock configuration index.
    $scope.upload_vuBlock_file = function (uploadFile) {
      $scope.loading = true;
      StateService.importvuBlock(uploadFile, Upload)
        .then(() => {
          $scope.loading = false;
          $scope.successfulUpload = true;
          // We reload the page after 400 msec as it takes some time
          // for ES to index the documents
          setTimeout(function () {
          }, 400);
        })
        .catch(() => {
          $scope.loading = false;
        });
      // This is to reset the variable after the upload is done
      $scope.successfulUpload = false;
    };
  }
}

importvublockPopupCtrl.$inject = ['$scope', 'vublockList', 'importType', 'vuBlockId',
  '$injector', '$uibModalInstance', 'StateService', 'Upload', 'HTTP_SUCCESS_CODE', 'chrome'];
/*eslint-disable*/
export default importvublockPopupCtrl;
/*eslint-enable*/