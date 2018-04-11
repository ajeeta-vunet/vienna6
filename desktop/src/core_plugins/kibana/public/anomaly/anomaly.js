import _ from 'lodash';
import 'plugins/kibana/alert/saved_alert/saved_alerts';
import 'plugins/kibana/anomaly/styles/main.less';
import 'ui/vis/editors/default/sidebar';
import 'ui/collapsible_sidebar';
import 'ui/share';
import 'ui/query_bar';
import uiRoutes from 'ui/routes';
import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';
import anomalyTemplate from 'plugins/kibana/anomaly/anomaly.html';
import { AnomalyConstants, createAnomalyEditUrl } from './anomaly_constants';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { Notifier } from 'ui/notify/notifier';
import { DocTitleProvider } from 'ui/doc_title';
import { logUserOperation } from 'plugins/kibana/log_user_operation';
import { updateVunetObjectOperation } from 'ui/utils/vunet_object_operation';
const angular = require('angular');

uiRoutes
  .when(AnomalyConstants.CREATE_PATH, {
    template: anomalyTemplate,
    resolve: {
      indexPatternIds: function (Private) {
        const savedObjectsClient = Private(SavedObjectsClientProvider);

        return savedObjectsClient.find({
          type: 'index-pattern',
          fields: ['title'],
          perPage: 10000
        }).then(
          response => response.savedObjects
        );

      },
      anomaly: function (savedAnomalies) {
        return savedAnomalies.get();
      },
      // This flag indicates if new anomaly is being
      // created.
      isNewAnomaly: function () {
        return true;
      }
    }
  })
  .when(createAnomalyEditUrl(':id'), {
    template: anomalyTemplate,
    resolve: {
      indexPatternIds: function (Private) {
        const savedObjectsClient = Private(SavedObjectsClientProvider);

        return savedObjectsClient.find({
          type: 'index-pattern',
          fields: ['title'],
          perPage: 10000
        }).then(response => response.savedObjects);

      },
      anomaly: function (savedAnomalies, $route) {
        return savedAnomalies.get($route.current.params.id);
      },
      isNewAnomaly: function () {
        return false;
      }
    }
  });

uiModules
  .get('app/anomaly', [
    'kibana/notify',
    'kibana/courier'
  ])
  .directive('anomalyApp', function () {
    return {
      restrict: 'E',
      controllerAs: 'anomalyApp',
      controller: anomalyAppEditor,
    };
  });

