import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { getBusinessMetricList } from 'ui/utils/business_metric_list.js';
require('ui/courier');

const _ = require('lodash');
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/customer_journey_map_vis', ['kibana']);
module.controller('CustomerJourneyMapVisParamsController', function ($scope, $rootScope, Private) {

  const savedObjectsClient = Private(SavedObjectsClientProvider);
  // Gets the list of all business stage visualization configured.
  getBusinessMetricList(savedObjectsClient).then(function (data) {
    $scope.bmvList = data;
    // adding an empty field to starting of the array
    $scope.bmvList.unshift({ id: '', title: '' });
  });

  $scope.search = function () {
    $rootScope.$broadcast('courier:searchRefresh');
  };

  $scope.stageIcons = ['verfiy_beneficiary', 'swift', 'otp', 'rate_and_charges', 'fund_debit', 'fts'];

  // Extra images specific to clients. Please dont delete the below commeneted code .
  // , 'Aadhaar', 'AEPS', 'ATM',
  //   'Balance-Enquiry', 'Bank-Branch', 'Bill-Payment', 'BMC_Control_M', 'Cash-Deposit', 'Cash-Withdrawal', 'Core-Bank',
  //   'Corporate-internet-Bank', 'Correspondence-Bank', 'Credit-card-Management', 'CRM', 'Enterprise-Data-warehouse',
  //   'Fund-Transfer(domestic_international)', 'IBM_DataPower', 'IBM_Integration_Bus', 'IBM_Websphere',
  //   'IBM_Websphere_Liberty', 'IBM_Websphere_MQ', 'IHS-Web-Server', 'IMPS', 'Intra-Bank-fund-Transfer', 'IRIS_App', 'Login',
  //   'Mini-Statement','Mobile_App', 'MS_SQL_DB', 'Murex', 'NEFT', 'Oracle-DB', 'OTP', 'Registration', 'Retail-Internet-Bank',
  //   'Salary-Payment', 'SMS-Gateway', 'SWFIT(Society-for-Worldwide-Interbank-Financial-Telecommunication)', 'sybase', 'T24',
  //   'T24_TC_Client', 'T24_TC_Server', 'Trading', 'Treasury-Bank', 'UPI', 'Validation-Verification', 'Vendor-Payment',
  //   'Wage-Payment', 'WebLogic'

  // This is the array of themes
  $scope.colorSchemas = ['Rainbow Theme', 'Dark Theme', 'Light Theme', 'Dark Gray Theme', 'Light Gray Theme'];

  // This array is user to hold the boolean value of stages whether they are open or collapsed
  $scope.openConfigureStage = [];

  // This array is user to hold the boolean value of metric groups whether they are open or collapsed
  $scope.openConfigureMetricGroup = [];

  // This array is user to hold the boolean value of metrics whether they are open or collapsed configured inside metric groups
  $scope.openConfigureMetrices = [];

  // Delete one of the stages configured.
  $scope.removeStage = function (index) {
    $scope.vis.params.stages.splice(index, 1);
    $scope.openConfigureStage.splice(index, 1);
  };

  // Add a new stage configuration.
  $scope.addStage = function () {
    $scope.vis.params.stages.splice($scope.vis.params.stages.length, 0, {});
    $scope.openConfigureStage.push({ expanded: false, validName: true });
  };

  // This will move element inside array from old position to new position for stages
  function moveStage(arr, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    $scope.openConfigureStage.splice(newIndex, 0, $scope.openConfigureStage.splice(oldIndex, 1)[0]);
  }

  // Move a stage one position above the current position.
  $scope.moveUpStage = function (index) {
    moveStage($scope.vis.params.stages, index, index - 1);
  };

  // Move a stage one position below the current position.
  $scope.moveDownStage = function (index) {
    moveStage($scope.vis.params.stages, index, index + 1);
  };

  // Delete one of the metric groups configured.
  $scope.removeMetricGroup = function (index) {
    $scope.vis.params.metricGroups.splice(index, 1);
    $scope.openConfigureMetricGroup.splice(index, 1);
  };

  // Add a new metric group configuration.
  $scope.addMetricGroup = function () {
    $scope.vis.params.metricGroups.splice($scope.vis.params.metricGroups.length, 0, {});
    $scope.openConfigureMetricGroup.push({ expanded: false, validName: true });
    $scope.openConfigureMetrices.push({ expanded: false });
  };

  // This will move element inside array from old position to new position for metric groups
  function moveMetricGroup(arr, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    $scope.openConfigureMetricGroup.splice(newIndex, 0, $scope.openConfigureMetricGroup.splice(oldIndex, 1)[0]);
  }

  // Move a metric group one position above the current position.
  $scope.moveUpMetricGroup = function (index) {
    moveMetricGroup($scope.vis.params.metricGroups, index, index - 1);
  };

  // Move a metric group one position below the current position.
  $scope.moveDownMetricGroup = function (index) {
    moveMetricGroup($scope.vis.params.metricGroups, index, index + 1);
  };

  $scope.checkIfSameStageName = function (stageName, index) {
    $scope.openConfigureStage[index].validName = true;
    $scope.visualizeEditor.stageName.$invalid = false;
    const stageNames = [];
    _.each($scope.vis.params.stages, function (stage) {
      stageNames.push(stage.name);
    });
    stageNames.splice(index, 1);
    $scope.indexIfSameName =  _.indexOf(stageNames, stageName);
    if($scope.indexIfSameName >= 0) {
      $scope.openConfigureStage[index].validName = false;
      $scope.visualizeEditor.stageName.$invalid = true;
    }
  };

  $scope.checkIfSameMetricGroupName = function (metricGroupName, index) {
    $scope.openConfigureMetricGroup[index].validName = true;
    $scope.visualizeEditor.metricGroupName.$invalid = false;
    const metricGroupNames = [];
    _.each($scope.vis.params.metricGroups, function (metricGroup) {
      metricGroupNames.push(metricGroup.name);
    });
    metricGroupNames.splice(index, 1);
    $scope.indexIfSameNameMetricGroup =  _.indexOf(metricGroupNames, metricGroupName);
    if($scope.indexIfSameNameMetricGroup >= 0) {
      $scope.openConfigureMetricGroup[index].validName = false;
      $scope.visualizeEditor.metricGroupName.$invalid = true;
    }
  };

  _.each($scope.vis.params.stages, function () {
    $scope.openConfigureStage.push({ validName: true });
  });

  _.each($scope.vis.params.metricGroups, function () {
    $scope.openConfigureMetricGroup.push({ validName: true });
  });

});
