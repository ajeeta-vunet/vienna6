// This file is automatically generated using pluto meta-file framework
// Please do not make any change in this file directly.
const  angular = require('angular');

import _ from 'lodash';
class healthbeatAddDataSourceCtrl {
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


      $scope.ssl = $uibModalInstance.row.ssl;


      $scope.certificate = $uibModalInstance.row.certificate;


      $scope.key = $uibModalInstance.row.key;

      $scope.healthbeat = angular.copy($uibModalInstance.row.healthbeat);


      $scope.interval = 'minutes_15';
      $scope.dataReceived = $uibModalInstance.dataReceived;
    } else {



      $scope.name = '';






      $scope.port = '1024';






      $scope.ssl = 'No';






      $scope.certificate = '/opt/vusmartmaps/vusmartmaps.crt';






      $scope.key = '/opt/vusmartmaps/vusmartmaps.key';






      $scope.healthbeat = {};


      $scope.healthbeat.hb_interval = '300';




      $scope.healthbeat.cpu = 'Yes';




      $scope.healthbeat.core = 'Yes';




      $scope.healthbeat.diskio = 'Yes';




      $scope.healthbeat.filesys = 'Yes';




      $scope.healthbeat.fsstat = 'Yes';




      $scope.healthbeat.memory = 'Yes';




      $scope.healthbeat.network = 'Yes';




      $scope.healthbeat.process = 'Yes';




      $scope.healthbeat.process_summary = 'Yes';


      $scope.healthbeat.processes = [];








      $scope.dataReceived = false;
      $scope.interval = 'minutes_15';
    }




























    $scope.new_processes = [];
    $scope.add_processes = () => {
      const newObj = {

        process: '',




      };

      $scope.new_processes.push(newObj);
    };

    $scope.delete_processes = (row) => {
      $scope.healthbeat.processes = _.without($scope.healthbeat.processes, row);
    };

    $scope.delete_new_processes = (row) => {
      $scope.new_processes = _.without($scope.new_processes, row);
    };









    // Function called when Save&Continue button is clicked
    $scope.saveDataSource = (isValid) => {
      if(isValid) {
        // Create an object from current values..

        $scope.dataObj.name = $scope.name;


        $scope.dataObj.port = $scope.port;


        $scope.dataObj.ssl = $scope.ssl;


        $scope.dataObj.certificate = $scope.certificate;


        $scope.dataObj.key = $scope.key;




        $scope.dataObj.healthbeat = {};

        $scope.dataObj.healthbeat.hb_interval = $scope.healthbeat.hb_interval;


        $scope.dataObj.healthbeat.cpu = $scope.healthbeat.cpu;


        $scope.dataObj.healthbeat.core = $scope.healthbeat.core;


        $scope.dataObj.healthbeat.diskio = $scope.healthbeat.diskio;


        $scope.dataObj.healthbeat.filesys = $scope.healthbeat.filesys;


        $scope.dataObj.healthbeat.fsstat = $scope.healthbeat.fsstat;


        $scope.dataObj.healthbeat.memory = $scope.healthbeat.memory;


        $scope.dataObj.healthbeat.network = $scope.healthbeat.network;


        $scope.dataObj.healthbeat.process = $scope.healthbeat.process;


        $scope.dataObj.healthbeat.process_summary = $scope.healthbeat.process_summary;

        $scope.dataObj.healthbeat.processes = $scope.healthbeat.processes = $scope.healthbeat.processes.concat($scope.new_processes);

























        $scope.new_processes = [];








        // If row already exist, we need to figure out if something has really
        // changed
        if ($uibModalInstance.row) {
          StateService.updateDataSources('healthbeat', $scope.name, $scope.dataObj).then(function () {
            $uibModalInstance.row.name = $scope.name;
            $uibModalInstance.row.port = $scope.port;
            $uibModalInstance.row.ssl = $scope.ssl;
            $uibModalInstance.row.certificate = $scope.certificate;
            $uibModalInstance.row.key = $scope.key;
            $uibModalInstance.row.healthbeat = $scope.healthbeat;

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
          StateService.addDataSources('healthbeat', $scope.name, $scope.dataObj).then(function () {
            $uibModalInstance.row = {};
            $uibModalInstance.row.name = $scope.name;
            $uibModalInstance.row.port = $scope.port;
            $uibModalInstance.row.ssl = $scope.ssl;
            $uibModalInstance.row.certificate = $scope.certificate;
            $uibModalInstance.row.key = $scope.key;
            $uibModalInstance.row.healthbeat = $scope.healthbeat;

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
      StateService.refreshDataSouce('healthbeat', $scope.name, '', $scope.interval).then(function (data) {

        $scope.dataReceived = data.dataReceived;
      });
    };

    $scope.downloadDataSourceAgentConfiguration = (environment) => {
      const dataObj = {};
      dataObj.name = $scope.name;
      dataObj.port = $scope.port;
      dataObj.ssl = $scope.ssl;
      dataObj.certificate = $scope.certificate;
      dataObj.key = $scope.key;
      dataObj.healthbeat = $scope.healthbeat;

      StateService.downloadDataSourceAgentConfiguration('healthbeat', $scope.name, environment, dataObj).then(function () {
      });
    };

    $scope.downloadDataSourceAgent = (environment) => {
      const dataObj = {};
      dataObj.name = $scope.name;
      dataObj.port = $scope.port;
      dataObj.ssl = $scope.ssl;
      dataObj.certificate = $scope.certificate;
      dataObj.key = $scope.key;
      dataObj.healthbeat = $scope.healthbeat;

      StateService.downloadDataSourceAgent('healthbeat', $scope.name, environment, dataObj).then(function () {
      });
    };



    $scope.closeDataSource = () => {
      $uibModalInstance.close($scope.dataObj);
    };
  }
}

healthbeatAddDataSourceCtrl.$inject = ['$scope', 'StateService', '$uibModalInstance'];
/*eslint-disable*/
export default healthbeatAddDataSourceCtrl;
/*eslint-enable*/
