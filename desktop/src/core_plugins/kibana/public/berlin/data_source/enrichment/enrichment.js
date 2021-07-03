// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { EnrichmentConstants } from './enrichment_constants';
import { Notifier } from 'ui/notify';
const notify = new Notifier({ location: 'Enrichment Tables' });

app.directive('vunetEnrichment', function () {
  return {
    restrict: 'E',
    controllerAs: 'enrichment',
    controller: enrichmentData,
  };
});

function enrichmentData($injector, Promise, $scope, $route) {
  // Always display doc title as 'Enrich'
  const Private = $injector.get('Private');
  const docTitle = Private(DocTitleProvider);
  docTitle.change(VunetSidebarConstants.ENRICH);

  // Get the table id from the $route.
  $scope.tableId = $route.current.params.tableId;

  // Get metadata of all the tables configured from the $route
  const tableMetaDataList = $route.current.locals.tableMetaDataList;

  // Get the metadata corresponding to the current table that is being
  // viewed
  const tableMetaData = tableMetaDataList.find((obj) => {
    return obj.id.toString() === $scope.tableId;
  });

  $scope.tableName = tableMetaData.table_name;

  // Metadata for the table component
  $scope.enrichmentDataMeta = {
    headers: [],
    rows: [],
    add: true,
    edit: true,
    table: [],
    id: 'id',
    default: {},
  };

  // This function will update the 'rows' and 'headers' list
  // under 'enrichmentDataMeta' which is passed to the table
  // component
  const prepareMetaUsingKeysAndRows = function (inputList) {
    // inputList: This will be an list of keys or values
    // configured for this table.
    // We iterate over this list and prepare the metadata:
    // 'headers' and 'rows' which are passed to vunet table
    // component
    inputList.forEach((obj) => {
      $scope.enrichmentDataMeta.rows.push(obj.label);
      $scope.enrichmentDataMeta.headers.push(obj.label);
    });
  };

  // This function will update the 'rows' and 'headers' list
  // under 'enrichmentDataMeta' which is passed to the table
  // component
  const getMetaForTableRowsAndHeader = function () {
    // prepare 'rows' and 'headers' using table keys
    prepareMetaUsingKeysAndRows(tableMetaData.keys);

    // prepare 'rows' and 'headers' using table values
    prepareMetaUsingKeysAndRows(tableMetaData.values);
  };

  // This function gets called when 'add' or 'edit'
  // operation is performed to add or edit a data entry
  // for a 'table'.
  $scope.onSubmit = (event, scheduleId, data) => {
    // Prepare request body to be sent.
    const postData = {};
    postData.json_config = {};

    const fieldList = [];
    tableMetaData.keys.forEach((item) => {
      fieldList.push(item.label);
    });
    tableMetaData.values.forEach((item) => {
      fieldList.push(item.label);
    });

    for (const key in data) {
      if (fieldList.includes(key)) {
        postData.json_config[key] = data[key];
      }
    }

    // Add new data entry for a table.
    if (event === 'add') {
      return apiProvider
        .post(
          `${EnrichmentConstants.ENRICHMENT_DATA_API_URL}/${$scope.tableId}/data/`,
          postData
        )
        .then((data) => {
          {
            if (data.status === 200) {
              notify.info(`Enrichment data has been added successfully`);
            } else {
              notify.error(`${data.response.data['error-string']}`);
            }
            return Promise.resolve(true);
          }
        })
        .catch((error) => {
          notify.error(error);
          return Promise.resolve(false);
        });
      // Edit a data entry for a table.
    } else if (event === 'edit') {
      return apiProvider
        .put(
          `${EnrichmentConstants.ENRICHMENT_DATA_API_URL}/${$scope.tableId}/data/${data.id}/`,
          postData
        )
        .then((data) => {
          {
            if (data.status === 200) {
              notify.info(`Enrichment data has been updated successfully`);
            } else {
              notify.error(`${data.response.data['error-string']}`);
            }
            return Promise.resolve(true);
          }
        })
        .catch((error) => {
          notify.error(error);
          return Promise.resolve(false);
        });
    }
  };

  // Delete selected items.
  $scope.deleteSelectedItems = (rows) => {
    // Iterate over list of enrichment data to be deleted and delete
    // one by one. We return a list of promises which contains both
    // success and failure cases.
    const deletePromises = Promise.map(rows, function (row) {
      return apiProvider
        .remove(
          `${EnrichmentConstants.ENRICHMENT_DATA_API_URL}/${$scope.tableId}/data/${row.id}`
        )
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

  // This function returns the dataset for the
  // table component.
  $scope.fetchEnrichmentData = function () {
    // Get enrichment data added for a table.
    return apiProvider
      .getAll(
        `${EnrichmentConstants.ENRICHMENT_DATA_API_URL}/${$scope.tableId}/data/`
      )
      .then((data) => {
        const displayDataSet = [];
        // Get the enrichment data to be displayed.
        data.data.forEach((obj) => {
          const row = {};
          row.id = obj.id;
          const dataObj = obj.json_config;
          for (const key in dataObj) {
            if (dataObj.hasOwnProperty(key)) {
              row[key] = dataObj[key];
            }
          }
          displayDataSet.push(row);
        });
        return displayDataSet;
      });
  };

  // This function is used to prepare the vunet table metadata
  // for add or edit workflows using the table metadata
  // configured.
  const prepareDataInputFieldsFromTableMetaData = function (inputMetaDataList) {
    inputMetaDataList &&
      inputMetaDataList.forEach((obj) => {
        const inputFieldObj = {};
        inputFieldObj.props = {};
        inputFieldObj.label = obj.label;
        inputFieldObj.name = obj.label;
        inputFieldObj.key = obj.label;
        inputFieldObj.props.required = true;
        if (obj.helpText && obj.helpText.length) {
          inputFieldObj.helpObj = {
            headerText: obj.label,
            referenceLink: '',
            contentIntroduction: obj.helpText,
          };
        }

        if (obj.type === 'numeric') {
          inputFieldObj.type = 'number';
          inputFieldObj.props.min = obj.minimum;
          inputFieldObj.props.max = obj.maximum;
          inputFieldObj.errorText = `Please enter a value within the range:${obj.minimum}-${obj.maximum}`;
        } else if (obj.type === 'string') {
          inputFieldObj.type = 'text';
          inputFieldObj.props.pattern = obj.constraint;
          inputFieldObj.errorText =
            'Please provide a value that matches the regex specified in table';
        } else if (obj.type === 'enum') {
          inputFieldObj.type = 'select';
          inputFieldObj.errorText = `Please select a value`;
          const optionsString = obj.options.split(',');
          inputFieldObj.options = optionsString.map((option) => {
            return {
              key: option,
              name: option,
              label: option,
              value: option,
            };
          });
          $scope.enrichmentDataMeta.default[inputFieldObj.key] =
            inputFieldObj.options[0].value;
        } else {
          inputFieldObj.type = 'text';
          inputFieldObj.props.pattern =
            '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$';
          inputFieldObj.errorText = `Please provide a valid IP Address`;
        }
        $scope.enrichmentDataMeta.table.push(inputFieldObj);
      });
  };

  // This function is used to get the metadata
  // required to display the data fields for add / edit
  // workflow.
  const getMetaForAddOrEditData = function () {
    prepareDataInputFieldsFromTableMetaData(tableMetaData.keys);
    const separatorMeta = {
      key: 'separator',
      name: 'separator',
      type: 'separator',
    };
    $scope.enrichmentDataMeta.table.push(separatorMeta);
    prepareDataInputFieldsFromTableMetaData(tableMetaData.values);
  };

  function init() {
    getMetaForTableRowsAndHeader();
    getMetaForAddOrEditData();
  }

  init();
}
