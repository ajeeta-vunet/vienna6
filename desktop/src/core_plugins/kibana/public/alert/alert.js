import _ from 'lodash';
import 'plugins/kibana/alert/saved_alert/saved_alerts';
import 'ui/vis/editors/default/sidebar';
import 'ui/collapsible_sidebar';
import 'ui/share';
import 'ui/query_bar';
import angular from 'angular';
import { Notifier } from 'ui/notify/notifier';
import { DocTitleProvider } from 'ui/doc_title';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import alertTemplate from 'plugins/kibana/alert/alert.html';
import { AlertConstants, createAlertEditUrl } from './alert_constants';
import { SavedObjectsClientProvider } from 'ui/saved_objects';

uiRoutes
  .when(AlertConstants.CREATE_PATH, {
    template: alertTemplate,
    resolve: {
      indexPatternIds: function (Private) {
        const savedObjectsClient = Private(SavedObjectsClientProvider);

        return savedObjectsClient.find({
          type: 'index-pattern',
          fields: ['title'],
          perPage: 10000
        }).then(response => response.savedObjects);

      },
      alertcfg: function (savedAlerts) {
        return savedAlerts.get();
      },
      // This flag indicates if new alert is being
      // created.
      isNewAlert: function () {
        return true;
      }
    }
  })
  .when(createAlertEditUrl(':id'), {
    template: alertTemplate,
    resolve: {
      indexPatternIds: function (Private) {
        const savedObjectsClient = Private(SavedObjectsClientProvider);

        return savedObjectsClient.find({
          type: 'index-pattern',
          fields: ['title'],
          perPage: 10000
        }).then(response => response.savedObjects);
      },
      alertcfg: function (savedAlerts, $route) {
        //lup.logUserOperation($http, 'GET','alert', $route.current.params.id);
        return savedAlerts.get($route.current.params.id);
      },
      isNewAlert: function () {
        return false;
      }
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
  courier,
  $route,
  $routeParams,
  $location,
  Private,
  AppState,
  savedAlerts,
  $filter,
  $http,
  kbnUrl) {

  const notify = new Notifier({
    location: 'Alert'
  });

  const alertcfg = $scope.alertcfg = $route.current.locals.alertcfg;
  let isNewAlert = $route.current.locals.isNewAlert;
  const loadedAlertId = $route.current.locals.loadedAlertId;

  $scope.indexPatternList = $route.current.locals.indexPatternIds.map(pattern => {
    const id = pattern.id;
    return {
      id: id,
      title: pattern.get('title'),
    };
  });

  // Populate allowedRoles from alertcfg
  // var allowedRoles = alertcfg.allowedRolesJSON ? JSON.parse(alertcfg.allowedRolesJSON) : [];

  $scope.topNavMenu = [{
    key: 'save',
    description: 'Save Alert',
    template: require('plugins/kibana/alert/panels/save.html'),
    testId: 'alertSaveButton',
  }];

  // Get the RBAC stuff here...
  // Set whether the current logged in user be allowed to create a new
  // object or not
  // $scope.creation_allowed = false;
  //if ( chrome.canCurrentUserCreateObject() ) {
  //  $scope.creation_allowed = true;
  //}

  // For an admin used, we always show modify permissions during save..
  // const userRoleCanModify = false;
  //if ( chrome.isCurrentUserAdmin() ) {
  //  userRoleCanModify = true;
  //} else {
  //  // Set a flag whether the current user's role can modify this object
  //  userRoleCanModify = chrome.canCurrentUserModifyPermissions(allowedRoles);
  //}

  // Let us get the ruleList from alertCfg, it will be empty if its a new
  // alert
  let ruleList = [];
  if (alertcfg.ruleList) {
    ruleList = JSON.parse(alertcfg.ruleList);
  }

  if(ruleList.length) {
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

    _.each(ruleList, function (alertcfgRule) {
      //The following code takes care of populating the 'groupByField'
      // and 'selectedField' form when any alert is loaded
      // we are using _.clonedeep so that the groupbyField under
      // newOperRuleObj is not updated in each iteration.
      const newRuleObj = _.cloneDeep(defaultRuleObj);
      const newOperRuleObj = _.cloneDeep(defaultOperRuleObj);

      // These conditions are added here so as to handle load operations of
      // alert. Any changes added here needs to be added under details.js too
      if(alertcfgRule.ruleType === 'count') {
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
      } else if(alertcfgRule.ruleType === 'unique_values') {
        newOperRuleObj.metricIsSelected = true;
      } else if(alertcfgRule.ruleType === 'state_change' || alertcfgRule.ruleType === 'latest_value') {
        newOperRuleObj.allowStringInCompareValue = true;
        newOperRuleObj.metricIsSelected = true;
        alertcfgRule.ruleTypeDuration = 5;
        alertcfgRule.ruleTypeDurationType = 'minute';
      }
      newRuleObj.ruleType = alertcfgRule.ruleType;
      newRuleObj.ruleNameAlias = alertcfgRule.ruleNameAlias;
      newRuleObj.informationCollector = alertcfgRule.informationCollector;

      // Populate the selectedIndex object reference based on what is stored
      // in alertcfg
      _.each($scope.indexPatternList, function (indexPattern) {
        if(indexPattern.id === alertcfgRule.selectedIndex.id) {
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


      if (alertcfgRule.selectedIndex !== '') {
        courier.indexPatterns.get(alertcfgRule.selectedIndex.id).then(function (currentIndex) {
          let fields = currentIndex.fields.raw;
          fields = $filter('filter')(fields, { aggregatable: true });
          newOperRuleObj.indexFields = fields.slice(0);
          _.each(newOperRuleObj.indexFields, function (field) {
            if(alertcfgRule.selectedField) {
              if (alertcfgRule.selectedField === field.name) {
                newOperRuleObj.selectedField = field;
              }
            }
          });

          // The indexfields is moved as a inner loop to maintain
          // the order of the fields under groupByField list.
          if(alertcfgRule.groupByField.length) {
            _.each(alertcfgRule.groupByField, function (grpByField) {
              _.each(newOperRuleObj.indexFields, function (field) {
                if(grpByField === field.name) {
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
          if(alertcfgRule.additionalField && alertcfgRule.additionalField.length) {
            _.each(alertcfgRule.additionalField, function (additionalField) {
              _.each(newOperRuleObj.indexFields, function (field) {
                if(additionalField === field.name) {
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
          $scope.ruleList.push(newRuleObj);
          $scope.operRuleList.push(newOperRuleObj);
        });
      }
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
  } else {
    $scope.ruleList = [ {
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
    }];
    $scope.operRuleList = [ { 'indexFields': [],
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

  // This function is to validate if all the information collector
  // rules are placed at the end.
  function isInformationCollectorNotAtTheEnd() {
    let infoCollectorRuleExists = false;
    for (let index = 0; index < $scope.ruleList.length; index = index + 1) {
      const rule = $scope.ruleList[index];
      if(rule.informationCollector === true)
      {
        infoCollectorRuleExists = true;
      }
      else if(infoCollectorRuleExists === true) {
        return true;
      }
    }
    return false;
  }

  const stateDefaults = {
    title: alertcfg.title,
  };

  const $state = $scope.state = new AppState(stateDefaults);

  //calling the save function to save the alert details filled in the alert cfg form
  $scope.save = function () {
    $state.title = alertcfg.title;
    const infoCollectorFlag = isInformationCollectorNotAtTheEnd();
    if (infoCollectorFlag === true) {
      alert('Please configure the information collection rules at the end.');
      return;
    }

    $state.save();
    //alertcfg.allowedRolesJSON = angular.toJson($scope.opts.allowedRoles);

    Number.prototype.padLeft = function (base, chr) {
      const len = (String(base || 10).length - String(this).length) + 1;
      return len > 0 ? new Array(len).join(chr || '0') + this : this;
    };

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
    alertcfg.ruleLevelThreshold = $scope.ruleLevelThreshold;
    alertcfg.evalCriteria = angular.toJson($scope.evalCriteria);
    alertcfg.evalCriteriaAlias = $scope.evalCriteriaAlias;
    _.each($scope.operRuleList, function (operRule, index) {
      if(operRule.selectedField) {
        $scope.ruleList[index].selectedField = operRule.selectedField.displayName;
      } else {
        $scope.ruleList[index].selectedField = '';
      }
      // setting the groupByField of this rule to empty
      // and fetching the group by fields set in the operRuleList
      $scope.ruleList[index].groupByField = [];
      _.each(operRule.groupByField, function (field) {
        if(operRule.groupByField.length === 1 && field.data === null) {
          operRule.groupByField = [{ data: '' }];
        } else if(field.data !== '' && field.data !== null) {
          $scope.ruleList[index].groupByField.push(field.data.displayName);
        }
      });

      // setting the additionalField of this rule to empty
      // and fetching the additional fields set in the operRuleList
      $scope.ruleList[index].additionalField = [];
      _.each(operRule.additionalField, function (field) {
        if(operRule.additionalField.length === 1 && field.data === null) {
          operRule.additionalField = [{ data: '' }];
        } else if(field.data !== '' && field.data !== null) {
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
    if(loadedAlertId !== alertcfg.id)
    {
      isNewAlert = true;
    }

    alertcfg.save(isNewAlert).then(function (id) {
      $scope.kbnTopNav.close('save');
      //var tenant_bu = chrome.getTenantBu();
      if (id) {
        /*
        // making a post call to vusmartmaps with 'alert_id' and
        // 'action' (save/modify alert). This information will be
        // used to generate alerts.
        var modify_alert = $http({
          method: 'POST',
          url: '/vuSmartMaps/api/alert_status/',
          data: {'alert_id': id, 'alert_title': alertcfg.title,  'action':'modify', 'tenant_id': tenant_bu[0], 'bu_id': tenant_bu[1] },
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        }).success(function (data, status, headers, config) {
        }).error(function (data, status, headers, config) {
          notify.error('Failed to notify for the alert change')
        }); */
        if (alertcfg.id !== $routeParams.id) {
          kbnUrl.change('/alert/{{id}}', { id: alertcfg.id });
        }
        //lup.logUserOperation($http, 'POST','alert', id);
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

  // Setup configurable values for config directive, after objects are initialized
  $scope.opts = {
    alertcfg: alertcfg,
    //allowedRoles: allowedRoles,
    doSave: $scope.save,
    //userRoleCanModify: userRoleCanModify,
  };

  init();
}
