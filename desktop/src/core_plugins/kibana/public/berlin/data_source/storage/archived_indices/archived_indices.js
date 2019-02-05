import { uiModules } from 'ui/modules';
import _ from 'lodash';
const app = uiModules.get('app/berlin');

app.directive('archivedIndices', function () {
  return {
    restrict: 'E',
    controllerAs: 'archivedIndices',
    controller: archivedIndices,
    scope: true
  };
});

function archivedIndices($scope,
  $http,
  $window,
  StateService
) {

  // Meta-data used for the Modal for showing up archived indices
  $scope.archivedIndicesMeta = {
    headers: ['Archive Name', 'Archive State', 'Indices', 'Archive Time'],
    rows: ['archive_name', 'archive_state', 'indices', 'archive_start_time'],
    id: 'archive_name',
    add: false,
    edit: false,
    tableAction: [{ button: 'restore' }, { button: 'delete' }],
    default: { active: 'dash1' },
    forceUpdate: false
  };

  // Modal used for deleting and archiving the indices
  $scope.showModal = false;
  $scope.modalData = {
    title: '',
    message: '<h4> The following archives will be restored. Any existing data under these archives will be refreshed.</h4>',
    editData: { archiveList: $scope.indicesList },
    item: [{
      key: 'archiveName',
      label: 'Archive name',
      type: 'text',
      name: 'archiveName',
      props: {
        required: true,
        pattern: '.*'
      },
      errorText: 'Invalid Archive Name.'
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

  // This is called when a button on table is clicked..
  $scope.onTableAction = (eventType, rows) => {
    $scope.archiveNameList = [];
    _.forEach(rows, function (row) {
      $scope.archiveNameList.push(row.archive_name);
    });

    $scope.archiveNameListHtml = $scope.archiveNameList.map(n =>
      '<li style="list-style:none; margin-bottom:10px">' + n + '</li>').join('');

    $scope.showModal = true;
    $scope.modalData.eventType = eventType;
    if (eventType === 'restore') {
      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Restore';
      $scope.modalData.message = '<h4>The following archives will be restored.' +
       'Any existing data under these archives will be refreshed.<p><ul>' +
        $scope.archiveNameListHtml + '</ul></p></h4>';
    } else if (eventType === 'delete') {
      $scope.modalData.isForm = false;
      $scope.modalData.title = 'Delete Indices';
      $scope.modalData.indices = $scope.archiveNameList;
      $scope.modalData.message = '<h4> The following archives will be deleted <p><ul>' +
        $scope.archiveNameListHtml + '</ul></p></h4>';
    }

    return Promise.resolve(true);
  };


  // Close the modal
  $scope.onModalClose = () => {
    $scope.showModal = false;
  };

  // there is currently no row action
  $scope.onRowAction = () => {
    return Promise.resolve(false);
  };

  // This is called on modal submit..
  $scope.onModalSubmit = (event) => {
    let action = {};
    if (event === 'restore') {
      action = {
        'operations': [
          {
            'type': event,
            'name': $scope.archiveNameList,
          }
        ]
      };

    } else if (event === 'delete') {
      action = {
        'operations': [
          {
            'type': event,
            'name': $scope.archiveNameList,
          }
        ]
      };
    }

    // Invoke the archiveIndices
    return StateService.updateArchivedIndices(action).then(function () {

      // Refreshing the table forcefully.
      $scope.archivedIndicesMeta.forceUpdate = true;

    });
    $scope.showModal = false;
  };

  $scope.deleteSelectedItems = () => {
    return new Promise((resolve) => {
      return resolve('');
    });
  };

  // Fetch the items..
  $scope.fetchItems = () => {

    // Get the archiveIndices from backend..
    return StateService.getArchivedIndices().then(function (data) {

      $scope.inProgressCount = data.summary.in_progress;
      $scope.successCount = data.summary.success;
      $scope.failureCount = data.summary.failure;

      // If we called this for forceUpdate, reset that here...
      $scope.archivedIndicesMeta.forceUpdate = false;

      return data.details;
    });
  };

  init();
}
