
import _ from 'lodash';
const  angular = require('angular');
import AddDataEnrichmentType2Template from './add_data_enrichment_type2.html';
import AddDataEnrichmentType3Template from './add_data_enrichment_type3.html';


class DataEnrichmentCtrl {
  constructor($scope, StateService, $uibModal, $route, DataEnrichmentUtilService) {

    $scope.dataEnrichment_data = {};
    $scope.dataEnrichment_group_data = [];

    $scope.type2 = false;
    $scope.type1 = false;
    $scope.type3 = false;

    // Configurations used for pagination
    $scope.paginationConfig = {
      'noOfItemsByPageList': [],
      'noOfRowsInPage': 10,
      'itemsByPage': ''
    };

    // if file name in route, get the contents of group
    if ($route.current.params.groupName) {
      StateService.getDataEnrichmentContents($route.current.params.groupName).then(function (data) {
        // check for file type and set the values
        // so that it can be used in html
        $scope.groupType = data.object_info.type;
        if ($scope.groupType === 'type_1') {
          $scope.type1 = true;
        }
        else if ($scope.groupType === 'type_2') {
          $scope.type2 = true;
          $scope.extended_type2 = false;
          const value2Fields = [];
          const value2FieldsPattern = {};
          const value2FieldsTypes = {};
          const value2FieldsOptions = {};
          data.key_list.forEach(function (key) {
            if (key !== 'key1_field' && key !== 'key2_field' && key !== 'value2_field' && key !== 'type') {
              const fieldDetails = DataEnrichmentUtilService.getFieldDetails(data.object_info[key]);
              value2Fields.push(fieldDetails.name);
              // Based on the type set the regex pattern to a dictionary
              // with name of the field as key and regex pattern as value
              value2FieldsPattern[fieldDetails.name] = {};
              value2FieldsPattern[fieldDetails.name].frontend_pattern = fieldDetails.frontend_pattern;
              value2FieldsPattern[fieldDetails.name].pattern_help = fieldDetails.pattern_help;
              value2FieldsTypes[fieldDetails.name] = fieldDetails.type;
              value2FieldsOptions[fieldDetails.name] = fieldDetails.options;
            }
          });

          if (value2Fields.length > 0) {
            $scope.value2Fields = value2Fields;
            $scope.value2FieldsPattern = value2FieldsPattern;
            $scope.extended_type2 = true;
            $scope.value2FieldsTypes = value2FieldsTypes;
            $scope.value2FieldsOptions = value2FieldsOptions;
          }
        }
        else if ($scope.groupType === 'type_3') {
          $scope.type3 = true;

          /*
            For the type3, find the dynamic keys and put it in model

            Identify the keys under "Details" to be rendered
            Find the keys from the object_info.
            The keys other than 'key1_field', 'value1_field' and 'type' are the actual keys to be used under "Details".
            The value1Fields should have Branch, Location, DeviceType, LinkType, TargetType, UserGroup and sol_id
          */
          const value1Fields = [];
          const value1FieldsPattern = {};
          const value1FieldsTypes = {};
          const value1FieldsOptions = {};
          const keys = Object.keys(data.object_info);
          keys.forEach(function (key) {
            if (key !== 'key1_field' && key !== 'value1_field' && key !== 'type') {
              const fieldDetails = DataEnrichmentUtilService.getFieldDetails(data.object_info[key]);
              value1Fields.push(fieldDetails.name);
              // Based on the type, set the frontend_pattern and  pattern_help
              // to a dictionary with name of the field as key
              value1FieldsPattern[fieldDetails.name] = {};
              value1FieldsPattern[fieldDetails.name].frontend_pattern = fieldDetails.frontend_pattern;
              value1FieldsPattern[fieldDetails.name].pattern_help = fieldDetails.pattern_help;
              value1FieldsTypes[fieldDetails.name] = fieldDetails.type;
              value1FieldsOptions[fieldDetails.name] = fieldDetails.options;
            }
          });
          $scope.value1Fields = value1Fields;
          $scope.value1FieldsPattern = value1FieldsPattern;
          $scope.value1FieldsTypes = value1FieldsTypes;
          $scope.value1FieldsOptions = value1FieldsOptions;
        }

        $scope.groupTypeInfo = data.object_info;
        $scope.dataEnrichment_data = data.data;
        $scope.dataEnrichment_data_display = $scope.dataEnrichment_data;
        $scope.groupName = $route.current.params.groupName;
        // Total number of data enrichment objects
        //to be used for smart table
        $scope.noOfObjects = $scope.dataEnrichment_data.length;

        // set options in select box to select no of rows to be
        // displayed in a page.
        $scope.paginationConfig.noOfItemsByPageList = [{ name: '10', value: 10 },
          { name: '50', value: 50 },
          { name: '100', value: 100 },
          { name: 'All', value: $scope.noOfObjects }];

        // load 10 rows in a page by default.
        $scope.paginationConfig.noOfRowsInPage = 10;
      });

      $scope.updateRowDataEnrichment = (row, groupName, groupInfo) => {
        let controller;
        let template;
        //the if of type1 can be removed I think --ROMIL
        if (groupInfo.type === 'type_1') {
          controller = 'AddDataEnrichmentType1Ctrl';
          template = './addDataEnrichmentType1.html';
        } else if (groupInfo.type === 'type_2') {
          controller = 'AddDataEnrichmentType2Ctrl';
          template = AddDataEnrichmentType2Template;
        } else if (groupInfo.type === 'type_3') {
          controller = 'AddDataEnrichmentType3Ctrl';
          template = AddDataEnrichmentType3Template;
        }

        const modalInstance = $uibModal.open({
          animation: true,
          template: template,
          controller: controller
        });

        // Send the value of the edited row to modal so that the modal gets
        // populated with these values.

        if (row) {
          modalInstance.row = angular.copy(row);

          // Store the original values of the data enrichment object to the model.
          // This holds the original state of the data enrichment object.
          // We can compare this with the object after the user submit the form to find out
          // whether the user changed anything or not. If there is no change we dont need to call REST service
          $scope.originalEnrichmentObject = angular.copy(row);

        } else {
          // Reset the original values of the data enrichment object
          $scope.originalEnrichmentObject = {};

          modalInstance.dataEnrichment_data = $scope.dataEnrichment_data;
        }

        modalInstance.groupInfo = groupInfo;
        modalInstance.value1Fields = $scope.value1Fields;
        modalInstance.value1FieldsPattern = $scope.value1FieldsPattern;
        modalInstance.value1FieldsTypes = $scope.value1FieldsTypes;
        modalInstance.value1FieldsOptions = $scope.value1FieldsOptions;
        if ($scope.value2Fields) {
          modalInstance.value2Fields = $scope.value2Fields;
          modalInstance.value2FieldsPattern = $scope.value2FieldsPattern;
          modalInstance.value2FieldsTypes = $scope.value2FieldsTypes;
          modalInstance.value2FieldsOptions = $scope.value2FieldsOptions;
          modalInstance.extended_type2 = $scope.extended_type2;
        }
        modalInstance.result.then((dataEnrichment) => {
          if (row) {

            // Call REST service only when the user changed something.
            // Check this comparing the original and submited data enrichment objects
            if (!angular.equals(dataEnrichment, $scope.originalEnrichmentObject)) {
              StateService.updateDataEnrichmentContent(dataEnrichment, groupName,
                row[$scope.groupTypeInfo.key1_field.name]).then(function () {

                //Index of the edited row
                const index = $scope.dataEnrichment_data.indexOf(row);

                //Update the scope with the modifed Data Enrichment object.
                //For performance reasons, the Angular smart table will watch
                //for updates only if the same object reference is used. So
                //update data without updating the reference. angular.extend will only
                //copy the properties without changing the object reference.
                angular.extend($scope.dataEnrichment_data[index], dataEnrichment);
              });
            }
          } else {
            StateService.addDataEnrichmentContent(groupName, dataEnrichment).then(function () {
              $scope.dataEnrichment_data.push(dataEnrichment);
            });
          }
        });
      };

      $scope.deleteEnrichmentModalData = {
        title: 'Confirm',
        message: 'Are you sure you want to delete this entry',
        isForm: false
      };

      // Function to delete a row in DataEnrichment
      $scope.showDeleteEnrichmentModal = false;
      $scope.deleteRowDataEnrichment = (row, groupName) => {
        $scope.showDeleteEnrichmentModal = true;
        $scope.rowToDelete = row;
        $scope.groupNameToDelete = groupName;
      };

      $scope.ondeleteEnrichmentSubmit = () => {
        StateService.deleteDataEnrichmentContent($scope.groupNameToDelete, $scope.rowToDelete[$scope.groupTypeInfo.key1_field.name]);
        $scope.dataEnrichment_data = _.without($scope.dataEnrichment_data, $scope.rowToDelete);
        $scope.showDeleteEnrichmentModal = false;
      };

      $scope.onDeleteEnrichmentModalClose = () => {
        $scope.showDeleteEnrichmentModal = false;
      };
      // Update the page with number of entried selected from
      // select box for the data enrichment objects display
      $scope.updateObjectsByPage = function (value) {
        $scope.paginationConfig.itemsByPage = value;
      };

    } else {
      // Get list of DataEnrichment groups
      StateService.getDataEnrichmentGroups().then(function (data) {
        $scope.dataEnrichment_group_data = data;

        // Total number of data enrichment groups
        // to be used in smart table
        $scope.noOfGroups = $scope.dataEnrichment_group_data.length;

        // set options in select box to select no of rows to be
        // displayed in a page.
        $scope.paginationConfig.noOfItemsByPageList = [{ name: '10', value: 10 },
          { name: '50', value: 50 },
          { name: '100', value: 100 },
          { name: 'All', value: $scope.noOfGroups }];

        // load 10 rows in a page by default.
        $scope.paginationConfig.noOfRowsInPage = 10;

      });

      // Update the page with number of entried selected from
      // select box for the data enrichment groups display
      $scope.updateGroupsByPage = function (value) {
        $scope.paginationConfig.itemsByPage = value;
      };
    }


    /* Functions of listing Data enrichment groups ends here */
  }
}

DataEnrichmentCtrl.$inject = ['$scope', 'StateService', '$uibModal', '$route', 'DataEnrichmentUtilService'];
/*eslint-disable*/
export default DataEnrichmentCtrl;
/*eslint-enable*/
