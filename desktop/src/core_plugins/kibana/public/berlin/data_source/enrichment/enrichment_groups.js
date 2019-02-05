import { uiModules } from 'ui/modules';
// import { BerlinConstants } from '../../berlin_constants';
import { EnrichmentConstants } from './enrichment_constants';
import ImportEnrichmentGroupsTemplate from './import_enrichment_groups.html';
import ImportEnrichmentGroupsCtrl from  './import_enrichment_groups.controller';

const app = uiModules.get('app/berlin');

app.directive('enrichmentGroups', function () {
  return {
    restrict: 'E',
    controllerAs: 'enrichmentGroups',
    controller: enrichmentGroups,
  };
});

function enrichmentGroups($scope,
  $http,
  chrome,
  $window,
  $modal,
  StateService
) {

  $scope.file_type = 'xlsx';
  $scope.isModifyAllowed = chrome.isModifyAllowed();

  //function to import files
  $scope.open_import_modal = function () {
    $modal.open({
      animation: true,
      template: ImportEnrichmentGroupsTemplate,
      controller: ImportEnrichmentGroupsCtrl,
      windowClass: 'import-enrichment-groups-modal'
    });
  };

  $scope.exportEnrichment = (e, selectedrows) => {
    const fileNames = [];
    selectedrows.forEach(selectedrow => {
      fileNames.push(selectedrow.name);
    });

    StateService.exportDataEnrichment(fileNames, $scope.file_type);
    // $scope.resetAllSelection();
    return Promise.resolve(false);
  };

  // This function will remove all selected items from the list
  // after export is done
  // $scope.resetAllSelection = function() {
  //   angular.forEach($scope.selected, function(row) {
  //     row.isSelected = false;
  //   });
  //   $scope.selected = [];
  //   $scope.fileNames = [];
  // };

  $scope.enrichmentGroupsMeta = {
    headers: ['Name', 'Description', 'Last Modified Time'],
    rows: ['name', 'description', 'last_modified_on'],
    rowAction: [{ name: 'View More', icon: 'fa-arrow-circle-right', toolTip: 'Click here to see enrichment instances' }],
    tableAction: [],
    id: 'name'
  };

  if($scope.isModifyAllowed) {
    $scope.enrichmentGroupsMeta.tableAction.push({ button: 'Export' });
  }

  function init() {}

  // This function is called when a user click on the button to see instances
  // for a given data enrichment file
  $scope.onRowAction = (e, rowId) => {
    $window.location.href = 'vienna#/berlin' +
      EnrichmentConstants.ENRICHMENT_GROUPS_PATH + rowId;
    return Promise.resolve(false);
  };

  // Currently delete selected items doesn't do anything...
  $scope.deleteSelectedItems = () => {
    return new Promise((resolve) => {
      return resolve('');
    });
  };

  // This is called to fetch all the existing data enrichment file information
  $scope.fetchEnrichmentGroupItems = () => {
    return StateService.getDataEnrichmentGroups().then(function (data) {
      return data;
    });
  };

  init();
}
