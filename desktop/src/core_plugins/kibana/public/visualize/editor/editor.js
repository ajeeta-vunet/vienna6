import _ from 'lodash';
import 'plugins/kibana/visualize/saved_visualizations/saved_visualizations';
import 'ui/vis/editors/default/sidebar';
import 'plugins/kibana/visualize/editor/agg_filter';
import 'ui/visualize';
import 'ui/collapsible_sidebar';
import 'ui/share';
import 'ui/query_bar';
import chrome from 'ui/chrome';
import angular from 'angular';
import { Notifier } from 'ui/notify/notifier';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { DocTitleProvider } from 'ui/doc_title';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { stateMonitorFactory } from 'ui/state_management/state_monitor_factory';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import editorTemplate from 'plugins/kibana/visualize/editor/editor.html';
import { DashboardConstants } from 'plugins/kibana/dashboard/dashboard_constants';
import { VisualizeConstants } from '../visualize_constants';
import { KibanaParsedUrl } from 'ui/url/kibana_parsed_url';
import { absoluteToParsedUrl } from 'ui/url/absolute_to_parsed_url';
import { migrateLegacyQuery } from 'ui/utils/migrateLegacyQuery';
import { logUserOperation } from 'plugins/kibana/log_user_operation';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

uiRoutes
  .when(VisualizeConstants.CREATE_PATH, {
    template: editorTemplate,
    resolve: {
      savedVis: function (savedVisualizations, courier, $route, Private) {
        const visTypes = Private(VisTypesRegistryProvider);
        const visType = _.find(visTypes, { name: $route.current.params.type });
        const shouldHaveIndex = visType.requiresSearch && visType.options.showIndexSelection;
        const hasIndex = $route.current.params.indexPattern || $route.current.params.savedSearchId;
        if (shouldHaveIndex && !hasIndex) {
          throw new Error('You must provide either an indexPattern or a savedSearchId');
        }

        return savedVisualizations.get($route.current.params)
          .catch(courier.redirectWhenMissing({
            '*': '/visualize'
          }));
      }
    }
  })
  .when(`${VisualizeConstants.EDIT_PATH}/:id`, {
    template: editorTemplate,
    resolve: {
      savedVis: function (savedVisualizations, courier, $route) {
        return savedVisualizations.get($route.current.params.id)
          .catch(courier.redirectWhenMissing({
            'visualization': '/visualize',
            'search': '/management/kibana/objects/savedVisualizations/' + $route.current.params.id,
            'index-pattern': '/management/kibana/objects/savedVisualizations/' + $route.current.params.id,
            'index-pattern-field': '/management/kibana/objects/savedVisualizations/' + $route.current.params.id
          }));
      }
    }
  });

uiModules
  .get('app/visualize', [
    'kibana/notify',
    'kibana/courier'
  ])
  .directive('visualizeApp', function () {
    return {
      restrict: 'E',
      controllerAs: 'visualizeApp',
      controller: VisEditor,
    };
  });

