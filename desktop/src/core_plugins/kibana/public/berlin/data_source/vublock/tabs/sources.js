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

  // This function exports all the data source types for a vublock into a xls file.
  $scope.exportDataSources = function () {
    StateService.exportDataSources($scope.vuBlock.id).then(() => {
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };

  // This function downloads the errors generated while importing data sources
  $scope.downloadImportErrors = () => {
    StateService.downloadImportVuBlockErrors($scope.vuBlock.id);
  };
}