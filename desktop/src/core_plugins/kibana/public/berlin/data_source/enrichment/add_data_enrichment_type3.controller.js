

import _ from 'lodash';
class AddDataEnrichmentType3Ctrl {
  constructor($scope, $uibModalInstance, DataEnrichmentUtilService) {

    $scope.editDataEnrichment = false;
    $scope.dataEnrichment_data = $uibModalInstance.dataEnrichment_data;

    // Get the key1 field details
    $scope.key1_field = DataEnrichmentUtilService.getFieldDetails($uibModalInstance.groupInfo.key1_field);

    // Get the value1 field details
    $scope.value1_field = DataEnrichmentUtilService.getFieldDetails($uibModalInstance.groupInfo.value1_field);

    $scope.key1_label = $scope.key1_field.name;
    $scope.value1_label = $scope.value1_field.name;
    $scope.value1Fields = $uibModalInstance.value1Fields;
    $scope.value1FieldsPattern = $uibModalInstance.value1FieldsPattern;
    $scope.value1FieldsTypes = $uibModalInstance.value1FieldsTypes;
    $scope.value1FieldsOptions = $uibModalInstance.value1FieldsOptions;

    $scope.key1_pattern = $scope.key1_field.frontend_pattern;

    $scope.params = {};
    $scope.params.value1 = {};
    $scope.params.key1 = '';

    /*
	     A sample JSON of the Type3 config is

	     [{
	         "Details": {
	             "LinkType": "",
	             "TargetType": "LAN",
	             "DeviceType": "Router",
	             "sol_id": "065",
	             "Branch": "Srirampuram",
	             "UserGroup": "WAN-Intranet",
	             "Location": "Srirampuram"
	         },
	         "IP Address": "172.25.181.129"
	     }]

	     Here
	     $scope.key1_label = "IP Address"
	     $scope.value1_label = "Details"

	     $scope.value1 is the JSON object under the key "Details". It contains many key value pairs.
	     These keys are defined in the YAML file comment line. A sample is

	     #(type,type_3):(key1_field,IP Address):(value1_field,Details):(key2_field,Branch):(key3_field,Location):
	     (key4_field,DeviceType):(key5_field,LinkType):(key6_field,TargetType):(key7_field,UserGroup):(key8_field,sol_id)
    */

    // if row is present then, edit modal function is called.
    if ($uibModalInstance.row) {
      $scope.editDataEnrichment = true;
      $scope.params.key1 = $uibModalInstance.row[$scope.key1_label];
      $scope.params.value1 = $uibModalInstance.row[$scope.value1_label];

    } else {

      // Add functionality
      // Initialize the dynamic keys and add it to the model
      $scope.value1Fields.forEach(function (entry) {
	        // For the enum fields set the first item in the options as default selection
	        if($scope.value1FieldsTypes[entry] === 'enum' && $scope.value1FieldsOptions[entry].length > 0) {
          $scope.params.value1[entry] = $scope.value1FieldsOptions[entry][0];
	        } else {
          $scope.params.value1[entry] = '';
	        }

      });

    }

    // Function called when submit button is clicked

    $scope.saveDataEnrichment = (isValid) => {
    	if(isValid) {
        const dataEnrichmentObjj = {};
        dataEnrichmentObjj[$scope.key1_label] = $scope.params.key1;
        dataEnrichmentObjj[$scope.value1_label] = $scope.params.value1;
        $uibModalInstance.close(dataEnrichmentObjj);
      }
    };

    // function called when clicked on 'cancel' button

    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };

    // Function which will delete a row.

    $scope.deleteRow = (row) => {
      $scope.params.value1 = _.without($scope.params.value1, row);
    };

  }
}

AddDataEnrichmentType3Ctrl.$inject = ['$scope', '$uibModalInstance', 'DataEnrichmentUtilService'];
/*eslint-disable*/
export default AddDataEnrichmentType3Ctrl;
/*eslint-enable*/
