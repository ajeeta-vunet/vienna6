import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import UploadImageFilesCtrl from './upload_files.js';
import UploadImageFilesTemplate from './upload_files.html';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
const chrome = require('ui/chrome');

app.directive('imageManagementInterface', function () {
  return {
    restrict: 'E',
    controllerAs: 'imageManagementInterfaceController',
    controller: imageManagementInterfaceController,
  };
});

function imageManagementInterfaceController($injector,
  $scope,
  StateService,
  $modal) {

  // Init function
  function init() {

    // Always display doc title as 'Image Management Interface'
    const Private = $injector.get('Private');
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.IMAGEMANAGER);
  }

  // Image management meta.
  $scope.imagesMeta = {
    headers: ['Image name', 'Uploaded for', 'Preview'],
    rows: ['image_name', 'uploaded_for',  'preview'],
    id: 'image_name',
    tableAction: [{ button: 'delete' }],
    add: false,
    edit: false,
    forceUpdate: false,
  };

  //function to opens a modal.
  $scope.openUploadModal = function () {
    $modal.open({
      animation: true,
      template: UploadImageFilesTemplate,
      controller: UploadImageFilesCtrl,
      windowClass: 'upload-file-modal'
    }).result.then(function () {
      $scope.imagesMeta.forceUpdate = true;
    }, function () {
      $scope.imagesMeta.forceUpdate = false;
    });
  };

  // Assigning empty object to the $scope.imagesDeleteMeta.
  $scope.imagesDeleteMeta = {};

  // This is called when a button on table is clicked..
  $scope.onTableAction = (eventType, rows) => {

    if (eventType === 'delete') {
      $scope.showModal = true;
      $scope.imagesDeleteMeta.rows = rows;
      $scope.imagesDeleteMeta.isForm = false;
      $scope.imagesDeleteMeta.title = 'Delete';
      $scope.imagesDeleteMeta.message = '<h4>Are you sure you want to delete the selected image(s)? <p><ul>';
      $scope.imagesDeleteMeta.eventType = eventType;
    }
    return Promise.resolve(true);
  };

  // This is called on modal submit.
  $scope.onModalSubmit = (event) => {
    $scope.showModal = false;
    if (event === 'delete') {
      return $scope.imagesDeleteMeta.rows.map((row) => {
        StateService.deleteUploadedImage(row.image_name).then(function () {
          $scope.imagesMeta.forceUpdate = true;
        });
      });
    }
  };

  // Close the modal..
  $scope.onModalClose = () => {
    $scope.showModal = false;
  };

  // fetch image management items to display.
  $scope.fetchImagesItems = () => {
    // We are making an API to get the response even though we have response
    // available in local, because after uploading any new images getting response
    // in locally takes time at that time images will not render in to a table.
    return StateService.getUploadedImages().then(function (data) {
      let imageFiles = [];
      const tenantBuList = chrome.getTenantBu();

      // Update the image files from data returned by backend.
      imageFiles = data.visualization.map((imageData) => {

        // Prepare the image path using the tenant and bu id.
        const imgPath = `/ui/vienna_images/${tenantBuList[0]}/${tenantBuList[1]}/visualization/${imageData['file-name']}`;
        return ({
          'image_name': imageData.name,
          'uploaded_for': 'visualization',
          'preview': { 'image': imgPath }
        });
      });

      // Update logo image in image files list.
      data.logo && data.logo.length > 0 && data.logo.map((logoData) => {

        // Prepare the image path using the tenant and bu id.
        const imgPath = `/ui/vienna_images/${tenantBuList[0]}/${tenantBuList[1]}/logo/${logoData['file-name']}`;
        imageFiles.push({
          'image_name': logoData.name,
          'uploaded_for': 'Logo',
          'preview': { 'image': imgPath }
        });
      });
      $scope.imagesMeta.forceUpdate = false;
      return imageFiles;
    });
  };

  init();
}