function VisEditor($scope, $route, timefilter, AppState, $window, kbnUrl, courier, Private, Promise, config, kbnBaseUrl, $http) {
  const docTitle = Private(DocTitleProvider);
  const queryFilter = Private(FilterBarQueryFilterProvider);

  const notify = new Notifier({
    location: 'Visualization Editor'
  });

  // Retrieve the resolved SavedVis instance.
  const savedVis = $route.current.locals.savedVis;
  logUserOperation($http, 'GET', 'visualization', savedVis.title, savedVis.id);
  // vis is instance of src/ui/public/vis/vis.js.
  // SearchSource is a promise-based stream of search results that can inherit from other search sources.
  const { vis, searchSource } = savedVis;
  $scope.vis = vis;

  // Get allowedRols
  $scope.allowedRoles = savedVis.allowedRolesJSON ? JSON.parse(savedVis.allowedRolesJSON) : [];

  // Find out if user can modify, if he/she can't, we hide write controls..
  let userRoleCanModify = false;

  // Set a flag whether the current user's role can modify this object
  userRoleCanModify = chrome.canCurrentUserModifyPermissions($scope.allowedRoles);

  // If user can modify the existing object or is allowed to create an object
  if(userRoleCanModify && chrome.canManageObject()) {
    $scope.topNavMenu = [{
      key: 'save',
      description: 'Save Visualization',
      template: require('plugins/kibana/visualize/editor/panels/save.html'),
      testId: 'visualizeSaveButton',
      disableButton() {
        return Boolean(vis.dirty);
      },
      tooltip() {
        if (vis.dirty) {
          return 'Apply or Discard your changes before saving';
        }
      }
    },
    // Hiding the share button as we dont need this.
    // {
    //   key: 'share',
    //   description: 'Share Visualization',
    //   template: require('plugins/kibana/visualize/editor/panels/share.html'),
    //   testId: 'visualizeShareButton',
    // },
    {
      key: 'refresh',
      description: 'Refresh',
      run: function () {
        vis.forceReload();
      },
      testId: 'visualizeRefreshButton',
    }];
  } else {
    $scope.topNavMenu = [];
  }

  let stateMonitor;

  const $appStatus = this.appStatus = {
    dirty: !savedVis.id
  };

  // if (savedVis.id) {
  //   docTitle.change(savedVis.title);
  // }

  // Extract visualization state with filtered aggs. You can see these filtered aggs in the URL.
  // Consists of things like aggs, params, listeners, title, type, etc.
  const savedVisState = vis.getState();
  const stateDefaults = {
    uiState: savedVis.uiStateJSON ? JSON.parse(savedVis.uiStateJSON) : {},
    linked: !!savedVis.savedSearchId,
    query: searchSource.getOwn('query') || { query: '', language: config.get('search:queryLanguage') },
    filters: searchSource.getOwn('filter') || [],
    vis: savedVisState
  };

  // Instance of app_state.js.
  const $state = (function initState() {
    // This is used to sync visualization state with the url when `appState.save()` is called.
    const appState = new AppState(stateDefaults);

    // The savedVis is pulled from elasticsearch, but the appState is pulled from the url, with the
    // defaults applied. If the url was from a previous session which included modifications to the
    // appState then they won't be equal.
    if (!angular.equals(appState.vis, savedVisState)) {
      Promise.try(function () {
        vis.setState(appState.vis);
      })
        .catch(courier.redirectWhenMissing({
          'index-pattern-field': '/visualize'
        }));
    }

    return appState;
  }());

  function init() {
    // export some objects
    $scope.savedVis = savedVis;
    $scope.indexPattern = vis.indexPattern;
    $scope.searchSource = searchSource;
    $scope.state = $state;

    // Always display doc title as 'Visualizations'
    docTitle.change(VunetSidebarConstants.VISUALIZATIONS);

    // Create a PersistedState instance.
    $scope.uiState = $state.makeStateful('uiState');
    $scope.appStatus = $appStatus;

    const addToDashMode = $route.current.params[DashboardConstants.ADD_VISUALIZATION_TO_DASHBOARD_MODE_PARAM];
    kbnUrl.removeParam(DashboardConstants.ADD_VISUALIZATION_TO_DASHBOARD_MODE_PARAM);

    $scope.isAddToDashMode = () => addToDashMode;

    // Associate PersistedState instance with the Vis instance, so that
    // `uiStateVal` can be called on it. Currently this is only used to extract
    // map-specific information (e.g. mapZoom, mapCenter).
    vis.setUiState($scope.uiState);

    const currentUser = chrome.getCurrentUser();
    $scope.owner = { 'name': currentUser[0], 'role': currentUser[1], 'permission': currentUser[2] };

    $scope.timefilter = timefilter;
    $scope.opts = _.pick($scope, 'doSave', 'savedVis', 'shareData', 'timefilter', 'isAddToDashMode', 'allowedRoles', 'owner');

    stateMonitor = stateMonitorFactory.create($state, stateDefaults);
    stateMonitor.ignoreProps([ 'vis.listeners' ]).onChange((status) => {
      $appStatus.dirty = status.dirty || !savedVis.id;
    });

    $scope.$watch('state.query', $scope.updateQueryAndFetch);

    $state.replace();

    $scope.getVisualizationTitle = function getVisualizationTitle() {
      return savedVis.lastSavedTitle || `${savedVis.title} (unsaved)`;
    };

    $scope.$watchMulti([
      'searchSource.get("index")',
      'vis.type.options.showTimePicker',
    ], function ([index, requiresTimePicker]) {
      timefilter.enabled = Boolean((!index || index.timeFieldName) && requiresTimePicker);
    });

    // update the searchSource when filters update
    $scope.$listen(queryFilter, 'update', function () {
      $state.save();
    });

    // update the searchSource when query updates
    $scope.fetch = function () {
      $state.save();
      $scope.vis.forceReload();
    };

    $scope.$on('$destroy', function () {
      savedVis.destroy();
      stateMonitor.destroy();
    });
  }

  $scope.updateQueryAndFetch = function (query) {
    // reset state if language changes
    if ($state.query.language && $state.query.language !== query.language) {
      $state.filters = [];
      $state.$newFilters = [];
    }
    $state.query = migrateLegacyQuery(query);
    $scope.fetch();
  };

  /**
   * Called when the user clicks "Save" button.
   */
  $scope.doSave = function () {
    // vis.title was not bound and it's needed to reflect title into visState
    $state.vis.title = savedVis.title;
    $state.vis.type = savedVis.type || $state.vis.type;
    savedVis.visState = $state.vis;
    savedVis.uiStateJSON = angular.toJson($scope.uiState.getChanges());
    savedVis.allowedRolesJSON = angular.toJson($scope.opts.allowedRoles);
    const updateOperation = require('ui/utils/vunet_object_operation');

    savedVis.save()
      .then(function (id) {
        stateMonitor.setInitialState($state.toJSON());
        $scope.kbnTopNav.close('save');

        // If it's a  BMV, since alert and other objects depend on it, then we need to notify DAQ to update the alert rule.
        if (savedVis.visState.type === 'business_metric') {
          updateOperation.updateVunetObjectOperation([savedVis], 'visualization', $http, 'modify', chrome);
        }

        if (id) {
          logUserOperation($http, 'POST', 'visualization', savedVis.title, savedVis.id);
          notify.info('Saved Visualization "' + savedVis.title + '"');
          if ($scope.isAddToDashMode()) {
            const savedVisualizationParsedUrl = new KibanaParsedUrl({
              basePath: chrome.getBasePath(),
              appId: kbnBaseUrl.slice('/app/'.length),
              appPath: kbnUrl.eval(`${VisualizeConstants.EDIT_PATH}/{{id}}`, { id: savedVis.id }),
            });
            // Manually insert a new url so the back button will open the saved visualization.
            $window.history.pushState({}, '', savedVisualizationParsedUrl.getRootRelativePath());
            // Since we aren't reloading the page, only inserting a new browser history item, we need to manually update
            // the last url for this app, so directly clicking on the Visualize tab will also bring the user to the saved
            // url, not the unsaved one.
            chrome.trackSubUrlForApp('kibana:visualize', savedVisualizationParsedUrl);

            const lastDashboardAbsoluteUrl = chrome.getNavLinkById('kibana:dashboard').lastSubUrl;
            const dashboardParsedUrl = absoluteToParsedUrl(lastDashboardAbsoluteUrl, chrome.getBasePath());
            dashboardParsedUrl.addQueryParameter(DashboardConstants.NEW_VISUALIZATION_ID_PARAM, savedVis.id);
            kbnUrl.change(dashboardParsedUrl.appPath);
          } else if (savedVis.id === $route.current.params.id) {
            //docTitle.change(savedVis.lastSavedTitle);
          } else {
            kbnUrl.change(`${VisualizeConstants.EDIT_PATH}/{{id}}`, { id: savedVis.id });
          }
        }
      }, notify.error);
  };

  $scope.unlink = function () {
    if (!$state.linked) return;

    notify.info(`Unlinked Visualization "${savedVis.title}" from Saved Search "${savedVis.savedSearch.title}"`);

    $state.linked = false;
    const parent = searchSource.getParent(true);
    const parentsParent = parent.getParent(true);

    delete savedVis.savedSearchId;
    parent.set('filter', _.union(searchSource.getOwn('filter'), parent.getOwn('filter')));

    // copy over all state except "aggs", "query" and "filter"
    _(parent.toJSON())
      .omit(['aggs', 'filter', 'query'])
      .forOwn(function (val, key) {
        searchSource.set(key, val);
      })
      .commit();

    $state.query = searchSource.get('query');
    $state.filters = searchSource.get('filter');
    searchSource.inherits(parentsParent);

    $scope.fetch();
  };


  $scope.getAdditionalMessage = () => {
    return `This visualization is marked as experimental. ${vis.type.feedbackMessage}`;
  };

  init();
}
