
/* globals document, setTimeout */
import _ from 'lodash';
const  angular = require('angular');

import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import vunetConfigurationTemplate from './vunet_configuration.html';
import importDataPopupTemplate from './import_data_popup.html';
import './configuration.less';

import importDataPopupCtrl from './import_data_popup.controller';
app.controller('importDataPopupCtrl', importDataPopupCtrl);

import deviceheartbeatAddDataSourceCtrl from './deviceheartbeatAddDataSource.controller';
app.controller('deviceheartbeatAddDataSourceCtrl', deviceheartbeatAddDataSourceCtrl);

import cliAddDataSourceCtrl from './cliAddDataSource.controller';
app.controller('cliAddDataSourceCtrl', cliAddDataSourceCtrl);

import configurationcollectorAddDataSourceCtrl from './configurationcollectorAddDataSource.controller';
app.controller('configurationcollectorAddDataSourceCtrl', configurationcollectorAddDataSourceCtrl);

import healthbeatAddDataSourceCtrl from './healthbeatAddDataSource.controller';
app.controller('healthbeatAddDataSourceCtrl', healthbeatAddDataSourceCtrl);

import jdbcAddDataSourceCtrl from './jdbcAddDataSource.controller';
app.controller('jdbcAddDataSourceCtrl', jdbcAddDataSourceCtrl);

import logbeatAddDataSourceCtrl from './logbeatAddDataSource.controller';
app.controller('logbeatAddDataSourceCtrl', logbeatAddDataSourceCtrl);

import logcollectorAddDataSourceCtrl from './logcollectorAddDataSource.controller';
app.controller('logcollectorAddDataSourceCtrl', logcollectorAddDataSourceCtrl);

import netflowAddDataSourceCtrl from './netflowAddDataSource.controller';
app.controller('netflowAddDataSourceCtrl', netflowAddDataSourceCtrl);

import serviceheartbeatAddDataSourceCtrl from './serviceheartbeatAddDataSource.controller';
app.controller('serviceheartbeatAddDataSourceCtrl', serviceheartbeatAddDataSourceCtrl);

import snmpAddDataSourceCtrl from './snmpAddDataSource.controller';
app.controller('snmpAddDataSourceCtrl', snmpAddDataSourceCtrl);

import syslogAddDataSourceCtrl from './syslogAddDataSource.controller';
app.controller('syslogAddDataSourceCtrl', syslogAddDataSourceCtrl);

import tracepathbeatAddDataSourceCtrl from './tracepathbeatAddDataSource.controller';
app.controller('tracepathbeatAddDataSourceCtrl', tracepathbeatAddDataSourceCtrl);

import urlheartbeatAddDataSourceCtrl from './urlheartbeatAddDataSource.controller';
app.controller('urlheartbeatAddDataSourceCtrl', urlheartbeatAddDataSourceCtrl);


app.directive('vunetConfiguration', function () {
  return {
    restrict: 'E',
    controllerAs: 'configuration',
    controller: configuration,
    template: vunetConfigurationTemplate
  };
});