function anomalyAppEditor($scope,
  $rootScope,
  $route,
  $routeParams,
  $location,
  Private,
  getAppState,
  savedAnomalies,
  $filter,
  courier,
  $http,
  AppState,
  timefilter,
  kbnUrl) {

  const notify = new Notifier({
    location: 'Anomaly'
  });

  const anomaly = $scope.anomaly = $route.current.locals.anomaly;
  let isNewAnomaly = $route.current.locals.isNewAnomaly;
  const loadedAnomalyId = $route.current.locals.loadedAnomalyId;
  logUserOperation($http, 'GET', 'anomaly', anomaly.title, anomaly.id);

  $scope.indexPatternList = $route.current.locals.indexPatternIds.map(pattern => {
    const id = pattern.id;
    return {
      id: id,
      title: pattern.get('title'),
    };
  });

  $scope.listAnomaly = $route.current.locals.listAnomaly;
  // Populate allowedRoles from anomaly
  const allowedRoles = anomaly.allowedRolesJSON ? JSON.parse(anomaly.allowedRolesJSON) : [];

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
  if(userRoleCanModify && chrome.canCurrentUserCreateObject()) {
    $scope.topNavMenu = [{
      key: 'save',
      description: 'Save Anomaly',
      template: require('plugins/kibana/anomaly/panels/save.html'),
      testId: 'anomalySaveButton',
      disableButton() {
        const anomalyForm = document.getElementById('anomalyForm');
        return Boolean(!anomalyForm.checkValidity());
      },
    }];
  } else {
    $scope.topNavMenu = [];
  }

  const stateDefaults = {
    title: anomaly.title,
  };

  const $state = $scope.state = new AppState(stateDefaults);

  // If Anomaly description exists, Its a load operation.
  if(anomaly.description) {

    $scope.countIsSelected = false;
    if(anomaly.metric === 'count') {
      $scope.countIsSelected = true;
      $scope.selectedField = undefined;
    }

    $scope.description = anomaly.description;

    // Populate the index object reference based on what is stored
    // in anomaly
    _.each($scope.indexPatternList, function (indexPattern) {
      const anomalyIndex = JSON.parse(anomaly.index);
      if(indexPattern.id === anomalyIndex.id) {
        $scope.selectedIndex = indexPattern;
        return false;
      }
    });

    $scope.type = anomaly.type;
    $scope.metric = anomaly.metric;
    $scope.windowSize = anomaly.window;
    $scope.modelType =  anomaly.model;
    $scope.periodicity = anomaly.periodicity;
    $scope.filter = anomaly.filter;
    $scope.docType = anomaly.docType;
    $scope.macroInterval = anomaly.macroInterval;
    $scope.macroIntervalType = anomaly.macroIntervalType;
    $scope.microInterval = anomaly.microInterval;
    $scope.microIntervalType = anomaly.microIntervalType;
    $scope.timeDuration = anomaly.timeDuration;
    $scope.timeDurationType = anomaly.timeDurationType;
    if ($scope.macroInterval !== '' ||
               $scope.microInterval !== '' ||
               $scope.timeDuration !== '') {
      $scope.advancedCheckbox = true;
    }

    if ($scope.selectedIndex !== '') {
      courier.indexPatterns.get($scope.selectedIndex.id).then(function (currentIndex) {
        let fields = currentIndex.fields;
        fields = $filter('filter')(fields, { aggregatable: true });
        $scope.indexFields = fields.slice(0);
        _.each($scope.indexFields, function (field) {
          if(anomaly.metricField) {
            if (anomaly.metricField === field.name) {
              $scope.selectedField = field;
            }
          }
        });

        // The indexfields is moved as a inner loop to maintain
        // the order of the fields under groupByField list.
        $scope.groupByFieldList = [];
        let groupByFieldList = [];
        if(anomaly.groupbyField) {
          groupByFieldList = JSON.parse(anomaly.groupbyField);
        }
        if(groupByFieldList.length) {
          _.each(groupByFieldList, function (grpByField) {
            _.each($scope.indexFields, function (field) {
              if(grpByField === field.name) {
                const dataObj = {
                  data: field
                };
                $scope.groupByFieldList.push(dataObj);
              }
            });
          });
        }
        // Adding the default object data to groupByField under
        // new_oper_rule_obj to display an empty selectbox in the
        // front end when no groupby field is selected for this rule.
        else {
          $scope.groupByFieldList.push({ data: '' });
        }
        // Using return will not help here ,
        // As _each will continue to execute without breaking at any point
      });
    }
  }
  else {
    $scope.groupByFieldList = [{ data: '' }];
  }

  //calling the save function to save the anomaly details filled in the anomaly form
  $scope.save = function () {
    $state.title = anomaly.title;
    if (anomaly.title === 'Home') {
      // We can't allow anyone to save a Home anomaly so inform the user
      // about it
      //
      // There is some problem here... when we return first time,
      // things work fine but if a user press save with 'Home' again,
      // we end up throwing an error.. Can't find where the error is
      // coming from... need to look at this later..
      alert('You cannot create an anomaly with name \'Home\'. Please use a different name');
      return;
    }
    $state.save();
    anomaly.allowedRolesJSON = angular.toJson($scope.opts.allowedRoles);
    anomaly.description = $scope.description;
    // Store only the id of the selected index
    anomaly.index = angular.toJson($scope.selectedIndex);
    anomaly.type = $scope.type;
    anomaly.metric = $scope.metric;
    anomaly.window = $scope.windowSize;
    anomaly.model = $scope.modelType;
    anomaly.periodicity = $scope.periodicity;
    anomaly.filter = $scope.filter;
    anomaly.docType = $scope.docType;
    anomaly.macroInterval = $scope.macroInterval;
    anomaly.macroIntervalType = $scope.macroIntervalType;
    anomaly.microInterval = $scope.microInterval;
    anomaly.microIntervalType = $scope.microIntervalType;
    anomaly.timeDuration = $scope.timeDuration;
    anomaly.timeDurationType = $scope.timeDurationType;
    if($scope.selectedField) {
      anomaly.metricField = $scope.selectedField.displayName;
    }
    else {
      anomaly.metricField = '';
    }
    const grpByFieldList = [];
    // We store only the grpByFieldNames and not the
    // objects
    _.each($scope.groupByFieldList, function (field) {
      if(field.data !== '') {
        grpByFieldList.push(field.data.displayName);
      }
    });
    anomaly.groupByField = JSON.stringify(grpByFieldList);

    // If an anomaly is loaded and saved as another
    // anomaly, It is a new anomaly. Hence set the flag to true.
    if(loadedAnomalyId !== anomaly.id) {
      isNewAnomaly = true;
    }

    anomaly.save(isNewAnomaly).then(function (id) {
      $scope.kbnTopNav.close('save');
      if (id) {
        anomaly.id = id;
        updateVunetObjectOperation([anomaly], 'anomaly', $http, 'modify', chrome);
        if (anomaly.id !== $routeParams.id) {
          kbnUrl.change('/anomaly/{{id}}', { id: anomaly.id });
        }
        logUserOperation($http, 'POST', 'anomaly', anomaly.title, anomaly.id);
      }
    })
      .catch(notify.fatal);
  };

  function init() {
    const docTitle = Private(DocTitleProvider);
    if (anomaly.id) {
      docTitle.change(anomaly.title);
    }
    $scope.$emit('application.load');
  }

  $scope.getAnomalyTitle = function () {
    return anomaly.title;
  };

  $scope.newAnomaly = function () {
    kbnUrl.change('/anomaly', {});
  };

  $scope.landingPageUrl = () => `#${AnomalyConstants.LANDING_PAGE_PATH}`;
  // Setup configurable values for config directive, after objects are initialized
  $scope.opts = {
    anomaly: anomaly,
    allowedRoles: allowedRoles,
    doSave: $scope.save,
  };
  init();
}