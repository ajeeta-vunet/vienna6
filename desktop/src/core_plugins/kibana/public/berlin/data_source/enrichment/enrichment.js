import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import AddDataEnrichmentType2Ctrl from './add_data_enrichment_type2.controller';
app.controller('AddDataEnrichmentType2Ctrl', AddDataEnrichmentType2Ctrl);

import AddDataEnrichmentType3Ctrl from './add_data_enrichment_type3.controller';
app.controller('AddDataEnrichmentType3Ctrl', AddDataEnrichmentType3Ctrl);

import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';


app.directive('vunetEnrichment', function () {
  return {
    restrict: 'E',
    controllerAs: 'enrichment',
    controller: enrichmentGroups,
  };
});

function enrichmentGroups($injector,
  Promise,
  $scope,
  $http,
  $window,
  StateService,
  $route
) {

  const groupName = $route.current.params.groupName;

  // Always display doc title as 'Enrich'
  const Private = $injector.get('Private');
  const docTitle = Private(DocTitleProvider);
  docTitle.change(VunetSidebarConstants.ENRICH);

  $scope.enrichmentMeta = {
    headers: [],
    rows: [],
    edit: true,
    add: true,
  };

  function init() {}

  // This function is called delete the selected enrichment Data
  $scope.deleteEnrichmentData = (deletedEnrichmentData) => {

    // Iterate over list of users to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(deletedEnrichmentData, function (row) {
      return StateService.deleteDataEnrichmentContent(groupName, row[$scope.enrichmentMeta.id])
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

  // This is called to add a new entry in enrichment data
  $scope.addEnrichmentData = function (event, eventype, allData) {
    const addedEnrichMentdata = {};

    // Build the enrichmentData from the new data
    $scope.enrichmentMeta.rows.map(function (column) {
      addedEnrichMentdata[column] = allData[column];
    });

    if (event === 'add') {
      return StateService.addDataEnrichmentContent(
        groupName,
        addedEnrichMentdata).then(function () {
        return Promise.resolve(true);
      }, function () {
        return Promise.resolve(false);
      });
    }
    else if (event === 'edit') {
      return StateService.updateDataEnrichmentContent(
        addedEnrichMentdata,
        groupName,
        allData[$scope.enrichmentMeta.id])
        .then(function () {
          return Promise.resolve(true);
        }, function () {
          return Promise.resolve(false);
        });
    }
  };

  // Function is called to get the Input Type from the field type
  // passed from backend
  function getInputType(type) {
    if (type === 'string') {
      return 'text';
    } else if(type === 'ip') {
      return 'text';
    } else if(type === 'numeric') {
      return 'number';
    } else if(type === 'enum') {
      return 'select';
    }
  }

  // Function is called to create the options for Input Type select
  function getSelectOptions(fieldOptions) {
    let options = [];
    // Add options if its an enum
    if (fieldOptions) {
      options = fieldOptions.map(function (opt) {
        return { key: opt, label: opt, value: opt };
      });
    }
    return options;
  }

  // We store the type-1-data here..
  $scope.type_1_data = [];

  $scope.fetchEnrichmentItems = () => {
    return StateService.getDataEnrichmentContents(groupName).then(function (data) {
      if (data.object_info.type === 'type_1') {

        // Type1 data enrichment uses vunet-table react component.. Prepare
        // all the dataset to be passed with it..
        $scope.table1GroupName = groupName;
        $scope.type_1_data = data.data;
        const column1 = data.object_info.key1_field.name;
        const column2 = data.object_info.value1_field.name;
        $scope.enrichmentMeta.headers = [column1, column2];
        $scope.enrichmentMeta.rows = [column1, column2];

        // Get the key1 pattern
        let key1Pattern = '.*';
        let key1PatternMsg = 'Value already exist.';
        if (data.object_info.key1_field.frontend_pattern) {
          key1Pattern = data.object_info.key1_field.frontend_pattern;
          key1PatternMsg = data.object_info.key1_field.pattern_help +
            ', Key should be unique';
        }

        // Get the value1 pattern
        let valPattern = '.*';
        let valPatternMsg = 'This is a required field';
        if (data.object_info.value1_field.frontend_pattern) {
          valPattern = data.object_info.value1_field.frontend_pattern;
          valPatternMsg = data.object_info.value1_field.pattern_help;
        }

        // Convert the type to html input type
        const key1Type = getInputType(data.object_info.key1_field.type);
        const valType = getInputType(data.object_info.value1_field.type);

        // Get the options if its passed from backend
        const key1Options = getSelectOptions(data.object_info.key1_field.options);
        const valOptions = getSelectOptions(data.object_info.value1_field.options);

        // Column1 is assumed to be the key
        $scope.enrichmentMeta.id = column1;
        $scope.enrichmentMeta.table =
          [
            {
              key: column1,
              id: true,
              label: column1,
              type: key1Type,
              validationCallback: $scope.validateValue,
              options: key1Options,
              name: column1,
              props: {
                required: true,
                pattern: key1Pattern
              },
              errorText: key1PatternMsg
            }, {
              key: column2,
              label: column2,
              type: valType,
              options: valOptions,
              name: column2,
              props: {
                required: true,
                pattern: valPattern
              },
              errorText: valPatternMsg
            }
          ];
      }
      return data.data;
    });
  };

  // This function is called to check if the key already exists
  $scope.validateValue =  function (key, value) {
    return $scope.type_1_data.find(typeOneData => typeOneData[key] === value) ? true : false;
  };

  $scope.setType = function () {
    $scope.type1 = false;
    StateService.getDataEnrichmentContents(groupName).then(function (data) {
      if (data.object_info.type === 'type_1') {
        $scope.type1 = true;
      }
    });
  };
  $scope.setType();

  init();
}