function configuration($scope, StateService, Upload, $compile, HTTP_SUCCESS_CODE, $uibModal, chrome) {

  // $state,
  //Import data to elasticsearch
  $scope.isModifyAllowed = false;
  if(chrome.canManageDataSources()) {
    $scope.isModifyAllowed = true;
  }

  $scope.importDataPopup = () => {
    $uibModal.open({
      animation: true,
      template: importDataPopupTemplate,
      controller: 'importDataPopupCtrl'
    }).result.then(function () {

      // Nothing to do once the import data pop up
      // is submitted.
    }, function () {

      // This callback is added to avoid the following
      // warning in console:Possibly unhandled rejection: cancel

      // 'Possibly unhandled rejection: cancel'
    });
  };

  // Be default we always display the list of data source type
  $scope.list_data_source_types = true;
  $scope.open_import = false;

  $scope.toggle_import_file = () => {
    $scope.open_import = !$scope.open_import;
  };

  $scope.close_import_file = () => {
    $scope.open_import = false;
  };

  // Add the elements such that every row has 4 squares
  $scope.addDataSourceType = () => {
    // Find the data_source_type_list element and iterate on
    // data_source_type_list and adds square elements for each
    // Create a new row once 4 elements are added
    const listElement = document.getElementById('data_source_list');
    let rowElement;
    let count = 0;
    _.forEach($scope.data_source_type_list, function (sourceType) {

      if (count % 4 === 0) {
        rowElement = $compile('<div class="row">')($scope);
        angular.element(listElement).append(rowElement);
      }

      const boxElementString = '<div class="col-md-3 data_source_type_box">';

      const boxElement = $compile(boxElementString)($scope);
      angular.element(rowElement).append(boxElement);

      // This string contains the full html code for a data source type
      /*eslint-disable*/
      const dataSourceTextElementString = '<div class="boxed" ng-click="gotoDataSourceType(\'' + sourceType.name + '\', \'' + sourceType.var_name + '\')" style="background-color:' + '#fff' + '; border: 1px solid #b3b5b9; box-shadow: 1px 1px 2px #888888; border-radius:4px;"><a style="text-decoration: none;" href=""><div style="padding:20px 64px;"><img style="width:100%;" src="../../assets/images/' + sourceType.image + '"></div><div style="padding: 18px; font-size:18px; ">' + sourceType.name + ' (' + sourceType.num_instance + ')<div style="font-size:14px; padding:8px 0px"> ' + sourceType.description + ' </div></div></a></div></div>';
      /*eslint-enable*/

      const el = $compile(dataSourceTextElementString)($scope);
      angular.element(boxElement).append(el);
      count += 1;
    });
    if (count > 4 && count % 4 !== 0) {
      angular.element(listElement).append('</div>');
    }
  };

  // In data services, we have made sure that this always invokes a
  // REST API irrespective of whether there is any change or not. This
  // takes care of the template html loading delay and we can insert
  // elements into the loaded html which we do in addDataSourceType.
  // Other way of doing would be to use an interval or timeout, I felt its
  // better to do it this way..
  StateService.getDataSourceTypeList().then(function (data) {
    // Make a call and get the list of data source type
    $scope.data_source_type_list = data;
    /* This is how the list looks like..
    $scope.data_source_type_list = [
            {
              "name": "SNMP",
              "var_name": "snmp",
              "description": "SNMP Health Monitoring",
              "num_instance": "2",
              "image": "A-for-Apache.png",
              "color": "#cea2ee"
            },
            {
              "name": "Device Heartbeat",
              "var_name": "deviceheartbeat",
              "description": "Find out if a resource is up and running",
              "num_instance": "25",
              "image": "H-for-Heartbeat.png",
              "color": "#a2eed9"
            },
            {
              "name": "Netflow",
              "var_name": "netflow",
              "description": "Flows in your network",
              "num_instance": "2",
              "image": "N-for-Network.png",
              "color": "#a2c0ee"
            }
    ]; */

    $scope.addDataSourceType();
  });

  // fileUploadError Flag
  $scope.fileUploadError = false;

  $scope.upload_data_source_file = function (uploadFile) {
    StateService.importDataSources(uploadFile, Upload)
      .then((response) => {
        if (response.status === HTTP_SUCCESS_CODE) {
          $scope.successfulUpload = true;
          // We reload the page after 400 msec as it takes some time
          // for ES to index the documents
          setTimeout(function () {
          // $state.go($state.current, {}, {
          //   reload: true
          // });
          }, 200);
        }
      })
      .catch(function (response) {
        $scope.fileUploadError = true;
        // To print error string to the user.
        $scope.fileUploadErrorMessage = response.data['error-string'];
      });

    // This is to reset the variable after the upload is done
    $scope.successfulUpload = false;
  };

  //This method is to enable submit button when we change any selected file
  $scope.onSelect = (file) => {
    if(file) {
      $scope.fileUploadError = false;
    }
  };

  $scope.gotoDataSourceType = (dataSourceName, dataSourceVarName) => {
    // Now replace list of data source type with details of a specific
    // data source type

    // Find the element and add a new div with directive created from
    // the name of the data source type
    const detailElement = document.getElementById('data_source_details');
    const directive = dataSourceVarName + '-data-source';
    //var string = "<p>This is SNMP testing</p>";
    const string = '<' + directive + '></' + directive + '>';
    const el = $compile(string)($scope);
    // Insert a new element with directive inside this element
    angular.element(detailElement).append(el);

    $scope.list_data_source_types = false;
    $scope.current_data_source = dataSourceName;
    // $scope.current_data_source_scope = {};
  };

  $scope.addDataSourceConfig = () => {
    // Invoke a function in corresponding directive
    // function name would be
    // var func_name_string = "edit" + $scope.current_data_source + "DataSourceConfig";
    //$scope.$$childHead.$$nextSibling.$$nextSibling.$$nextSibling.editConfig(null, false, false);

    $scope.current_data_source_scope.editConfig(null, false, false, false);

  };

}
