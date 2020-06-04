import 'plugins/kibana/alert/saved_alert/saved_alerts';
import 'ui/vis/editors/default/sidebar';
import 'ui/collapsible_sidebar';
import 'ui/share';
import 'ui/query_bar';
import 'plugins/kibana/alert/filters/alert_filters.js';
import 'plugins/kibana/alert/styles/main.less';

import _ from 'lodash';
import alertTemplate from 'plugins/kibana/alert/alert.html';
import alertLogsTemplate from 'plugins/kibana/alert/alert_logs.html';
import AlertLogsCtrl from 'plugins/kibana/alert/alert_logs.controller.js';
import angular from 'angular';
import chrome from 'ui/chrome';
import uiRoutes from 'ui/routes';
import previewMetricTemplate from './preview_metric.html';
import previewMetricCtrl from './preview_metric.controller.js';

import { AlertDetails } from './components/alert_details.js';
import { AlertConstants, createAlertEditUrl, NEW_RULE_LIST_ITEM } from './alert_constants';
import { DocTitleProvider } from 'ui/doc_title';
import { Notifier } from 'ui/notify/notifier';
import { uiModules } from 'ui/modules';
import { logUserOperation } from 'plugins/kibana/log_user_operation';
import { updateVunetObjectOperation } from 'ui/utils/vunet_object_operation';
import { getTenantEmailGroups } from 'ui/utils/vunet_tenant_email_groups';
import { getSavedObject, getVisualizationObjectByType } from 'ui/utils/kibana_object.js';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

const Promise = require('bluebird');
const app = uiModules.get('app/alert');

const url = chrome.getUrlBase();

// Define the alertDetails react component as a angular directive
app.directive('alertDetails', (reactDirective) => {
  return reactDirective(AlertDetails);
});

