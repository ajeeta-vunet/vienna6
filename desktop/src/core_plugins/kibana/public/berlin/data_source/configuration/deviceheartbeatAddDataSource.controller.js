// This file is automatically generated using pluto meta-file framework
// Please do not make any change in this file directly.
const  angular = require('angular');

import _ from 'lodash';
class deviceheartbeatAddDataSourceCtrl {
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

      $scope.dh_heartbeat = angular.copy($uibModalInstance.row.dh_heartbeat);


      $scope.interval = 'minutes_15';
      $scope.dataReceived = $uibModalInstance.dataReceived;
    } else {



      $scope.name = '';






      $scope.port = '1024';






      $scope.run_in_shipper = 'No';






      $scope.dh_heartbeat = {};


      $scope.dh_heartbeat.dh_interval = '300';




      $scope.dh_heartbeat.dh_count = '3';




      $scope.dh_heartbeat.dh_timeout = '500';




      $scope.dh_heartbeat.dh_size = '20';




      $scope.dh_heartbeat.dh_overall_timeout = '3000';


      $scope.dh_heartbeat.dh_device = [];








      $scope.dataReceived = false;
      $scope.interval = 'minutes_15';
    }



















    $scope.new_dh_device = [];
    $scope.add_dh_device = () => {
      const newObj = {

        dh_device_address: '',




      };

      $scope.new_dh_device.push(newObj);
    };

    $scope.delete_dh_device = (row) => {
      $scope.dh_heartbeat.dh_device = _.without($scope.dh_heartbeat.dh_device, row);
    };

    $scope.delete_new_dh_device = (row) => {
      $scope.new_dh_device = _.without($scope.new_dh_device, row);
    };









    // Function called when Save&Continue button is clicked
    $scope.saveDataSource = (isValid) => {
      if (isValid) {
        // Create an object from current values..

        $scope.dataObj.name = $scope.name;


        $scope.dataObj.port = $scope.port;


        $scope.dataObj.run_in_shipper = $scope.run_in_shipper;




        $scope.dataObj.dh_heartbeat = {};

        $scope.dataObj.dh_heartbeat.dh_interval = $scope.dh_heartbeat.dh_interval;


        $scope.dataObj.dh_heartbeat.dh_count = $scope.dh_heartbeat.dh_count;


        $scope.dataObj.dh_heartbeat.dh_timeout = $scope.dh_heartbeat.dh_timeout;


        $scope.dataObj.dh_heartbeat.dh_size = $scope.dh_heartbeat.dh_size;


        $scope.dataObj.dh_heartbeat.dh_overall_timeout = $scope.dh_heartbeat.dh_overall_timeout;

        $scope.dataObj.dh_heartbeat.dh_device = $scope.dh_heartbeat.dh_device = $scope.dh_heartbeat.dh_device.concat($scope.new_dh_device);


















        $scope.new_dh_device = [];








        // If row already exist, we need to figure out if something has really
        // changed
        if ($uibModalInstance.row) {
          StateService.updateDataSources('deviceheartbeat', $scope.name, $scope.dataObj).then(function () {
            $uibModalInstance.row.name = $scope.name;
            $uibModalInstance.row.port = $scope.port;
            $uibModalInstance.row.run_in_shipper = $scope.run_in_shipper;
            $uibModalInstance.row.dh_heartbeat = $scope.dh_heartbeat;

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
          StateService.addDataSources('deviceheartbeat', $scope.name, $scope.dataObj).then(function () {
            $uibModalInstance.row = {};
            $uibModalInstance.row.name = $scope.name;
            $uibModalInstance.row.port = $scope.port;
            $uibModalInstance.row.run_in_shipper = $scope.run_in_shipper;
            $uibModalInstance.row.dh_heartbeat = $scope.dh_heartbeat;

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
      StateService.refreshDataSouce('deviceheartbeat', $scope.name, '', $scope.interval).then(function (data) {

        $scope.dataReceived = data.dataReceived;
      });
    };

    $scope.downloadDataSourceAgentConfiguration = (environment) => {
      const dataObj = {};
      dataObj.name = $scope.name;
      dataObj.port = $scope.port;
      dataObj.run_in_shipper = $scope.run_in_shipper;
      dataObj.dh_heartbeat = $scope.dh_heartbeat;

      StateService.downloadDataSourceAgentConfiguration('deviceheartbeat', $scope.name, environment, dataObj).then(function () {
      });
    };

    $scope.downloadDataSourceAgent = (environment) => {
      const dataObj = {};
      dataObj.name = $scope.name;
      dataObj.port = $scope.port;
      dataObj.run_in_shipper = $scope.run_in_shipper;
      dataObj.dh_heartbeat = $scope.dh_heartbeat;

      StateService.downloadDataSourceAgent('deviceheartbeat', $scope.name, environment, dataObj).then(function () {
      });
    };



    $scope.closeDataSource = () => {
      $uibModalInstance.close($scope.dataObj);
    };
  }
}

deviceheartbeatAddDataSourceCtrl.$inject = ['$scope', 'StateService', '$uibModalInstance'];
/*eslint-disable*/
export default deviceheartbeatAddDataSourceCtrl;
/*eslint-enable*/
