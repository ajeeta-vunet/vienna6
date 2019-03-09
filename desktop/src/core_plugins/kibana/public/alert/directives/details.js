const $ = require('jquery');

require('ui/courier');
require('bootstrap-timepicker');
require('ui/directives/email_validator.js');
require('ui/directives/searchable_multiselect.js');

const moment = require('moment');
import dateMath from '@elastic/datemath';
const app = require('ui/modules').get('app/alert', [
  'kibana/courier'
]);

app.directive('alertDetails', function ($compile, courier, Notifier, $filter, savedSearches, savedVisualizations) {
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

      const defaultValue = {
        id: '',
        title: '',
      };

      //This will set the indexFields with the fields according to the data source selected.
      //It also takes care of grouping the fields according to their types.
      $scope.setIndexPattern = function (id, $index) {
        if (id !== '') {
          courier.indexPatterns.get(id).then(function (currentIndex) {
            let fields = currentIndex.fields.raw;
            fields = $filter('filter')(fields, { aggregatable: true });
            $scope.operRuleList[$index].indexFields = fields.slice(0);
          });
        }
      };

      // This will get all the metrics and visualization for the selected BMV.
      // The visualization will be sent as a parameter when click the preview
      $scope.setVuMetric = function (rule, $index) {
        // When the BMV is changed, the length of the metrics also will change.
        // So we need to adjust both inner and outer rule index based on the
        // new BMV selected.

        // First get the length of the metrics for the BMV before changing.
        // For ex; the existing BMV might have 4 metrics and the new selected
        // BMV might have just 2 metrics. So we need adjust the inner and outer
        // rule idex. The rules before this will not get changed. But the rules
        // below this needs to get adjusted.
        var prev_length = 1;
        var curr_length = 1;
        if ($scope.operRuleList[$index].metrics.length > 0) {
          prev_length = $scope.operRuleList[$index].metrics.length;
	}

        savedVisualizations.get(rule.selectedMetric.id).then(function (savedVisualization){
          $scope.ruleList[$index].selectedIndex = defaultValue;
          $scope.operRuleList[$index].metrics = savedVisualization.visState.params.metrics;
          $scope.operRuleList[$index].vis = savedVisualization;
          $scope.ruleList[$index].enableComparisionFields = false;

          // Get the metrics length for the selected BMV.
          if ($scope.operRuleList[$index].metrics.length > 0) {
            curr_length = $scope.operRuleList[$index].metrics.length;
          }

          updateIndexForMetricsAndRules($index,prev_length, curr_length);
        });
      };

      // When an alert is configured using BMV, the alert rule within the BMV is used for alert.
      // So we need to set the alert rule fields to empty.
      // When an alert is configured using the data source, the selected bmv will be empty and
      // the alert rule fields will be configured manually.
      $scope.showVUMetric = function($index) {
        var prev_length, curr_length = 1;
        if ($scope.operRuleList[$index].metrics.length > 0) {
          prev_length = $scope.operRuleList[$index].metrics.length;
        }
        if ($scope.ruleList[$index].vuMetricsBased === false ) {
          $scope.ruleList[$index].selectedMetric = defaultValue;
          $scope.operRuleList[$index].metrics = [];
          // Get the metrics length for the selected BMV.
          if ($scope.operRuleList[$index].metrics.length > 0) {
            curr_length = $scope.operRuleList[$index].metrics.length;
          }
        }
        else {
          $scope.ruleList[$index].ruleType = '';
          $scope.ruleList[$index].selectedField = '';
          $scope.ruleList[$index].compareType = '';
          $scope.ruleList[$index].compareValue = '';
          $scope.ruleList[$index].compareValueStr = '';
          $scope.ruleList[$index].additionalField ='';
          $scope.ruleList[$index].groupByField ='';
          $scope.ruleList[$index].alertFilter ='';
          $scope.ruleList[$index].metricAlias ='';
        };
        updateIndexForMetricsAndRules($index, prev_length, curr_length);
      };

      function updateIndexForMetricsAndRules(metricIndex, prev_length, curr_length) {
        // If this is the only alert rule then
        if (metricIndex === 0) {
          $scope.operRuleList[metricIndex].outerRuleIndex = curr_length;
        }
        // else adjust the rule index based on the previous rule.
        else {
          $scope.operRuleList[metricIndex].outerRuleIndex = $scope.operRuleList[metricIndex-1].outerRuleIndex + curr_length;
        }

        // Go though each rule which are below the current rule and update the rule index.
        for (let index = metricIndex + 1; index < $scope.ruleList.length; index++) {
          // If the previous length is greater than current length then
          if (prev_length > curr_length) {
            // The rule index should be decreased by previous 2 length (4) - current length (2)
            $scope.operRuleList[index].innerRuleIndex = $scope.operRuleList[index].innerRuleIndex - (prev_length - curr_length);
            $scope.operRuleList[index].outerRuleIndex = $scope.operRuleList[index].outerRuleIndex - (prev_length - curr_length);;
          }
          // else the rule index should be increased by 2 current length (4) - previous length (2)
          else if (prev_length < curr_length) {
            $scope.operRuleList[index].innerRuleIndex = $scope.operRuleList[index].innerRuleIndex + (curr_length - prev_length);
            $scope.operRuleList[index].outerRuleIndex = $scope.operRuleList[index].outerRuleIndex + (curr_length - prev_length);
          }
        };
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

      // innerRuleIndex : This is the rule index used for the metrics.
      // outerRuleIndex : This is the rule index used for the alert rule condition.
      // To add a rule
      $scope.addNewRule = function (index) {
        // When a new rule is added, we need to calculate the
        // inner and outer rule index for the new rule.
        let innerRuleIndex = 1;
        innerRuleIndex = $scope.operRuleList[$scope.operRuleList.length - 1].outerRuleIndex + 1;

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
          'selectedMetric': defaultValue,
          'vuMetricsBased': false,
        };
        $scope.ruleList.push(newRuleObj);
        // Here both inner rule index and outer rule index will be same.
        // When a new rule is added, it should be a normal rule not BMV rule.
        // For ex; if the previous rule contains 3 metrics it should be R1-R3.
        // So both inner and outer rule index of the new rule should start from R4.
        $scope.operRuleList.push({ 'indexFields': [],
          'innerRuleIndex': innerRuleIndex,
          'outerRuleIndex': innerRuleIndex,
          'metrics': [],
          'metricIsSelected': false,
          'sumOrAverageIsSelected': false,
          'countIsSelected': false,
          'targetFieldInvisibility': false,
          'allowStringInCompareValue': false,
          'selectedField': undefined,
          'groupByField': [{ data: '' }],
          'additionalField': [{ data: '' }],
        });
      };

      // To delete a rule
      $scope.removeRule = function ($index) {
        // When an existing rule is deleted adjust
        // both inner and outer rule index.
        var noOfMetrics;
        // If rule is based on BMV then get the metrics length
        if ($scope.operRuleList[$index].metrics.length > 0) {
          noOfMetrics = $scope.operRuleList[$index].metrics.length;
        }
        // else 1 as it's just a normal rule without BMV.
        else {
          noOfMetrics = 1;
        }
        // Go though each alert rule and adjust both metric and rule index.
        for (let index = $index + 1; index < $scope.ruleList.length; index++) {
          $scope.operRuleList[index].innerRuleIndex = $scope.operRuleList[index].innerRuleIndex - noOfMetrics;
          $scope.operRuleList[index].outerRuleIndex = $scope.operRuleList[index].outerRuleIndex - noOfMetrics;
        };

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
          $scope.selectEmailGroupList = [];
          $scope.alertEmailBody = '';
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
