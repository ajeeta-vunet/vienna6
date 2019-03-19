import _ from 'lodash';
import 'plugins/kibana/alert/saved_alert/saved_alerts';
import 'ui/vis/editors/default/sidebar';
import 'ui/collapsible_sidebar';
import 'ui/share';
import 'ui/query_bar';
import 'plugins/kibana/alert/filters/alert_filters.js';
import 'plugins/kibana/alert/styles/main.less';
import chrome from 'ui/chrome';
import angular from 'angular';
import { Notifier } from 'ui/notify/notifier';
import { DocTitleProvider } from 'ui/doc_title';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import alertTemplate from 'plugins/kibana/alert/alert.html';
import alertLogsTemplate from 'plugins/kibana/alert/alert_logs.html';
import AlertLogsCtrl from 'plugins/kibana/alert/alert_logs.controller.js';
import { AlertConstants, createAlertEditUrl } from './alert_constants';
import { logUserOperation } from 'plugins/kibana/log_user_operation';
import { updateVunetObjectOperation } from 'ui/utils/vunet_object_operation';
import { getTenantEmailGroups } from 'ui/utils/vunet_tenant_email_groups';
import { SavedObjectNotFound } from 'ui/errors';
import previewMetricTemplate from './preview_metric.html';
import previewMetricCtrl from './preview_metric.controller.js';
import utils from '../../../console/public/src/utils';

const Promise = require('bluebird');

const url = chrome.getUrlBase();

const defaultValue = {
  id: '',
  title: '',
};

uiRoutes
  .when(AlertConstants.CREATE_PATH, {
    template: alertTemplate,
    resolve: {
      indexPatternIds: function (Private) {
        return Promise.resolve(utils.getSavedObject('index-pattern', ['title'], 10000, Private));
      },
      vuMetricList: function (Private) {
        return Promise.resolve(utils.getVisualizationObjectByType('visualization', [], 10000, 'business_metric', Private));
      },
      alertcfg: function (savedAlerts) {
        return savedAlerts.get();
      },
      // This flag indicates if new alert is being
      // created.
      isNewAlert: function () {
        return true;
      },
      // Fetch all the email groups for the tenants
      email_groups: function ($http, chrome) {
        return getTenantEmailGroups($http, chrome);
      },
    }
  })
  .when(createAlertEditUrl(':id'), {
    template: alertTemplate,
    resolve: {
      indexPatternIds: function (Private) {
        return Promise.resolve(utils.getSavedObject('index-pattern', ['title'], 10000, Private));
      },
      vuMetricList: function (Private) {
        return Promise.resolve(utils.getVisualizationObjectByType('visualization', [], 10000, 'business_metric', Private));
      },
      alertcfg: function (savedAlerts, $route, courier) {
        return savedAlerts.get($route.current.params.id)
          .catch(courier.redirectWhenMissing({
            'alert': AlertConstants.LANDING_PAGE_PATH
          }));
      },
      isNewAlert: function () {
        return false;
      },
      // Fetch all the email groups for the tenants
      email_groups: function ($http, chrome) {
        return getTenantEmailGroups($http, chrome);
      },
    }
  });
uiModules
  .get('app/alert', [
    'kibana/notify',
    'kibana/courier'
  ])
  .directive('alertApp', function () {
    return {
      restrict: 'E',
      controllerAs: 'alertApp',
      controller: alertAppEditor,
    };
  });

