import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import { VuBlockConstants } from '../vu_block_constants';
import importvublockPopupTemplate from '../import_vublock_popup.html';
import importvublockPopupCtrl from '../import_vublock_popup';

app.controller('importvublockPopupCtrl', importvublockPopupCtrl);
// This directive takes care of displaying data sources and
// their instances.
app.directive('vuBlockSources', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockSources',
    controller: vuBlockSources,
    scope: true
  };
});

function vuBlockSources($scope,
  StateService,
  Promise,
  $route,
  $uibModal

) {
  // This function gets called when the edit button in front of data source
  // instances is clicked. The reference of this function is passed as metadata
  // to components. This is used to populate the data and meta data required by
  // form wizard.
  $scope.getAllEditData = function (restApiId, name = '') {
    return StateService.getWizardDataForSource($scope.vuBlock.id, name).then(function (data) {
      return data;
    });
  };

  // This function gets called when any button in form wizard is clicked.
  // This function takes the following inputs:
  // buttonName : Name of the button clicked. This will be used
  //              to carry out appropriate actions.
  // restApiId  : A unique id used in making rest call to back end.
  // name       : Name of the data source type.
  $scope.buttonCallback = function (buttonName, restApiId, name) {
    let queryParams = '';

    // If button name is 'verifyData' we make a backend call
    // to get the data tracing information.
    if (buttonName === VuBlockConstants.VERIFY_DATA) {
      return StateService.getDiagnosticsData($scope.vuBlock.id, name, queryParams)
        .then(function (data) {
          return Promise.resolve(data);
        });
    }
    // else if button name is 'getAgentConfiguration' we make a backend call
    // to get the agent configuration
    else if (buttonName === VuBlockConstants.AGENT_CONFIGURATION) {
      return StateService.getAgentConfiguration($scope.vuBlock.id, name)
        .then(function (data) {
          return Promise.resolve(data);
        });
    }
    // else if button name is 'getHostValidation' we make a backend call
    // to check whether the given host is reachable or not
    else if (buttonName === VuBlockConstants.HOST_VALIDATION) {
      return StateService.getHostValidation($scope.vuBlock.id, name)
        .then(function (data) {
          return Promise.resolve(data);
        });
    } else {

      // The buttonName will have button name followed by
      // required query parameters separated by space.
      // The examples for button names are as follows:
      // config windows
      // config linux
      // installation windows
      // installation linux
      const agentInfo = buttonName.split(' ');
      queryParams = '?agent=' + agentInfo[0] + '&os=' + agentInfo[1];
      StateService.getAgentSetUpDetails($scope.vuBlock.id, name, queryParams);
      return Promise.resolve(false);
    }
  };

  // Delete source instance
  $scope.deleteSelectedItems = (rows) => {

    // Iterate over list of source instances to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(rows, function (row) {
      return StateService.deleteDataSource($scope.vuBlock.id, row[Object.keys(row)[0]])
        .then(function () {
          return '';
        })
        .catch(function () {
          return '';
        });
    });

    // Wait till all Promises(deletePromises) are resolved
    // and return single Promise
    return Promise.all(deletePromises);
  };

  // When the import button is clicked, we show a pop up where user
  // can choose a xls file containing the data sources for a vublock and import.
  $scope.importDataSources = () => {
    $uibModal.open({
      animation: true,
      template: importvublockPopupTemplate,
      controller: 'importvublockPopupCtrl',
      resolve: {
        vublockList: function () {
          return [];
        },
        importType: function () {
          return 'datasource';
        },
        vuBlockId: function () {
          return $scope.vuBlock.id;
        }
      }
    }).result.then(function () {
    }, function () {
      $rootScope.currentTab = 'sources';
      $route.reload();
    });
  };

  // This function exports all the data source types for a vublock into a xls file.
  $scope.exportDataSources = function () {
    StateService.exportDataSources($scope.vuBlock.id).then(() => {
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };
}