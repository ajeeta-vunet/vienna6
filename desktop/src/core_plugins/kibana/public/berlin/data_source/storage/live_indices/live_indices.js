import { uiModules } from 'ui/modules';
import _ from 'lodash';
const app = uiModules.get('app/berlin');
import '../vunet_storage.less';

app.directive('liveIndices', function () {
  return {
    restrict: 'E',
    controllerAs: 'liveIndices',
    controller: liveIndices,
    scope: true
  };
});

function liveIndices($scope,
  $http,
  $window,
  StateService
) {

  $scope.indicesList = [];

  // Indices meta data is used to show the list of live-indices
  $scope.liveIndicesMeta = {
    headers: ['Index Name', 'State', 'Size'],
    rows: ['index_name', 'state', 'size'],
    id: 'index_name',
    add: false,
    edit: false,
    tableAction: [{ button: 'open' }, { button: 'close' }, { button: 'archive' }],
    default: { active: 'dash1' },
    forceUpdate: false
  };

  $scope.showModal = false;

  // Modal data which is used to show the details
  $scope.modalData = {
    title: '',
    message: '<h4> The following indices will be opened <p>' + $scope.indicesList + '</p></h4>',
    editData: { archiveList: $scope.indicesList },
    item: [{
      key: 'archiveName',
      label: 'Archive name',
      type: 'text',
      name: 'archiveName',
      props: {
        required: true,
        pattern: '^[^_A-Z#,/\?|><"* ][^A-Z#,/\?|><"* ]{1,64}'
      },
      errorText: `Archive Name cannot start with "_" , can only be in lowercase , can't exceed 64 characters
                  and can't contain special characters(#,/\?|><"*) or whitespcae. `
    },
    {
      key: 'archiveList',
      label: 'Indices to be archived',
      type: 'textarea',
      name: 'archiveList',
      props: {
        required: true,
        pattern: '.*',
        disabled: true
      },
      errorText: 'Invalid Archive Name.'
    }]
  };

  function init() {
  }

  // This is called when one of the table action button has been clicked
  $scope.onTableAction = (eventType, rows) => {

    // First, let us create a list based on what is selected..
    $scope.indicesList = [];
    _.forEach(rows, function (row) {
      $scope.indicesList.push(row.index_name);
    });

    $scope.indicesListHtml = $scope.indicesList.map(n =>
      '<li style="list-style:none; margin-bottom:10px">' + n + '</li>').join('');

    $scope.showModal = true;
    $scope.modalData.eventType = eventType;

    // Create a modal with right data based on the button that was clicked..
    if (eventType === 'archive') {
      $scope.modalData.isForm = true;
      $scope.modalData.title = 'Archive Indices';
      $scope.modalData.editData.archiveList = $scope.indicesList;
    } else if (eventType === 'close') {
      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Close Indices';
      $scope.modalData.indices = $scope.indicesList;
      $scope.modalData.message = '<h4 class="closed-indices-popup"> The following indices will be closed <p><ul>' +
        $scope.indicesListHtml + '</ul></p></h4>';
    } else {
      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Open Indices';
      $scope.modalData.indices = $scope.indicesList;
      $scope.modalData.message = '<h4 class="open-indices-popup"> The following indices will be opened <p><ul>' +
        $scope.indicesListHtml + '</ul></p></h4>';
    }

    return Promise.resolve(false);
  };

  // Close the modal..
  $scope.onModalClose = () => {
    $scope.showModal = false;
  };

  // When Modal is submitted.. update the liveIndices state
  // based on what user wants..
  $scope.onModalSubmit = (event) => {
    let action = {};
    if (event.eventType === 'archive') {
      action = {
        'operations': [
          {
            'type': event.eventType,
            'indices': $scope.indicesList,
            'name': event.archiveName
          }
        ]
      };
    } else if (event === 'open') {
      action = {
        'operations': [
          {
            'type': event,
            'indices': $scope.indicesList,
          }
        ]
      };
    } else {
      action = {
        'operations': [
          {
            'type': event,
            'indices': $scope.indicesList,
          }
        ]
      };
    }

    // Update the live indices..
    return StateService.updateLiveIndices(action).then(function () {
      // Refreshing the table forcefully.
      $scope.liveIndicesMeta.forceUpdate = true;
    });
    $scope.showModal = false;
  };

  // There is no row level action..
  $scope.onRowAction = () => {
    return Promise.resolve(false);
  };

  // Delete selected items is not possible..
  $scope.deleteSelectedItems = () => {
    return new Promise((resolve) => {
      return resolve('');
    });
  };

  // Fetch all the Live Indices data
  $scope.fetchItems = () => {

    // Get the live indices from backend and populate local data..
    return StateService.getLiveIndices().then(function (data) {
      $scope.open_indices = data.summary.open;
      $scope.closed_indices = data.summary.closed;
      $scope.loading_indices = data.summary.loading;

      // If this was because something had changed. reset the
      // forceUpdate
      $scope.liveIndicesMeta.forceUpdate = false;
      return data.details;
    });
  };

  init();
}