function alertAppEditor($scope,
  $rootScope,
  $timeout,
  courier,
  $route,
  $routeParams,
  $location,
  Private,
  AppState,
  savedAlerts,
  $filter,
  $http,
  kbnUrl,
  savedVisualizations,
  $modal) {
  const notify = new Notifier({
    location: 'Alert'
  });

  // When the preview button is clicked, this will
  // show all the metrics for the corresponding BMV
  // in a modal pop-up.
  // metrics - All the metrics for the selected BMV.
  $scope.previewMetric = function (metrics) {
    $modal.open({
      animation: true,
      template: previewMetricTemplate,
      controller: previewMetricCtrl,
      windowClass: 'alertBmvPreviewModal',
      resolve: {
        metricData: function () {
          return metrics;
        }
      }
    });
  };

  $scope.vuMetricList = $route.current.locals.vuMetricList;
  const alertcfg = $scope.alertcfg = $route.current.locals.alertcfg;
  let isNewAlert = $route.current.locals.isNewAlert;
  logUserOperation($http, 'GET', 'alert', alertcfg.title, alertcfg.id);
  const loadedAlertId = $route.current.locals.loadedAlertId;

  $scope.indexPatternList = $route.current.locals.indexPatternIds;

  $scope.selectEmailGroupList = [];

  $scope.allEmailGroups = $route.current.locals.email_groups.attributes;

  // Set the landing page for alerts section
  $scope.landingPageUrl = () => `#${AlertConstants.LANDING_PAGE_PATH}`;

  // Populate allowedRoles from alertcfg
  const allowedRoles = alertcfg.allowedRolesJSON ? JSON.parse(alertcfg.allowedRolesJSON) : [];

  let userRoleCanModify = false;
  // Get the RBAC stuff here...
  // For an admin used, we always show modify permissions during save..
  // const userRoleCanModify = false;
  if (chrome.isCurrentUserAdmin()) {
    userRoleCanModify = true;
  } else {
    // Set a flag whether the current user's role can modify this object
    userRoleCanModify = chrome.canCurrentUserModifyPermissions(allowedRoles);
  }

  // If user can modify the existing object or is allowed to create an object
  if (userRoleCanModify && chrome.canCurrentUserCreateObject()) {
    $scope.topNavMenu = [{
      key: 'save',
      description: 'Save Alert',
      template: require('plugins/kibana/alert/panels/save.html'),
      testId: 'alertSaveButton',
      disableButton() {
        return Boolean(!$scope.alertcfgForm.$valid);
      },
    }];
  } else {
    $scope.topNavMenu = [];
  }

  // Let us get the ruleList from alertCfg, it will be empty if its a new
  // alert
  let ruleList = [];
  if (alertcfg.ruleList) {
    ruleList = JSON.parse(alertcfg.ruleList);
  }

  if (ruleList.length) {
    // prepare $scope.ruleList and $scope.operRuleList iterating over the object
    // created from backend and populate these fields in the front end.
    $scope.ruleList = [];
    $scope.operRuleList = [];
    const defaultRuleObj = {
      'selectedIndex': '',
      'ruleType': '',
      'ruleNameAlias': '',
      'selectedField': '',
      'compareType': '',
      'compareValue': 0,
      'compareValueStr': '',
      'ruleTypeDuration': 5,
      'informationCollector': false,
      'ruleTypeDurationType': 'minute',
      'groupByField': [],
      'additionalField': [],
      'alertFilter': '',
      'enableComparisionFields': false,
      'metricAlias': '',
    };

    const defaultOperRuleObj = {
      'outerRuleIndex': 1,
      'innerRuleIndex': 1,
      'metrics': [],
      'indexFields': [],
      'metricIsSelected': false,
      'sumOrAverageIsSelected': false,
      'countIsSelected': false,
      'targetFieldInvisibility': false,
      'allowStringInCompareValue': false,
      'selectedField': undefined,
      'groupByField': [],
      'additionalField': [],
    };
    // Iterate on rule list and for each rule populate the operRuleList..
    Promise.map(ruleList, function (alertcfgRule) {
      //The following code takes care of populating the 'groupByField'
      // and 'selectedField' form when any alert is loaded
      // we are using _.clonedeep so that the groupbyField under
      // newOperRuleObj is not updated in each iteration.
      const newRuleObj = _.cloneDeep(defaultRuleObj);
      const newOperRuleObj = _.cloneDeep(defaultOperRuleObj);

      // These conditions are added here so as to handle load operations of
      // alert. Any changes added here needs to be added under details.js too
      if (alertcfgRule.ruleType === 'count') {
        newOperRuleObj.metricIsSelected = true;
        newOperRuleObj.targetFieldInvisibility = true;
        newOperRuleObj.countIsSelected = true;
        alertcfgRule.selectedField = '';
      } else if (alertcfgRule.ruleType === 'sum' ||
        alertcfgRule.ruleType === 'average' ||
        alertcfgRule.ruleType === 'min' ||
        alertcfgRule.ruleType === 'max') {
        newOperRuleObj.metricIsSelected = true;
        newOperRuleObj.sumOrAverageIsSelected = true;
      } else if (alertcfgRule.ruleType === 'unique_values') {
        newOperRuleObj.metricIsSelected = true;
      } else if (alertcfgRule.ruleType === 'state_change' || alertcfgRule.ruleType === 'latest_value') {
        newOperRuleObj.allowStringInCompareValue = true;
        newOperRuleObj.metricIsSelected = true;
        alertcfgRule.ruleTypeDuration = 5;
        alertcfgRule.ruleTypeDurationType = 'minute';
      }
      else if (alertcfgRule.vuMetricsBased === true) {
        newOperRuleObj.metricIsSelected = true;
      }

      newRuleObj.ruleType = alertcfgRule.ruleType;
      newRuleObj.ruleNameAlias = alertcfgRule.ruleNameAlias;
      newRuleObj.informationCollector = alertcfgRule.informationCollector;

      // Populate the selectedIndex object reference based on what is stored
      // in alertcfg
      _.each($scope.indexPatternList, function (indexPattern) {
        if (indexPattern.id === alertcfgRule.selectedIndex.id) {
          newRuleObj.selectedIndex = indexPattern;
          return false;
        }
      });

      newRuleObj.enableComparisionFields = alertcfgRule.enableComparisionFields;
      newRuleObj.metricAlias = alertcfgRule.metricAlias;
      newRuleObj.compareType = alertcfgRule.compareType;
      newRuleObj.compareValue = alertcfgRule.compareValue;
      newRuleObj.compareValueStr = alertcfgRule.compareValueStr;
      newRuleObj.ruleTypeDuration = alertcfgRule.ruleTypeDuration;
      newRuleObj.ruleTypeDurationType = alertcfgRule.ruleTypeDurationType;
      newRuleObj.alertFilter = alertcfgRule.alertFilter;

      // Insert this into the ruleList.. We do this here so that rules are inserted
      // into the rule and operRule list in order..
      $scope.ruleList.push(newRuleObj);
      $scope.operRuleList.push(newOperRuleObj);

      // We need to wait for indexPattern if we use normal rule..
      if (alertcfgRule.selectedIndex.id !== '') {

        // We return a promise here..
        return courier.indexPatterns.get(alertcfgRule.selectedIndex.id).then(function (currentIndex) {
          let fields = currentIndex.fields.raw;
          fields = $filter('filter')(fields, { aggregatable: true });
          newOperRuleObj.indexFields = fields.slice(0);
          _.each(newOperRuleObj.indexFields, function (field) {
            if (alertcfgRule.selectedField) {
              if (alertcfgRule.selectedField === field.name) {
                newOperRuleObj.selectedField = field;
                newRuleObj.selectedMetric = defaultValue;
                newOperRuleObj.metrics = [];
                newRuleObj.vuMetricsBased = alertcfgRule.vuMetricsBased;
              }
            }
          });

          // The indexfields is moved as a inner loop to maintain
          // the order of the fields under groupByField list.
          if (alertcfgRule.groupByField.length) {
            _.each(alertcfgRule.groupByField, function (grpByField) {
              _.each(newOperRuleObj.indexFields, function (field) {
                if (grpByField === field.name) {
                  const dataObj = { data: field };
                  newOperRuleObj.groupByField.push(dataObj);
                }
              });
            });
          }
          // Adding the default object data to groupByField under
          // newOperRuleObj to display an empty selectbox in the
          // front end when no groupby field is selected for this rule.
          else {
            newOperRuleObj.groupByField.push({ data: '' });
          }

          // The indexfields is moved as a inner loop to maintain
          // the order of the fields under additional field list.
          if (alertcfgRule.additionalField && alertcfgRule.additionalField.length) {
            _.each(alertcfgRule.additionalField, function (additionalField) {
              _.each(newOperRuleObj.indexFields, function (field) {
                if (additionalField === field.name) {
                  const dataObj = { data: field };
                  newOperRuleObj.additionalField.push(dataObj);
                }
              });
            });
          }
          // Adding the default object data to additionalField under
          // newOperRuleObj to display an empty selectbox in the
          // front end when no additional field is selected for this rule.
          else {
            newOperRuleObj.additionalField.push({ data: '' });
          }
          // Using return will not help here ,
          // As _each will continue to execute without breaking at any point
        });
      } else {
        // We need to wait for Business metric if alert subrule uses a BM Vis..
        // Check whether BMV exists. This check needs for existing alerts to
        // ensure that backward compatibility is working fine.
        if (alertcfgRule.selectedMetric !== undefined &&
            alertcfgRule.selectedMetric.id !== '') {
          newRuleObj.selectedIndex = defaultValue;
          newRuleObj.vuMetricsBased = alertcfgRule.vuMetricsBased;
          newRuleObj.selectedMetric = alertcfgRule.selectedMetric;

          // We return a promise here..
          return savedVisualizations.get(
            alertcfgRule.selectedMetric.id).then(function (savedVisualization) {
            // Go thourgh each BMV and find the BMV which is configured in the alert.
            _.each($scope.vuMetricList, function (vuMetric) {
              if (vuMetric.id === alertcfgRule.selectedMetric.id) {
                newRuleObj.selectedMetric = vuMetric;
              }
            });
            // Find the BMV used in the alert which will be used for preview.
            newOperRuleObj.vis = savedVisualization;
            // After finding the BMV, get all the metrics for that BMV which
            // will be used for tooltip.
            newOperRuleObj.metrics = savedVisualization.visState.params.metrics;
          })
            .catch((error) => {
              if (error instanceof SavedObjectNotFound) {
                notify.error(
                  'Problem in loading this alert... The BMV ' + alertcfgRule.selectedMetric.title +
                ' used in the alert rule "' + newRuleObj.ruleNameAlias + '" has been already deleted.' +
                'Please re-configure this alert');
              } else {
              // Display the error message to the user.
                notify.error(error);
                throw error;
              }
            });
        } else {
          // Not sure what kind of configuration this is..
          return Promise.resolve(false);
        }
      }
    }).then(function () {
      // Once all promises are resolved.. we resolve the rule numbers..
      updateVisMetricForAlertRule();
    });
    $scope.severity = alertcfg.severity;
    $scope.summary = alertcfg.summary;
    $scope.description = alertcfg.description;
    $scope.enableThrottle = alertcfg.enableThrottle;
    $scope.throttleDurationType = alertcfg.throttleDurationType;
    $scope.throttleDuration = alertcfg.throttleDuration;
    $scope.alertByTicket = alertcfg.alertByTicket;
    $scope.alertByEmail = alertcfg.alertByEmail;
    $scope.alertEmailId = alertcfg.alertEmailId;
    if (alertcfg.alertEmailGroup !== '') {
      // Here the alertEmailGroup field will contain only name as following.
      // alertEmailGroup = admin, dba, network
      // To populate in the multiselect directive the format should be as following
      // [{"name":"admin", "name":"dba"}]
      // So we need to build a dictionary from the input
      const emailGroups = alertcfg.alertEmailGroup.split(',');
      for (let index = 0; index < emailGroups.length; index++) {
        $scope.selectEmailGroupList.push({ name: emailGroups[index] });
      }
    }
    $scope.advancedConfig = alertcfg.advancedConfiguration;
    $scope.enableRunBookAutomation = alertcfg.enable_runbook_automation;
    $scope.runBookScript = alertcfg.runbook_script;
    $scope.enableAnsiblePlaybook = alertcfg.enable_ansible_playbook;
    $scope.ansiblePlaybookName = alertcfg.ansible_playbook_name;
    $scope.ansiblePlaybookOptions = alertcfg.ansible_playbook_options;
    $scope.activeStartTime = alertcfg.activeStartTime;
    $scope.activeEndTime = alertcfg.activeEndTime;
    $scope.enableAlert = alertcfg.enableAlert;
    $scope.activeAlertCheck = alertcfg.activeAlertCheck;
    $scope.weekdays = JSON.parse(alertcfg.weekdays);
    $scope.ruleLevelThreshold = alertcfg.ruleLevelThreshold;
    $scope.evalCriteria = JSON.parse(alertcfg.evalCriteria);
    $scope.evalCriteriaAlias = alertcfg.evalCriteriaAlias;
    $scope.advancedConfig = alertcfg.advancedConfiguration;

    $scope.$on('$destroy', alertcfg.destroy);

    updateVisMetricForAlertRule();

  } else {
    $scope.ruleList = [{
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
      'vuMetricsBased': false,
      'selectedMetric': defaultValue,
    }];
    $scope.operRuleList = [{
      'outerRuleIndex': 1,
      'innerRuleIndex': 1,
      'metrics': [],
      'indexFields': [],
      'metricIsSelected': true,
      'sumOrAverageIsSelected': false,
      'countIsSelected': false,
      'targetFieldInvisibility': false,
      'allowStringInCompareValue': false,
      'selectedField': undefined,
      'groupByField': [{ data: '' }],
      'additionalField': [{ data: '' }],
    }];
    // set the enable alert checkbox to true by default
    $scope.enableAlert = true;

    // Setting the default time for alert active time
    $scope.activeStartTime = '00:00:00';
    $scope.activeEndTime = '23:59:59';

    $scope.weekdays = [
      { name: 'Monday', selected: true },
      { name: 'Tuesday', selected: true },
      { name: 'Wednesday', selected: true },
      { name: 'Thursday', selected: true },
      { name: 'Friday', selected: true },
      { name: 'Saturday', selected: true },
      { name: 'Sunday', selected: true },
    ];

    // Initialising the evalCriteria object for a new alert.
    $scope.evalCriteria = {};
  }

  // Before this step, both ruleList and operruleList are already available.
  // Go through each alert rule and update the visualization, metrics,
  // inner rule and outer rule index in the operRuleList.
  function updateVisMetricForAlertRule() {
    let innerRuleIndex = 1;
    for (let index = 0; index < $scope.operRuleList.length; index++) {
      if ($scope.operRuleList[index].metrics.length > 0) {
        // If the previous BMV based alert rule contains 4 metrics then it
        // should be R1-R4. The current BMV based alert should start from R5.
        // If the current rule contains 3 metrics then it should be R5-R7. If
        // we don't reduce by 1 then it will become R15-R8(R5+3=-R8) which is
        // wrong.
        $scope.operRuleList[index].innerRuleIndex = innerRuleIndex;
        $scope.operRuleList[index].outerRuleIndex =
          innerRuleIndex + $scope.operRuleList[index].metrics.length - 1;
        innerRuleIndex = $scope.operRuleList[index].outerRuleIndex + 1;
      } else {
        $scope.operRuleList[index].innerRuleIndex = innerRuleIndex;
        $scope.operRuleList[index].outerRuleIndex = innerRuleIndex;
        innerRuleIndex = $scope.operRuleList[index].innerRuleIndex + 1;
      }
    }
    // For some reasons, updating the scope variables are not rendering the
    // view.. so we are using this to force a re-render
    $scope.$evalAsync();
  }




  // This function is to validate if all the information collector
  // rules are placed at the end.
  function isInformationCollectorNotAtTheEnd() {
    let infoCollectorRuleExists = false;
    for (let index = 0; index < $scope.ruleList.length; index = index + 1) {
      const rule = $scope.ruleList[index];
      if (rule.informationCollector === true) {
        infoCollectorRuleExists = true;
      }
      else if (infoCollectorRuleExists === true) {
        return true;
      }
    }
    return false;
  }

  const stateDefaults = {
    title: alertcfg.title,
    query: { 'query': '*', language: 'lucene' }
  };

  const $state = $scope.state = new AppState(stateDefaults);

  // Dictionary for debug levels.
  const setDebugListDict = {
    '0': 'Error',
    '1': 'Warning',
    '2': 'Information',
    '3': 'Debug',
    '-1': 'Disable'
  };

  // API call to set the debug level.
  $scope.setDebugLevel = function () {
    $http.post(url + '/alertrule/' + alertcfg.title + '/?debugging_level=' + $scope.setDebug, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(function () {
      $scope.successfullyset = true;
      $scope.failedtoset = false;
      $scope.debugVal = setDebugListDict[$scope.setDebug];
    }).catch(function (response) {
      $scope.failedmsg = response.data['error-string'];
      $scope.successfullyset = false;
      $scope.failedtoset = true;
    });
    // Hide the message that comes on setting debug level
    // after 3 seconds
    $timeout(function () {
      $scope.successfullyset = false;
      $scope.failedtoset = false;
    }, 3000);
  };

  // API call to execute alert
  $scope.executeLogs = function () {
    $http.post(url + '/alertrule/' + alertcfg.title + '/?execute_now=True&from=time&to=time', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(function () {
      $scope.successexecuteLogs = true;
    }).catch(function () {
      $scope.failureexecuteLogs = true;
      $scope.errmessage = 'Failed to initiate test execution of alert rule';
    });
    // Hide the message that comes on clicking execute
    // button after 3 seconds
    $timeout(() => {
      $scope.successexecuteLogs = false;
      $scope.failureexecuteLogs = false;
    }, 3000);
  };

  // API call to execute alert for a specific time
  $scope.executeSpecificLogs = function (fromtime, totime) {
    $scope.fromepoctime = Math.round(new Date(fromtime).getTime() / 1000);
    $scope.toepoctime = Math.round(new Date(totime).getTime() / 1000);
    $scope.goShowDate();
    $http.post(url + '/alertrule/' + alertcfg.title + '/?from=' + $scope.fromepoctime + '&to=' + $scope.toepoctime, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(function () {
      $scope.successexecuteSpecificLogs = true;
      $scope.failureexecuteSpecificLogs = false;

    }).catch(function (response) {
      $scope.successexecuteSpecificLogs = false;
      $scope.failureexecuteSpecificLogs = true;
      if (response.data['error-string']) {
        $scope.errmessagespecificlogs = response.data['error-string'];
      } else {
        $scope.errmessagespecificlogs = ' Failed to execute alert rule';
      }

    });
    // Hide the message that comes on clicking execute
    // button after 3 seconds
    $timeout(() => {
      $scope.successexecuteSpecificLogs = false;
      $scope.failureexecuteSpecificLogs = false;
    }, 3000);
  };

  // setting the default value for showDebug .
  $scope.showDebug = false;

  // Function to hide and show the section.
  $scope.showDebugs = function () {
    $scope.showDebug = !$scope.showDebug;
  };

  // API call to show debug level
  $scope.showDebugLogs = function () {
    const modalInstance = $modal.open({
      animation: true,
      template: alertLogsTemplate,
      controller: AlertLogsCtrl,
      windowClass: 'log-modal',
      resolve: {
        alertLogData: function ($http) {
          return $http.get(url + '/alertrule/' + alertcfg.title + '/?get_evaluation_logs=True', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }).then(function (data) {
            return data.data;
          }).catch(function () {
            return 'Error fetching log data';
          });
        }
      }
    });
    modalInstance.result.then(function () {
    }, function () {
      // Written this so that unhandled rejection error doesn't appear.
    });


  };

  //calling the save function to save the alert details filled in the alert cfg form
  $scope.save = function () {
    $state.title = alertcfg.title;

    // On click of save button clear set debug level drop down
    $scope.setDebug = '';

    const infoCollectorFlag = isInformationCollectorNotAtTheEnd();
    if (infoCollectorFlag === true) {
      alert('Please configure the information collection rules at the end.');
      return;
    }

    $state.save();
    alertcfg.allowedRolesJSON = angular.toJson($scope.opts.allowedRoles);
    /*eslint-disable */
    Number.prototype.padLeft = function (base, chr) {
      const len = (String(base || 10).length - String(this).length) + 1;
      return len > 0 ? new Array(len).join(chr || '0') + this : this;
    };
    /*eslint-enable */
    const dateObj = new Date();
    const month = (dateObj.getMonth() + 1).padLeft(); //months from 1-12
    const day = dateObj.getDate().padLeft();
    const year = dateObj.getFullYear().padLeft();
    const hour = dateObj.getHours().padLeft();
    const minute = dateObj.getMinutes().padLeft();
    const second = dateObj.getSeconds().padLeft();
    const alertTimestamp = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    alertcfg.lastModifiedTime = alertTimestamp;
    alertcfg.severity = $scope.severity;
    alertcfg.summary = $scope.summary;
    alertcfg.description = $scope.description;
    alertcfg.enableThrottle = $scope.enableThrottle;
    alertcfg.throttleDurationType = $scope.throttleDurationType;
    alertcfg.throttleDuration = $scope.throttleDuration;
    alertcfg.alertByTicket = $scope.alertByTicket;
    alertcfg.alertByEmail = $scope.alertByEmail;
    alertcfg.alertEmailId = $scope.alertEmailId;
    alertcfg.alertEmailGroup = utils.getValueForDisplay($scope.selectEmailGroupList);
    alertcfg.enable_runbook_automation = $scope.enableRunBookAutomation;
    alertcfg.runbook_script = $scope.runBookScript;
    alertcfg.enable_ansible_playbook = $scope.enableAnsiblePlaybook;
    alertcfg.ansible_playbook_name = $scope.ansiblePlaybookName;
    alertcfg.ansible_playbook_options = $scope.ansiblePlaybookOptions;
    alertcfg.ruleLevelThreshold = $scope.ruleLevelThreshold;
    alertcfg.evalCriteria = angular.toJson($scope.evalCriteria);
    alertcfg.evalCriteriaAlias = $scope.evalCriteriaAlias;
    _.each($scope.operRuleList, function (operRule, index) {
      if (operRule.selectedField) {
        $scope.ruleList[index].selectedField = operRule.selectedField.displayName;
      } else {
        $scope.ruleList[index].selectedField = '';
      }
      // setting the groupByField of this rule to empty
      // and fetching the group by fields set in the operRuleList
      $scope.ruleList[index].groupByField = [];
      _.each(operRule.groupByField, function (field) {
        if (operRule.groupByField.length === 1 && field.data === null) {
          operRule.groupByField = [{ data: '' }];
        } else if (field.data !== '' && field.data !== null) {
          $scope.ruleList[index].groupByField.push(field.data.displayName);
        }
      });

      // setting the additionalField of this rule to empty
      // and fetching the additional fields set in the operRuleList
      $scope.ruleList[index].additionalField = [];
      _.each(operRule.additionalField, function (field) {
        if (operRule.additionalField.length === 1 && field.data === null) {
          operRule.additionalField = [{ data: '' }];
        } else if (field.data !== '' && field.data !== null) {
          $scope.ruleList[index].additionalField.push(field.data.displayName);
        }
      });
    });

    alertcfg.ruleList = angular.toJson($scope.ruleList);
    alertcfg.activeStartTime = $scope.activeStartTime;
    alertcfg.activeEndTime = $scope.activeEndTime;
    alertcfg.enableAlert = $scope.enableAlert;
    alertcfg.activeAlertCheck = $scope.activeAlertCheck;
    alertcfg.weekdays = angular.toJson($scope.weekdays);
    alertcfg.advancedConfiguration = $scope.advancedConfig;

    // if an alert is loaded and saved as another
    // alert, It is a new alert. Hence set the flag to true.
    isNewAlert = false;
    if (loadedAlertId !== alertcfg.id) {
      isNewAlert = true;
    }

    alertcfg.save(isNewAlert).then(function (id) {
      $scope.kbnTopNav.close('save');
      if (id) {

        alertcfg.id = id;
        updateVunetObjectOperation([alertcfg], 'alert', $http, 'modify', chrome);
        if (alertcfg.id !== $routeParams.id) {
          kbnUrl.change('/alert/{{id}}', { id: alertcfg.id });
        }
        logUserOperation($http, 'POST', 'alert', alertcfg.title, alertcfg.id);
      }
    })
      .catch(notify.fatal);
  };

  function init() {
    const docTitle = Private(DocTitleProvider);
    if (alertcfg.id) {
      docTitle.change(alertcfg.title);
    }
    $scope.$emit('application.load');
  }

  $scope.getAlertTitle = function () {
    return alertcfg.title;
  };

  const currentUser = chrome.getCurrentUser();
  const owner = { 'name': currentUser[0], 'permission': currentUser[1], 'role': currentUser[2] };

  // Setup configurable values for config directive, after objects are initialized
  $scope.opts = {
    alertcfg: alertcfg,
    allowedRoles: allowedRoles,
    userRoleCanModify: userRoleCanModify,
    doSave: $scope.save,
    owner: owner
  };

  // Adds selected email group to the list
  $scope.addEmailGroup = function (item) {
    // Here The item dict will contain both recipientIndex and item as following.
    // item = item {"recipientIndex":0,"name":"admin"}
    // recipientIndex is being used in the report as there will be one or more recipients list
    // In Alert the recipientIndex will be always 0 and not used.
    // To populate in the multiselect directive the format should be as following
    // item = {"name":"admin"}
    $scope.selectEmailGroupList.push({ name: item.name });
  };

  // Removes the selected email group from the list
  $scope.removeEmailGroup = function (item) {
    // Here the item dict will contain both recipientIndex and index as following
    // item = item {"recipientIndex":0,"index":1}
    // recipientIndex is being used in the report as there will be one or more recipients list
    // In Alert the recipientIndex will be always 0 and not used.
    // index is the index of the selected item in the selectEmailGroupList
    $scope.selectEmailGroupList.splice(item.index, 1);
  };

  init();
}