uiRoutes
  .when(AlertConstants.CREATE_PATH, {
    template: alertTemplate,
    resolve: {
      indexPatternIds: function (Private) {
        return Promise.resolve(getSavedObject('index-pattern', ['title'], 10000, Private));
      },
      vuMetricList: function (Private) {
        return Promise.resolve(getVisualizationObjectByType('visualization', [], 10000, 'business_metric', Private));
      },
      reports: function (Private) {
        return Promise.resolve(getSavedObject('report', ['title', 'allowedRolesJSON'], 10000, Private));
      },
      alertcfg: function (savedAlerts) {
        return savedAlerts.get();
      },
      // This flag indicates if new alert is being created.
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
        return Promise.resolve(getSavedObject('index-pattern', ['title'], 10000, Private));
      },
      vuMetricList: function (Private) {
        return Promise.resolve(getVisualizationObjectByType('visualization', [], 10000, 'business_metric', Private));
      },
      reports: function (Private) {
        return Promise.resolve(getSavedObject('report', ['title', 'allowedRolesJSON'], 10000, Private));
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
  $timeout,
  $route,
  $routeParams,
  Private,
  AppState,
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
  $scope.previewMetric = function (metricId) {
    savedVisualizations.get(metricId).then(function (savedVisualization) {
      $modal.open({
        animation: true,
        template: previewMetricTemplate,
        controller: previewMetricCtrl,
        windowClass: 'alertBmvPreviewModal',
        resolve: {
          metricData: function () {
            return savedVisualization;
          }
        }
      });
    });
  };

  // Get the list of metrics for a BMV
  $scope.getMetricsForBmv = (bmvId) => {
    return savedVisualizations.get(bmvId).then(function (savedVisualization) {
      return savedVisualization.visState.params.metrics;
    });
  };

  $scope.vuMetricList = $route.current.locals.vuMetricList;
  const alertcfg = $scope.alertcfg = $route.current.locals.alertcfg;

  let isNewAlert = $scope.isNewAlert = $route.current.locals.isNewAlert;
  logUserOperation($http, 'GET', 'alert', alertcfg.title, alertcfg.id);
  const loadedAlertId = $route.current.locals.loadedAlertId;

  $scope.indexPatternList = $route.current.locals.indexPatternIds;
  $scope.allReportTitles = $route.current.locals.reports;

  // The reusable searchable multiselection supports the following
  // format [{"id":"report-1","key":"report 1", "value":"report 1"}] with keys "key" and "value".
  // So we need to add the keys  "key" and "value".
  $scope.allReportTitles = $scope.allReportTitles.map(function (report) {
    return { 'id': report.id, 'key': report.title, 'value': report.title };
  });

  // get report object from 'allReportTitles' using reportName
  const getReportObject = (reportName) => {
    const reportObject = {};
    _.forEach($scope.allReportTitles, (allReport) => {
      if (allReport.value === reportName) {
        reportObject.id = allReport.id;
        reportObject.name = allReport.value;

        // when a match is found we exit the loop
        return false;
      }
    });
    return reportObject;
  };

  // populate list of email groups
  const allEmailGroups = $route.current.locals.email_groups.attributes;
  allEmailGroups.forEach(emailGroup => {
    emailGroup.key = emailGroup.value = emailGroup.name;
  });
  $scope.allEmailGroups = allEmailGroups;

  // Populate allowedRoles from alertcfg
  const allowedRoles = alertcfg.allowedRolesJSON ? JSON.parse(alertcfg.allowedRolesJSON) : [];

  let userRoleCanModify = false;

  // Set a flag whether the current user's role can modify this object
  userRoleCanModify = chrome.canCurrentUserModifyPermissions(allowedRoles);
  // If user can modify the existing object or is allowed to create an object
  $scope.canUserModifyAlert = userRoleCanModify && chrome.canManageObject();

  // Let us get the ruleList from alertCfg, it will be empty if its a new alert
  let ruleList = [];
  if (alertcfg.ruleList) {
    ruleList = JSON.parse(alertcfg.ruleList);
  }

  // it is an existing alert
  if (ruleList.length) {
    if (alertcfg.alertReportList !== '') {
      const reportList = JSON.parse(alertcfg.alertReportList);
      // This will decide whether the report used in this alert is still
      // available or not. Because the same can be already deleted or
      // somebody might have changed the permission of the report.
      let reportExist;
      // Go though each report configured in this alert
      _.forEach(reportList, (report) => {
        // First set the flag to false for every report we fetch
        reportExist = false;
        // $scope.allReportTitles will have all the reports available
        // Check whether the report still exists in the system
        _.forEach($scope.allReportTitles, (allReport) => {
          // If report exists
          if (report.id === allReport.id) {
            reportExist = true;
            return false;
          }
        });

        // if report does not exists, show the not available message to the user.
        if (!reportExist) {
          notify.error('Problem in loading this alert. The report "' + report.id +
            '" used in this alert is not available anymore, please reconfigure this alert');
        }
      });
    }

    // This will decide whether the bmv used in this alert is still
    // available or not. Because the same can be already deleted or
    // somebody might have changed the permission of the bmv.
    let bmvExist;
    // Go though each ruleList configured in this alert, and get the bmv configured
    _.forEach(ruleList, (ruleItem) => {
      // First set the flag to false for every bmv we fetch
      bmvExist = false;
      // $scope.vuMetricList will have all the bmv available
      // Check whether the bmv still exists in the system
      _.forEach($scope.vuMetricList, (allBmv) => {
        // If bmv exists
        if (ruleItem.selectedMetric.id === allBmv.id) {
          bmvExist = true;
          return false;
        }
      });
      // if bmv does not exists, show the not available message to the user.
      if (!bmvExist) {
        notify.error('Problem in loading this alert. The vuMetric visualization "' + ruleItem.selectedMetric.id +
          '" used in this alert is not available anymore, please reconfigure this alert');
      }
    });

    $scope.$on('$destroy', alertcfg.destroy);
  }
  // it is a new alert.
  // lets update some default values in alertcfg
  else {
    ruleList.push(_.cloneDeep(NEW_RULE_LIST_ITEM));
    alertcfg.ruleList = angular.toJson(ruleList);
  }

  // This function is to validate if all the information collector
  // rules are placed at the end.
  function isInformationCollectorNotAtTheEnd(ruleList) {
    let infoCollectorRuleExists = false;
    for (let i = 0; i < ruleList.length; i++) {
      const rule = ruleList[i];
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
      notify.info('Successfully triggered the alert execution');
    }).catch(function () {
      notify.error('Failed to initiate test execution of alert rule');
    });
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
  $scope.save = function (alertData) {
    // On click of save button clear set debug level drop down
    $scope.setDebug = '';

    // validate if all the information collector rules are placed at the end.
    if (isInformationCollectorNotAtTheEnd(alertData.parsedRuleList)) {
      notify.error('Please configure the information collection rules at the end.');
      return;
    }

    $state.save();

    /*eslint-disable */
    Number.prototype.padLeft = function (base, chr) {
      const len = (String(base || 10).length - String(this).length) + 1;
      return len > 0 ? new Array(len).join(chr || '0') + this : this;
    };
    /*eslint-enable */

    // set alert timestamp
    const dateObj = new Date();
    const month = (dateObj.getMonth() + 1).padLeft(); //months from 1-12
    const day = dateObj.getDate().padLeft();
    const year = dateObj.getFullYear().padLeft();
    const hour = dateObj.getHours().padLeft();
    const minute = dateObj.getMinutes().padLeft();
    const second = dateObj.getSeconds().padLeft();
    const alertTimestamp = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
    alertcfg.lastModifiedTime = alertTimestamp;

    // set allowed roles (user permissions)
    alertcfg.allowedRolesJSON = angular.toJson(alertData.parsedAllowedRolesJSON);

    // alert status
    alertcfg.enableAlert = alertData.enableAlert;

    // alert title
    alertcfg.title = alertData.title;

    // alert about info
    alertcfg.severity = alertData.severity;
    alertcfg.summary = alertData.summary;
    alertcfg.description = alertData.description;

    // set alert condition
    alertcfg.ruleList = angular.toJson(alertData.parsedRuleList);

    // rule evaluation conditions
    const evalCriteriaConditionList = alertData.parsedEvalCriteriaConditionList;

    _.forEach(evalCriteriaConditionList, (evalCriteriaConditionItem) => {
      // if 'expanded' key is present remove it
      // this should not be stored inside kibana object
      if (evalCriteriaConditionItem.hasOwnProperty('expanded')) {
        delete evalCriteriaConditionItem.expanded;
      }

      // The 'value' in 'channelList' need to be formatted for emailGroup and report
      _.forEach(evalCriteriaConditionItem.channelList, (channelListItem) => {
        const channelType = channelListItem.channel;
        const value = channelListItem.value;
        let formattedValue = undefined;
        if (channelType === 'emailGroup') {
          formattedValue = value.join(',');
        } else if (channelType === 'report') {
          formattedValue = [];
          _.forEach(value, (reportTitle) => {
            formattedValue.push(getReportObject(reportTitle));
          });
        } else {
          formattedValue = value;
        }
        channelListItem.value = formattedValue;
      });
    });

    alertcfg.evalCriteriaConditionList = angular.toJson(evalCriteriaConditionList);

    // rule evaluation script
    alertcfg.evalCriteria = angular.toJson(alertData.parsedEvalCriteria);

    // alert advanced configuration
    alertcfg.enableAdvancedConfig = alertData.enableAdvancedConfig;

    // alert control: alarm mode
    alertcfg.enableAlarmMode = alertData.enableAlarmMode;

    // alert control: throttling
    alertcfg.enableThrottle = alertData.enableThrottle;
    alertcfg.throttleDurationType = alertData.throttleDurationType;
    alertcfg.throttleDuration = alertData.throttleDuration;

    // alert control: alert duration
    alertcfg.activeAlertCheck = alertData.activeAlertCheck;


    // alert control: start time
    // add seconds to start time if not present
    let activeStartTime = alertData.activeStartTime;
    activeStartTime = activeStartTime.length < 6 ? activeStartTime + ':00' : activeStartTime;
    alertcfg.activeStartTime = activeStartTime;


    // alert control: end time
    // add seconds to end time if not present
    let activeEndTime = alertData.activeEndTime;
    activeEndTime = activeEndTime.length < 6 ? activeEndTime + ':00' : activeEndTime;
    alertcfg.activeEndTime = activeEndTime;

    alertcfg.weekdays = angular.toJson(alertData.parsedWeekdaysList);

    // alert control: alert advanced configuration
    alertcfg.advancedConfiguration = alertData.advancedConfiguration;

    // alert channel: ticket
    alertcfg.alertByTicket = alertData.alertByTicket;

    // alert channel: whatsapp
    alertcfg.alertByWhatsapp = alertData.alertByWhatsapp;
    alertcfg.alertWhatsappNumber = alertData.alertWhatsappNumber;

    // alert channel: email
    alertcfg.alertByEmail = alertData.alertByEmail;
    alertcfg.alertEmailId = alertData.alertEmailId;
    alertcfg.alertEmailBody = alertData.alertEmailBody;
    alertcfg.alertEmailGroup = alertData.alertEmailGroupHandler.toString();

    // alert channel: runbook automation
    alertcfg.enable_runbook_automation = alertData.enable_runbook_automation;
    alertcfg.runbook_script = alertData.runbook_script;

    // alert channel: ansible playbook
    alertcfg.enable_ansible_playbook = alertData.enable_ansible_playbook;
    alertcfg.ansible_playbook_name = alertData.ansible_playbook_name;
    alertcfg.ansible_playbook_options = alertData.ansible_playbook_options;

    // alert channel: report
    alertcfg.alertByReport = alertData.alertByReport;
    // update alert configuration for report list
    const alertReportList = [];
    const selectedValue = alertData.alertReportListHandler;
    selectedValue.forEach(selectedReport => {
      // we get its respective report object and push it into our list
      alertReportList.push(getReportObject(selectedReport));
    });
    alertcfg.alertReportList = angular.toJson(alertReportList);

    // if an alert is loaded and saved as another
    // alert, It is a new alert. Hence set the flag to true.
    isNewAlert = false;
    if (loadedAlertId !== alertcfg.id) {
      isNewAlert = true;
    }

    // perform final save operation
    alertcfg.save(isNewAlert).then(function (id) {
      if (id) {
        notify.info(`Saved Alert as "${alertcfg.title}"`);
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
    docTitle.change(VunetSidebarConstants.ALERT_RULES);
    $scope.$emit('application.load');
  }
  init();
}
