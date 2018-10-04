const $ = require('jquery');

require('ui/courier');
require('bootstrap-timepicker');
require('ui/directives/email_validator.js');
const moment = require('moment');
import dateMath from '@elastic/datemath';
const app = require('ui/modules').get('app/alert', [
  'kibana/courier'
]);

app.directive('alertDetails', function ($compile, courier, Notifier, $filter) {
  return {
    restrict: 'E',
    require: '^alertApp', // must inherit from the alertApp
    template: require('plugins/kibana/alert/directives/details.html'),
    link: function ($scope) {

      // Enable the checkbox and show the advanced
      // configuration if configured during load operation.
      if($scope.advancedConfig && $scope.advancedConfig.length > 0) {
        $scope.enableAdvancedConfig = true;
      } else {
        $scope.enableAdvancedConfig = false;
      }

      //This will set the indexFields with the fields according to the data source selected.
      //It also takes care of grouping the fields according to their types.
      $scope.setIndexPattern = function (rule, $index) {
        courier.indexPatterns.get(rule.selectedIndex.id).then(function (currentIndex) {
          let fields = currentIndex.fields.raw;
          fields = $filter('filter')(fields, { aggregatable: true });
          $scope.operRuleList[$index].indexFields = fields.slice(0);
        });
      };

      // Takes care of showing the ruleType related fields when ruleType is selected.
      // Example hide the target field when count is selected.
      // metricIsSelected : To show / hide the threshold conditions
      // and alert duration

      // sumOrAverageIsSelected : To show the target field names where ever
      // necessary

      // targetFieldInvisibility : To show / hide target field

      // countIsSelected : To display text 'events' wherever necessary.

      // relevant text
      $scope.updateRuleType = function (rule, $index) {
        $scope.operRuleList[$index].metricIsSelected = false;
        $scope.operRuleList[$index].sumOrAverageIsSelected = false;
        $scope.operRuleList[$index].targetFieldInvisibility = false;
        $scope.operRuleList[$index].countIsSelected = false;
        $scope.operRuleList[$index].allowStringInCompareValue = false;
        $scope.operRuleList[$index].groupByField = [{ data: '' }];

        if(rule.ruleType === 'sum' ||
          rule.ruleType === 'average' ||
          rule.ruleType === 'min' ||
          rule.ruleType === 'max') {
          $scope.operRuleList[$index].metricIsSelected = true;
          $scope.operRuleList[$index].sumOrAverageIsSelected = true;
        } else if(rule.ruleType === 'count') {
          $scope.operRuleList[$index].selectedField = undefined;
          $scope.operRuleList[$index].metricIsSelected = true;
          $scope.operRuleList[$index].targetFieldInvisibility = true;
          $scope.operRuleList[$index].countIsSelected = true;
        } else if(rule.ruleType === 'unique_values') {
          $scope.operRuleList[$index].metricIsSelected = true;
        } else if(rule.ruleType === 'state_change' || rule.ruleType === 'latest_value') {
          $scope.operRuleList[$index].allowStringInCompareValue = true;
          $scope.operRuleList[$index].metricIsSelected = true;
          rule.ruleTypeDuration = 5;
          rule.ruleTypeDurationType = 'minute';
        }
      };

      // to add a group by field
      $scope.addNewGroupByField = function ($index) {
        // we need a list of group by fields in this format
        // ['field1', 'field2', field3']
        // To achive this we are initialising dataObj to {data:''}
        // every time this function is called so that we can push the
        // user selected field object into the list.
        // Please note this is run inside a ng-repeat for group by fields
        // in details.html, where the 'data' is populated with the value
        // selected by the user in the front end.
        const dataObj = { data: '' };
        $scope.operRuleList[$index].groupByField.push(dataObj);
      };

      // To delete a group by field
      $scope.removeGroupByField = function (parentIndex, index) {
        $scope.operRuleList[parentIndex].groupByField.splice(index, 1);
      };


      // to add additional fields
      $scope.addNewAdditionalField = function ($index) {
        // we need a list of additional fields in this format
        // ['field1', 'field2', field3']
        // To achive this we are initialising dataObj to {data:''}
        // every time this function is called so that we can push the
        // user selected field object into the list.
        // Please note this is run inside a ng-repeat for group by fields
        // in details.html, where the 'data' is populated with the value
        // selected by the user in the front end.
        const dataObj = { data: '' };
        $scope.operRuleList[$index].additionalField.push(dataObj);
      };

      // To delete additional fields
      $scope.removeAdditionalField = function (parentIndex, index) {
        $scope.operRuleList[parentIndex].additionalField.splice(index, 1);
      };

      // This function will reset the threshold fields when the
      // when the rule level threshold is disabled.
      $scope.resetFieldsOnRuleLevelSelection = function () {
        if($scope.ruleLevelThreshold === false)
        {
          $scope.evalCriteria.compareType = '';
          $scope.evalCriteria.compareValue = '';
        }
      };

      // reset the comparision fields
      $scope.resetComparisionFields = function (rule) {
        rule.compareType = '';
        rule.compareValue = 0;
        rule.compareValueStr = '';
      };

      $scope.showDateValfrom = false;
      $scope.showDateValto = false;

      // Function to display or hide the Calendar
      // while clicking From input text box.
      $scope.showDatefrom = function (element) {
        if ($(element.target).is('input') ||
        ($(element.target).parent().parent().is('td') &&
        $(element.target).parent().hasClass('btn-sm'))) {
          $scope.showDateValfrom = !$scope.showDateValfrom;
        }
      };

      // Function to display or hide the Calendar
      // while clicking To input text box.
      $scope.showDateto = function (element) {
        if ($(element.target).is('input') ||
        ($(element.target).parent().parent().is('td') &&
        $(element.target).parent().hasClass('btn-sm'))) {
          $scope.showDateValto = !$scope.showDateValto;
        }
      };

      // Function to hide calander for from and to
      // after clicking go button.
      $scope.goShowDate = function () {
        $scope.showDateValfrom = false;
        $scope.showDateValto = false;
      };

      // To add a rule
      $scope.addNewRule = function () {
        const newRuleObj = {
          'selectedIndex': '',
          'ruleType': '',
          'ruleNameAlias': '',
          'informationCollector': false,
          'metricAlias': '',
          'selectedField': '',
          'compareType': '',
          'compareValue': 0,
          'compareValueStr': '',
          'ruleTypeDuration': 5,
          'ruleTypeDurationType': 'minute',
          'groupByField': [],
          'additionalField': [],
          'alertFilter': '',
          'enableComparisionFields': false,
        };
        $scope.ruleList.push(newRuleObj);
        $scope.operRuleList.push({ 'indexFields': [],
          'metricIsSelected': false,
          'sumOrAverageIsSelected': false,
          'countIsSelected': false,
          'targetFieldInvisibility': false,
          'selectedField': undefined,
          'groupByField': [{ data: '' }],
          'additionalField': [{ data: '' }],
        });
      };

      // To delete a rule
      $scope.removeRule = function ($index) {
        $scope.ruleList.splice($index, 1);
        $scope.operRuleList.splice($index, 1);
        // Reset the informationCollector checkbox to false
        // for the first sub rule
        if($scope.ruleList.length > 0) {
          $scope.ruleList[0].informationCollector = false;
        }
      };

      //Default time to set the value of from and to(from-> current time
      //and to-> current time - 15mins.
      $scope.fromtime = dateMath.parse($scope.fromtime || moment().subtract(15, 'minutes'));
      $scope.totime = dateMath.parse($scope.totime || moment(), true);


      //Time picker start time and end time in Active alert time section
      $('#alert-timepicker1').timepicker({
        minuteStep: 1,
        template: 'modal',
        appendWidgetTo: 'body',
        showSeconds: true,
        showMeridian: false,
        defaultTime: false
      });

      $('#alert-timepicker2').timepicker({
        minuteStep: 1,
        template: 'modal',
        appendWidgetTo: 'body',
        showSeconds: true,
        showMeridian: false,
        defaultTime: false
      });

      // Clear email input field if the alert by email
      // channel is not checked.
      $scope.clearEmailField = function () {
        if(!$scope.alertByEmail) {
          $scope.alertEmailId = '';
        }
      };

      // Clear advanced config text area if the checkbox for
      // advanced config is changed.
      $scope.clearAdvancedConfigTextArea = function () {
        $scope.advancedConfig = '';
      };

      // Clear runBookScript input field if RunBookAutomation
      // channel is not checked.
      $scope.clearRunBookField = function () {
        if (!$scope.enableRunBookAutomation) {
          $scope.runBookScript = '';
        }
      };

      // Clear Playbook config fields when AnsiblePlaybook
      // channel is not checked.
      $scope.clearAnsiblePlaybookFields = function () {
        if (!$scope.enableAnsiblePlaybook) {
          $scope.ansiblePlaybookName = '';
          $scope.ansiblePlaybookOptions = '';
        }
      };

      // Check for atleast one day in the week is selected
      $scope.isAlertEnabledForADay = function () {
        return ($scope.alertOnMonday || $scope.alertOnTuesday ||
                $scope.alertOnWednesday || $scope.alertOnThursday ||
                $scope.alertOnFriday || $scope.alertOnSaturday ||
                $scope.alertOnSunday);
      };
    }
  };
});
