import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import '../styles/vublock.less';
import { VuBlockConstants } from '../vu_block_constants';


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
  StateService
) {

  // sources meta data
  $scope.sourcesMeta = {
    headers: ['Name'],
    rows: ['name'],
    id: 'name',
    add: false,
    edit: false,
    selection: false,
    search: true,
    tableAction: [],
    default: {},
    forceUpdate: false,
    inverted: false,
    hasSubTable: true,
    subTable: {
      fetch: $scope.fetchSubTableContents,
      meta: {
        headers: [],
        rows: [],
        id: '',
      }
    }
  };

  // This function gets called when the form wizard data is to
  // be saved to the backend. The reference of this function
  // is passed as metadata to components.
  $scope.saveData = function (restApiId, name, data) {

    // Initialize a list to store data to be sent
    // to the back end.
    const submitDataList = [];
    if (data.wizardData) {

      // Iterate wizardData list received from form wizard
      // and push the data objects to the 'submitDataList'.
      // We do this until we encounter a flag: 'formSubmit'
      // which is set to true.
      data.wizardData.some(function (dataObj) {
        submitDataList.push(dataObj.data);
        if (dataObj.formSubmit &&
            dataObj.formSubmit === true) {
          return true;
        }
      });

      // Api call for adding a new data source instance
      if (name === undefined) {
        return StateService.addDataSource($scope.vuBlock.id, submitDataList[0]).then(function () {
          return Promise.resolve('false');
        });

      // Api call for editing an existing data source instance
      } else {
        return StateService.updateDataSource($scope.vuBlock.id, name, submitDataList[0]).then(function () {
          return Promise.resolve('false');
        });
      }
    }
  };

  // This function gets called when the last form in the
  // form wizard gets submitted.
  $scope.onModalSubmit = () => {
    return Promise.resolve('true');
  };

  // Fetch the data required for sub table.
  $scope.fetchSubTableContents = function (type) {
    return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'source')
      .then(function (data) {
        return data.source_types.find(x => x.name === type).instances;
      });
  };

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
    } else if (buttonName === VuBlockConstants.AGENT_CONFIGURATION) {
      return StateService.getAgentConfiguration($scope.vuBlock.id, name)
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

  // Callback function to fetch sources information
  $scope.fetchSourceItems = () => {
    return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'source').then(function (data) {
      const sourceList = [];
      data.source_types.forEach(source => {
        const sourceObj = { 'name': source.name };
        sourceObj.subTable = {};
        sourceObj.subTable.meta = {};
        sourceObj.subTable.meta.containerClassName = 'nested-table-container';
        sourceObj.subTable.meta.headers = ['name', 'type', 'description'];
        sourceObj.subTable.meta.rows = ['name', 'type', 'description'];
        sourceObj.subTable.meta.id = 'id';
        sourceObj.subTable.meta.name = source.name;
        sourceObj.subTable.meta.restApiId = source.name;
        sourceObj.subTable.meta.add = false;
        sourceObj.subTable.meta.edit = true;
        sourceObj.subTable.meta.isFormWizard = true;
        sourceObj.subTable.meta.isSubTable = true;
        sourceObj.subTable.meta.getAllEditData = $scope.getAllEditData;
        sourceObj.subTable.fetch = $scope.fetchSubTableContents;
        sourceObj.subTable.meta.saveData = $scope.saveData;
        sourceObj.subTable.meta.buttonCallback = $scope.buttonCallback;
        sourceObj.subTable.meta.onSubmit = $scope.onModalSubmit;

        // The following code will be used for vuBlock phase 2
        // dataSource.subTable.meta.deleteSelectedItems = $scope.deleteSelectedItems;
        // dataSource.subTable.onSubTableRowAction = $scope.onSubTableRowAction;
        // source.subTable.meta.rowAction = [
        //   { name: 'verify data', icon: 'fa-terminal', toolTip: 'Verify Data' },
        //   { name: 'remote configuration', icon: 'fa-terminal', toolTip: 'Remote Configuration' },
        // ];

        sourceList.push(sourceObj);
      });
      return sourceList;
    });
  };

}