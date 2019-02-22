import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import UploadFilesCtrl from './upload_files.js';
import UploadFilesTemplate from './upload_files.html';
app.directive('vunetFiles', function () {
  return {
    restrict: 'E',
    controllerAs: 'vunetFiles',
    controller: vunetFiles,
  };
});
function vunetFiles($scope,
  StateService,
  $modal) {

  // Init function
  function init() {
  }

  $scope.open_upload = false;

  // File management meta.
  $scope.filesMeta = {
    headers: ['File name', 'Size', 'Last Modified Time'],
    rows: ['file_name', 'size', 'last_modified_time'],
    rowAction: [{ name: 'Download', icon: 'fa fa-download', toolTip: 'Click here to download this file' }],
    id: 'file_name',
    tableAction: [{ button: 'delete' }],
    add: false,
    edit: false,
    forceUpdate: false,
  };

  //function to opens a modal.
  $scope.openUploadModal = function () {
    $scope.open_upload = true;
    $modal.open({
      animation: true,
      template: UploadFilesTemplate,
      controller: UploadFilesCtrl,
      windowClass: 'upload-file-modal'
    }).result.then(function () {
      $scope.filesMeta.forceUpdate = true;
    }, function () {
      $scope.filesMeta.forceUpdate = false;
    });
  };

  // Assigning empty object to the $scope.filesDeleteMeta.
  $scope.filesDeleteMeta = {};

  // This is called when a button on table is clicked..
  $scope.onTableAction = (eventType, rows) => {

    if (eventType === 'delete') {
      $scope.showModal = true;
      $scope.filesDeleteMeta.row = rows;
      $scope.filesDeleteMeta.isForm = false;
      $scope.filesDeleteMeta.title = 'Delete';
      $scope.filesDeleteMeta.message = '<h4>Are you sure you want to delete the selected file(s)? <p><ul>';
      $scope.filesDeleteMeta.eventType = eventType;
    }
    return Promise.resolve(true);
  };

  // This is called on modal submit.
  $scope.onModalSubmit = (event) => {
    $scope.showModal = false;
    if (event === 'delete') {
      return $scope.filesDeleteMeta.row.map((row) => {
        StateService.deleteFgwFiles(row.file_name).then(function () {
          $scope.filesMeta.forceUpdate = true;
        });
      });
    }
  };

  // Close the modal..
  $scope.onModalClose = () => {
    $scope.showModal = false;
  };

  // To download a file.
  $scope.onRowAction = (e, rowId) => {
    return StateService.downloadFgwFile(rowId).then(function () {
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };

  // fetch management items to display.
  $scope.fetchFilesItems = () => {

    return StateService.getFgwFiles().then(function (data) {
      const files = data.file_info.map((fileData) => {
        return {
          'file_name': fileData.name,
          'last_modified_time': fileData['modified-time'],
          'size': fileData.size
        };
      });
      $scope.filesMeta.forceUpdate = false;
      return files;
    });
  };

  init();
}
