

import _ from 'lodash';

class AddDataEnrichmentType2Ctrl {
  constructor($scope, $uibModalInstance, DataEnrichmentUtilService) {
    $scope.editDataEnrichment = false;
    $scope.dataEnrichment_data = $uibModalInstance.dataEnrichment_data;
    $scope.showMsg = false;
    $scope.err_arr = [];

    // Get the key1 field details
    $scope.key1_field = DataEnrichmentUtilService.getFieldDetails($uibModalInstance.groupInfo.key1_field);

    // Get the key2 field details
    $scope.key2_field = DataEnrichmentUtilService.getFieldDetails($uibModalInstance.groupInfo.key2_field);

    // Get the value2 field details
    $scope.value2_field = DataEnrichmentUtilService.getFieldDetails($uibModalInstance.groupInfo.value2_field);


    // Labels inside modal
    $scope.key1_label = $scope.key1_field.name;
    $scope.key2_label = $scope.key2_field.name;
    $scope.value2_label = $scope.value2_field.name;

    $scope.key1_pattern = $scope.key1_field.frontend_pattern;
    $scope.key2_pattern = $scope.key2_field.frontend_pattern;

    if ($uibModalInstance.value2Fields) {
      $scope.value2Fields = $uibModalInstance.value2Fields;
      $scope.value2FieldsPattern = $uibModalInstance.value2FieldsPattern;
      $scope.value2FieldsTypes = $uibModalInstance.value2FieldsTypes;
      $scope.value2FieldsOptions = $uibModalInstance.value2FieldsOptions;
      $scope.extended_type2 = $uibModalInstance.extended_type2;
    } else {
      $scope.value2_pattern = $scope.value2_field.frontend_pattern;
    }


    // Initial value for adding an entry

    $scope.params = {};
    $scope.params.key2value2 = [];
    $scope.params.key1 = '';

    // if the row value is present edit in the modal.
    if ($uibModalInstance.row) {
      // example json for editing type2 group
      //       [{
      //   "ip_address": "4.4.4.4",
      //   "port_number_application": [{
      //     "port_number": "2000",
      //     "application": "SIP"
      //   }, {
      //     "port_number": "5123",
      //     "application": "redis"
      //   }]
      // }]
      // Here $scope.key1 = "4.4.4.4",
      // $scope.key2value2 = [{
      //     "port_number": "2000",
      //     "application": "SIP"
      //   }, {
      //     "port_number": "5123",
      //     "application": "redis"
      //   }]
      // }]

      // $scope.key1_label = 'ip_address', $scope.key2_label = 'port_number', $scope.value2_label = 'application'

      $scope.editDataEnrichment = true;
      const row = {};

      // Copy the object for editing inside modal
      /*eslint-disable*/
      angular.copy($uibModalInstance.row, row);
      /*eslint-enable*/
      $scope.params.key1 = row[$scope.key1_label];
      $scope.params.key2value2 = row[$scope.key2_label + $scope.value2_label];
    }

    // Function called when submit button is clicked
    $scope.saveDataEnrichment = (isValid) => {
      if (isValid) {
        const dataEnrichmentObj = {};
        dataEnrichmentObj[$scope.key1_label] = $scope.params.key1;
        dataEnrichmentObj[$scope.key2_label + $scope.value2_label] = $scope.params.key2value2;
        $uibModalInstance.close(dataEnrichmentObj);
      }
    };

    // function called upon every key press of the input.
    // Checks if the value already exists in the list of inputs
    // If found a validation msg is shown
    $scope.validate = (value, curIndex) => {

      if ($scope.showMsg === false) {
        $scope.err_arr = [];
      }
      let match = false;
      // Loop over the each element of the list
      /*eslint-disable*/
      angular.forEach($scope.params.key2value2, function (item, index) {
        /*eslint-enable*/
        // check if the current is not equal to the present index.
        // The current index is $index being passed from html.
        // if current index is not equal to index of loop then
        // check if the input value is equal to the item of the list.
        if (curIndex !== index) {
          if (value === item[$scope.key2_label]) {
            // if there is a match , then check if the error_array
            // has any values. If no values and append the index of the
            // loop to error_array.
            match = true;
            const rowNO = index;
            if ($scope.err_arr.indexOf(rowNO) < 0) {
              $scope.err_arr.push(rowNO);
            }
          }
        }
      });
      // if there is no match then empty the error array
      if (match === false) {
        $scope.err_arr = [];
      }

      // if the length of the error array is greater than zero
      // then show validation msg.
      if ($scope.err_arr.length > 0) {
        $scope.showMsg = true;
      }
    };

    // function called when clicked on 'cancel' button
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };

    // Function to add a inline row inside modal
    $scope.addRow = () => {
      const dataEnrichmentObj = {};
      // For the enum fields set the first item in the options as default selection
      if ($scope.key2_field.type === 'enum' && $scope.key2_field.options.length > 0) {
        dataEnrichmentObj[$scope.key2_label] = $scope.key2_field.options[0];
      } else {
        dataEnrichmentObj[$scope.key2_label] = '';
      }

      // For the enum fields set the first item in the options as default selection
      if ($scope.value2_field.type === 'enum' && $scope.value2_field.options.length > 0) {
        dataEnrichmentObj[$scope.value2_label] = $scope.value2_field.options[0];
      } else {
        // If extended type2, the value2 is a complex object. Otherwise it is a string
        if ($scope.extended_type2) {
          dataEnrichmentObj[$scope.value2_label] = {};
        } else {
          dataEnrichmentObj[$scope.value2_label] = '';
        }
      }

      // For the enum fields set the first item in the options as default selection
      if ($scope.value2Fields) {
        $scope.value2Fields.forEach(function (key) {
          if ($scope.value2FieldsTypes[key] === 'enum' && $scope.value2FieldsOptions[key].length > 0) {
            dataEnrichmentObj[$scope.value2_label][key] = $scope.value2FieldsOptions[key][0];
          } else {
            dataEnrichmentObj[$scope.value2_label][key] = '';
          }
        });
      }
      $scope.params.key2value2.push(dataEnrichmentObj);
    };

    // function to disable the submit when duplicates are found
    $scope.submitDisable = () => {
      if ($scope.err_arr.length > 0 || $scope.params.key2value2.length === 0) {
        return true;
      }
      return false;
    };

    // Function which will delete a row.
    $scope.deleteRow = (row) => {
      $scope.params.key2value2 = _.without($scope.params.key2value2, row);
    };
  }
}

AddDataEnrichmentType2Ctrl.$inject = ['$scope', '$uibModalInstance', 'DataEnrichmentUtilService'];
/*eslint-disable*/
export default AddDataEnrichmentType2Ctrl;
/*eslint-enable*/
