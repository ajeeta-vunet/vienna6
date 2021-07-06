import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');

// This directive takes care of displaying data sources and
// their instances for logical vuBlock.
app.directive('logicalVublockSources', function () {
  return {
    restrict: 'E',
    controllerAs: 'logicalVublockSources',
    controller: logicalVublockSources,
    scope: true
  };
});

function logicalVublockSources($scope,
  StateService, Promise, $location
) {

  const vuBlockType = $location.search().type;
  // sources meta data
  $scope.main = 'main';
  $scope.sourcesMeta = {
    title: 'Instance',
    headers: ['Instance Name', 'Created By', 'Created On', 'Action'],
    rows: ['name', 'Created By', 'Created On'],
    id: 'name',
    pagination: true,
    toolbar: false,
    footerbar: false,
    add: true,
    edit: true,
    selection: false,
    search: false,
    isFormWizard: true,
    useBoxShadowForTable: true,
    getAllEditData: $scope.getAllEditData,
    tableAction: [],
    default: {},
    forceUpdate: false,
    inverted: false,
    hasSubTable: vuBlockType === 'LogicalBlock' ? true : false,
    subTable: {
      selection: false,
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
        if (dataObj.formSubmit && dataObj.formSubmit === true) {
          return true;
        }
      });
      // Api call for adding a new data source instance
      if (name === undefined) {
        return StateService.addDataSource($scope.vuBlock.id, submitDataList).then(function () {
          return Promise.resolve('false');
        });

      // Api call for editing an existing data source instance
      } else {
        return StateService.updateDataSource($scope.vuBlock.id, name, submitDataList).then(function () {
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

  // This function gets called when the edit button in front of data source
  // instances is clicked. The reference of this function is passed as metadata
  // to components. This is used to populate the data and meta data required by
  // form wizard.
  $scope.getAllEditData = function (restApiId, name = '') {
    return StateService.getWizardDataForSource($scope.vuBlock.id, name).then(function (data) {
      return data;
    });
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

  // Callback function to fetch sources information
  $scope.fetchSourceItems = () => {
    //$scope.sourcesMeta.selection = true;
    //$scope.sourcesMeta.forceUpdate = true;
    //$scope.sourcesMeta.isFormWizard = true;
    $scope.sourcesMeta.isSubTable = false;
    //$scope.sourcesMeta.useBoxShadowForTable = false;
    $scope.sourcesMeta.getAllEditData = $scope.getAllEditData;
    $scope.sourcesMeta.saveData = $scope.saveData;
    //$scope.sourcesMeta.fetch = $scope.fetchSourceItems;
    //$scope.sourcesMeta.buttonCallback = $scope.buttonCallback;
    $scope.sourcesMeta.onSubmit = $scope.onModalSubmit;
    //$scope.sourcesMeta.buttonCallback = $scope.buttonCallback;
    $scope.sourcesMeta.deleteSelectedItems = $scope.deleteSelectedItems;
    //$scope.sourcesMeta.onSubmit = $scope.onModalSubmit;

    return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'source-instances').then(function (data) {
      const sourceList = [];
      data.source_instances.forEach(source => {
        const sourceObj = { 'name': source['Instance Name'],
          'Created By': source['Created By'],
          'Created On': source['Created On'] };
        //sourceObj.table.meta.add = true;
        const subTableHeaders = [];
        for (const key in source) {
          if (source.hasOwnProperty(key) && key !== 'Instance Name' &&
          key !== 'Created On' && key !== 'Created By') {
            //subTableHeaders.push(key.substring(0, 1).toUpperCase() + key.substring(1));
            subTableHeaders.push(key.toLowerCase());
          }
        }
        sourceObj.subTable = {};
        sourceObj.subTable.meta = {};
        sourceObj.subTable.meta.containerClassName = 'nested-table-container';
        sourceObj.subTable.meta.headers = subTableHeaders;
        sourceObj.subTable.meta.rows = subTableHeaders;
        sourceObj.subTable.meta.id = 'id';
        sourceObj.subTable.meta.name = source.Name;
        sourceObj.subTable.meta.restApiId = source.Name;
        sourceObj.subTable.meta.add = false;
        sourceObj.subTable.meta.useBoxShadowForTable = true;
        sourceObj.subTable.meta.edit = false;
        sourceObj.subTable.meta.search = false;
        sourceObj.subTable.meta.selection = false;
        sourceObj.subTable.meta.pagination = false;
        sourceObj.subTable.selection = false;
        sourceObj.subTable.meta.isFormWizard = false;
        sourceObj.subTable.meta.hasSubTable = false;
        sourceObj.subTable.meta.nestedTable = true;
        sourceObj.subTable.fetch = $scope.fetchSubTableContents;
        sourceList.push(sourceObj);
      });
      return sourceList;
    });
  };

  // Fetch the components list data required for sub table.
  $scope.fetchSubTableContents = function (sourceInstanceId) {
    return StateService.getLogicalvuBlockComponentsDetails($scope.vuBlock.id, sourceInstanceId)
      .then(function (data) {
        return data.components;
      });
  };

}