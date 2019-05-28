// This file is automatically generated using pluto meta-file framework
// Please do not make any change in this file directly.
const  angular = require('angular');

import _ from 'lodash';
class tracepathbeatAddDataSourceCtrl {
  constructor($scope, StateService, $uibModalInstance) {

    $scope.editDataSource = false;
    $scope.dataObj = {};
    $scope.first_step = $uibModalInstance.first_step;
    $scope.second_step = $uibModalInstance.second_step;
    $scope.third_step = $uibModalInstance.third_step;
    $scope.index = $uibModalInstance.index;
    $scope.data = $uibModalInstance.data;
    $scope.fourth_step = $uibModalInstance.fourth_step;










    // if row is present then, edit modal function is called.
    if ($uibModalInstance.row) {
      $scope.editDataSource = true;

      $scope.name = $uibModalInstance.row.name;


      $scope.port = $uibModalInstance.row.port;


      $scope.run_in_shipper = $uibModalInstance.row.run_in_shipper;

      $scope.tp_tracepathbeat = angular.copy($uibModalInstance.row.tp_tracepathbeat);


      $scope.interval = 'minutes_15';
      $scope.dataReceived = $uibModalInstance.dataReceived;
    } else {



      $scope.name = '';






      $scope.port = '1024';






      $scope.run_in_shipper = 'No';





      $scope.tp_tracepathbeat = {};


      $scope.tp_tracepathbeat.tp_interval = '300';




      $scope.tp_tracepathbeat.tp_usemtr = 'Yes';




      $scope.tp_tracepathbeat.tp_usetcpsyn = 'No';




      $scope.tp_tracepathbeat.tp_probecount = '3';




      $scope.tp_tracepathbeat.tp_overall_timeout = '30000';




      $scope.tp_tracepathbeat.tp_sleep_after_every_n_target = '10';




      $scope.tp_tracepathbeat.tp_sleep_for_after_every_n_target = '2000';


      $scope.tp_tracepathbeat.tp_target = [];









      $scope.dataReceived = false;
      $scope.interval = 'minutes_15';
    }




















    $scope.new_tp_target = [];
    $scope.add_tp_target = () => {
      const newObj = {


        tp_target_address: '',



      };

      $scope.new_tp_target.push(newObj);
    };

    $scope.delete_tp_target = (row) => {
      $scope.tp_tracepathbeat.tp_target = _.without($scope.tp_tracepathbeat.tp_target, row);
    };

    $scope.delete_new_tp_target = (row) => {
      $scope.new_tp_target = _.without($scope.new_tp_target, row);
    };










    // Function called when Save&Continue button is clicked
    $scope.saveDataSource = (isValid) => {
      if(isValid) {
        // Create an object from current values..

        $scope.dataObj.name = $scope.name;


        $scope.dataObj.port = $scope.port;


        $scope.dataObj.run_in_shipper = $scope.run_in_shipper;



        $scope.dataObj.tp_tracepathbeat = {};

        $scope.dataObj.tp_tracepathbeat.tp_interval = $scope.tp_tracepathbeat.tp_interval;


        $scope.dataObj.tp_tracepathbeat.tp_usemtr = $scope.tp_tracepathbeat.tp_usemtr;


        $scope.dataObj.tp_tracepathbeat.tp_usetcpsyn = $scope.tp_tracepathbeat.tp_usetcpsyn;


        $scope.dataObj.tp_tracepathbeat.tp_probecount = $scope.tp_tracepathbeat.tp_probecount;


        $scope.dataObj.tp_tracepathbeat.tp_overall_timeout = $scope.tp_tracepathbeat.tp_overall_timeout;


        $scope.dataObj.tp_tracepathbeat.tp_sleep_after_every_n_target = $scope.tp_tracepathbeat.tp_sleep_after_every_n_target;


        $scope.dataObj.tp_tracepathbeat.tp_sleep_for_after_every_n_target = $scope.tp_tracepathbeat.tp_sleep_for_after_every_n_target;

        /*eslint-disable*/
        $scope.dataObj.tp_tracepathbeat.tp_target = $scope.tp_tracepathbeat.tp_target = $scope.tp_tracepathbeat.tp_target.concat($scope.new_tp_target);
        /*eslint-enable*/



















        $scope.new_tp_target = [];









        // If row already exist, we need to figure out if something has really
        // changed
        if ($uibModalInstance.row) {
          StateService.updateDataSources('tracepathbeat', $scope.name, $scope.dataObj).then(function () {
            $uibModalInstance.row.name = $scope.name;
            $uibModalInstance.row.port = $scope.port;
            $uibModalInstance.row.run_in_shipper = $scope.run_in_shipper;
            $uibModalInstance.row.tp_tracepathbeat = $scope.tp_tracepathbeat;

            $uibModalInstance.data_receive_list.splice($uibModalInstance.data.indexOf($uibModalInstance.row), 1);
            $uibModalInstance.data = _.without($uibModalInstance.data, $uibModalInstance.row);
            $uibModalInstance.data.push($scope.dataObj);
            $uibModalInstance.data_receive_list.push(false);
            $scope.data_saved = true;
            $scope.third_step = true;
            $scope.second_step = false;

          });
        } else {
          // Normal add
          StateService.addDataSources('tracepathbeat', $scope.name, $scope.dataObj).then(function () {
            $uibModalInstance.row = {};
            $uibModalInstance.row.name = $scope.name;
            $uibModalInstance.row.port = $scope.port;
            $uibModalInstance.row.run_in_shipper = $scope.run_in_shipper;
            $uibModalInstance.row.tp_tracepathbeat = $scope.tp_tracepathbeat;

            $uibModalInstance.data.push($scope.dataObj);
            $uibModalInstance.data_receive_list.push(false);
            $scope.data_saved = true;
            $scope.third_step = true;
            $scope.second_step = false;

          });
        }
      }
    };

    // function called when clicked on 'cancel' button
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.refreshDataSource = () => {
      // Make a query and get the data from backend based on interval
      StateService.refreshDataSouce('tracepathbeat', $scope.name, '', $scope.interval).then(function (data) {

        $scope.dataReceived = data.dataReceived;
      });
    };

    $scope.downloadDataSourceAgentConfiguration = (environment) => {
      const dataObj = {};
      dataObj.name = $scope.name;
      dataObj.port = $scope.port;
      dataObj.run_in_shipper = $scope.run_in_shipper;
      dataObj.tp_tracepathbeat = $scope.tp_tracepathbeat;

      StateService.downloadDataSourceAgentConfiguration('tracepathbeat', $scope.name, environment, dataObj).then(function () {
      });
    };

    $scope.downloadDataSourceAgent = (environment) => {
      const dataObj = {};
      dataObj.name = $scope.name;
      dataObj.port = $scope.port;
      dataObj.run_in_shipper = $scope.run_in_shipper;
      dataObj.tp_tracepathbeat = $scope.tp_tracepathbeat;

      StateService.downloadDataSourceAgent('tracepathbeat', $scope.name, environment, dataObj).then(function () {
      });
    };



    $scope.closeDataSource = () => {
      $uibModalInstance.close($scope.dataObj);
    };
  }
}

tracepathbeatAddDataSourceCtrl.$inject = ['$scope', 'StateService', '$uibModalInstance'];
/*eslint-disable*/
export default tracepathbeatAddDataSourceCtrl;
/*eslint-enable*/