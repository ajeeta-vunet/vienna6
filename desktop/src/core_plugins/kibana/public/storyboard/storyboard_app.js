import _ from 'lodash';
import angular from 'angular';
import chrome from 'ui/chrome';

import 'ui/query_bar';
import { getDashboardTitle, getUnsavedChangesWarningMessage } from '../dashboard/dashboard_strings';
import { TabbedDashboardViewMode } from '../dashboard/dashboard_view_mode';
import { EmbeddableFactoriesRegistryProvider } from 'ui/embeddable/embeddable_factories_registry';
import { uiModules } from 'ui/modules';
import { TopNavIds } from '../dashboard/top_nav/top_nav_ids';
import { ConfirmationButtonTypes } from 'ui/modals/confirm_modal';
import { getTopNavConfig } from '../dashboard/top_nav/get_top_nav_config';
import { DashboardConstants } from '../dashboard/dashboard_constants';
import { VisualizeConstants } from 'plugins/kibana/visualize/visualize_constants';
import { DashboardContainerAPI } from '../dashboard/dashboard_container_api';
import { DashboardStateManager } from '../dashboard/dashboard_state_manager';
import { showCloneModal } from '../dashboard/top_nav/show_clone_modal';
import { FilterManagerProvider } from 'ui/filter_manager';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { DocTitleProvider } from 'ui/doc_title';
import { migrateLegacyQuery } from 'ui/utils/migrateLegacyQuery';
import * as filterActions from 'ui/doc_table/actions/filter';

import { saveStoryboard } from './lib';
import { logUserOperation } from 'plugins/kibana/log_user_operation';
import { DashboardViewportProvider } from '../dashboard/viewport/dashboard_viewport_provider';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { StoryBoardConstants, createStoryboardEditUrl } from './storyboard_constants';
require('plugins/kibana/storyboard/directives/storyboard_provider.js');


const app = uiModules.get('app/storyboard', [
  'elasticsearch',
  'ngRoute',
  'react',
  'kibana/courier',
  'kibana/config',
  'kibana/notify',
  'kibana/typeahead',
]);

app.directive('dashboardViewportProvider', function (reactDirective) {
  return reactDirective(DashboardViewportProvider);
});

app.directive('storyboardApp', function ($injector, $http) {
  const Notifier = $injector.get('Notifier');
  const courier = $injector.get('courier');
  const AppState = $injector.get('AppState');
  const timefilter = $injector.get('timefilter');
  const quickRanges = $injector.get('quickRanges');
  const kbnUrl = $injector.get('kbnUrl');
  const confirmModal = $injector.get('confirmModal');
  const config = $injector.get('config');
  const Private = $injector.get('Private');
  return {
    restrict: 'E',
    controllerAs: 'storyboardApp',
    controller: function ($scope,
      $rootScope,
      $route,
      $routeParams,
      $compile,
      storyboardConfig) {
      const filterManager = Private(FilterManagerProvider);
      const filterBar = Private(FilterBarQueryFilterProvider);
      const docTitle = Private(DocTitleProvider);
      const notify = new Notifier({ location: 'Storyboard' });
      $scope.embeddableFactories = Private(EmbeddableFactoriesRegistryProvider);
      $scope.getEmbeddableFactory = panelType => $scope.embeddableFactories.byName[panelType];

      const storyboard = $scope.dash = $route.current.locals.storyboard;
      $scope.savedStoryboard = storyboard;
      $scope.showDelete = false;
      $scope.dashboards = [];
      if (JSON.parse($scope.savedStoryboard.dashboardsJSON).length > 0) {
        $scope.dashboards = JSON.parse($scope.savedStoryboard.dashboardsJSON);
        $scope.landingTab = JSON.parse($scope.savedStoryboard.dashboardsJSON)[0].id;
      }

      docTitle.change(VunetSidebarConstants.STORY_BOARDS);

      logUserOperation($http, 'GET', 'storyboard', $scope.savedStoryboard.title, $scope.savedStoryboard.id);

      // Get allowedRoles from object
      const allowedRoles = $scope.savedStoryboard.allowedRolesJSON ? JSON.parse($scope.savedStoryboard.allowedRolesJSON) : [];
      // Find out if user can modify, if he/she can't, we hide write controls..
      let userRoleCanModify = false;

      // Set a flag whether the current user's role can modify this object
      userRoleCanModify = chrome.canCurrentUserModifyPermissions(allowedRoles);

      // If user cannot create a new one or modify the current existing one, hide write controls
      if(!userRoleCanModify || !chrome.canManageObject()) {
        storyboardConfig.turnHideWriteControlsOn();
      }

      // If user cannot create a new one or modify the current existing one, hide write controls
      const dashboardStateManager = new DashboardStateManager(storyboard, AppState, false, TabbedDashboardViewMode.TYPE);

      $scope.getDashboardState = () => dashboardStateManager;

      $scope.appState = dashboardStateManager.getAppState();

      $scope.containerApi = new DashboardContainerAPI(
        dashboardStateManager,
        (field, value, operator, index) => {
          filterActions.addFilter(field, value, operator, index, dashboardStateManager.getAppState(), filterManager);
          dashboardStateManager.saveState();
        }
      );
      $scope.getContainerApi = () => $scope.containerApi;

      // The 'previouslyStored' check is so we only update the time filter on dashboard open, not during
      // normal cross app navigation.
      if (dashboardStateManager.getIsTimeSavedWithDashboard()) {
        dashboardStateManager.syncTimefilterWithDashboard(timefilter, quickRanges);
      }

      const updateState = () => {
        // Following the "best practice" of always have a '.' in your ng-models –
        // https://github.com/angular/angular.js/wiki/Understanding-Scopes
        $scope.model = {
          query: dashboardStateManager.getQuery(),
          useMargins: dashboardStateManager.getUseMargins(),
          hidePanelTitles: dashboardStateManager.getHidePanelTitles(),
          darkTheme: dashboardStateManager.getDarkTheme(),
          timeRestore: dashboardStateManager.getTimeRestore(),
          title: dashboardStateManager.getTitle(),
          description: dashboardStateManager.getDescription(),
        };
        $scope.panels = dashboardStateManager.getPanels();
        $scope.indexPatterns = dashboardStateManager.getPanelIndexPatterns();
      };

        // Part of the exposed plugin API - do not remove without careful consideration.
      this.appStatus = {
        dirty: !storyboard.id
      };

      dashboardStateManager.registerChangeListener(status => {
        this.appStatus.dirty = status.dirty || !storyboard.id;
        updateState();
      });

      applyFilters(dashboardStateManager.getQuery() || { query: '', language: config.get('search:queryLanguage') });

      function applyFilters(query) {
        // Get the existing filters
        let filters = filterBar.getFilters();

        // If search_string is available, create the query and add it to the filters
        const searchString = chrome.getSearchString();

        if (searchString) {
          filters = _.union(filters, [{
            query: {
              query_string: {
                query: searchString,
                analyze_wildcard: true
              }
            }
          }]);
        }
        // Apply the filters
        dashboardStateManager.applyFilters(query, filters);
        courier.setRootSearchSource(storyboard.searchSource);
      }

      $scope.save = function () {
        $scope.savedStoryboard.allowedRolesJSON = angular.toJson($scope.opts.allowedRoles);
        return saveStoryboard(angular.toJson, timefilter, $scope.savedStoryboard, dashboardStateManager)
          .then(function (id) {
            $scope.kbnTopNav.close('save');
            if (id) {
              notify.info(`Saved storyboard as "${$scope.savedStoryboard.title}"`);
              if ($scope.savedStoryboard.id !== $routeParams.id) {
                kbnUrl.change(createStoryboardEditUrl($scope.savedStoryboard.id));
              } else {
                updateViewMode(TabbedDashboardViewMode.VIEW);
              }
              logUserOperation($http, 'POST', 'dashboard', storyboard.title, storyboard.id);
            }
            return id;
          }).catch(notify.error);
      };


      $scope.showAddPanel = () => {
        dashboardStateManager.setFullScreenMode(false);
        $scope.kbnTopNav.open('add');
      };
      $scope.enterEditMode = () => {
        dashboardStateManager.setFullScreenMode(false);
        $scope.kbnTopNav.click('edit');
      };

      // This gets called whevever mode is changed (cancel, Edit, Save)
      const onChangeViewMode = (newMode) => {
        const isPageRefresh = newMode === dashboardStateManager.getViewMode();
        const isLeavingEditMode = !isPageRefresh && newMode === TabbedDashboardViewMode.VIEW;
        const willLoseChanges = isLeavingEditMode && dashboardStateManager.getIsDirty(timefilter);

        if (!willLoseChanges) {
          updateViewMode(newMode);
          return;
        }

        // This will revert the changes and exit from Edit mode and enter to view mode
        function revertChangesAndExitEditMode() {
          dashboardStateManager.resetState();
          kbnUrl.change($scope.dash.id ? createStoryboardEditUrl($scope.dash.id) : StoryBoardConstants.CREATE_NEW_STORYBOARD_URL);
          updateViewMode(TabbedDashboardViewMode.VIEW);
          if (dashboardStateManager.getIsTimeSavedWithDashboard()) {
            dashboardStateManager.syncTimefilterWithDashboard(timefilter, quickRanges);
          }
        }

        confirmModal(
          getUnsavedChangesWarningMessage(dashboardStateManager.getChangedFilterTypes(timefilter)),
          {
            title: 'Warning',
            onConfirm: revertChangesAndExitEditMode,
            onCancel: _.noop,
            confirmButtonText: 'Yes, lose changes',
            cancelButtonText: 'No, keep working',
            defaultFocusedButton: ConfirmationButtonTypes.CANCEL
          }
        );
      };

      const navActions = {};
      navActions[TopNavIds.HOME] = () =>{
        window.location = `#/${chrome.getUserHomeDashboard()}`;
        onChangeViewMode(TabbedDashboardViewMode.VIEW);
      };

      // Action for REFRESH button in nav bar
      // When ever REFRESH button clicked.
      navActions[TopNavIds.REFRESH] = () =>{
        $scope.refresh();
      };

      navActions[TopNavIds.FULL_SCREEN] = () =>
        dashboardStateManager.setFullScreenMode(true);
      navActions[TopNavIds.EXIT_EDIT_MODE] = () => onChangeViewMode(TabbedDashboardViewMode.VIEW);
      navActions[TopNavIds.ENTER_EDIT_MODE] = () => onChangeViewMode(TabbedDashboardViewMode.EDIT);
      navActions[TopNavIds.CLONE] = () => {
        const currentTitle = $scope.model.title;
        const onClone = (newTitle) => {
          dashboardStateManager.savedDashboard.copyOnSave = true;
          dashboardStateManager.setTitle(newTitle);
          return $scope.save().then(id => {
            // If the save wasn't successful, put the original title back.
            if (!id) {
              $scope.model.title = currentTitle;
              // There is a watch on $scope.model.title that *should* call this automatically but
              // angular is failing to trigger it, so do so manually here.
              dashboardStateManager.setTitle(currentTitle);
            }
            return id;
          });
        };
        showCloneModal(onClone, currentTitle, $rootScope, $compile);
      };

      $scope.timefilter = timefilter;

      $scope.landingPageUrl = () => `#${StoryBoardConstants.LANDING_PAGE_PATH}`;
      $scope.getDashTitle = () => getDashboardTitle(
        dashboardStateManager.getTitle(),
        dashboardStateManager.getViewMode(),
        dashboardStateManager.getIsDirty(timefilter));
      $scope.newDashboard = () => { kbnUrl.change(DashboardConstants.CREATE_NEW_DASHBOARD_URL, {}); };
      $scope.saveState = () => dashboardStateManager.saveState();

      $scope.getShouldShowEditHelp = () => (
        !dashboardStateManager.getPanels().length &&
        dashboardStateManager.getIsEditMode() &&
        !storyboardConfig.getHideWriteControls()
      );

      $scope.getShouldShowViewHelp = () => (
        !dashboardStateManager.getPanels().length &&
        dashboardStateManager.getIsViewMode() &&
        !storyboardConfig.getHideWriteControls()
      );


      timefilter.enabled = true;
      storyboard.searchSource.highlightAll(true);
      storyboard.searchSource.version(true);
      $scope.savedStoryboard.searchSource.highlightAll(true);
      $scope.savedStoryboard.searchSource.version(true);
      courier.setRootSearchSource(storyboard.searchSource);
      updateViewMode(dashboardStateManager.getViewMode());
      updateState();

      function setDarkTheme() {
        chrome.removeApplicationClass(['theme-light']);
        chrome.addApplicationClass('theme-dark');
      }

      function setLightTheme() {
        chrome.removeApplicationClass(['theme-dark']);
        chrome.addApplicationClass('theme-light');
      }

      $scope.refresh = (...args) => {
        $rootScope.$broadcast('fetch');
        courier.fetch(...args);
      };


      // update root source when filters update
      $scope.$listen(filterBar, 'update', function () {
        // Applying the filters to the dashboard. This filters include the filter query corresponds to
        // the configured search_string and the filters available at the filterBar.
        applyFilters($scope.model.query);
      });

      // update data when filters fire fetch event
      $scope.$listen(filterBar, 'fetch', $scope.refresh);

      // This function get called whevever mode is changed (cancel, Edit, Save)
      function updateViewMode(newMode) {
        // If the storyboard is in edit mode then enable delete for each tab.
        if (newMode === TabbedDashboardViewMode.EDIT) {
          $scope.showDelete = true;
        }
        // else If the storyboard is in read only mode then disable delete for all tabs.
        else if (newMode === TabbedDashboardViewMode.VIEW) {
          $scope.showDelete = false;
        }
        $scope.topNavMenu = getTopNavConfig(newMode, navActions, storyboardConfig.getHideWriteControls()); // eslint-disable-line no-use-before-define
        // Set the new mode to the appstate
        dashboardStateManager.switchViewMode(newMode);
        $scope.TabbedDashboardViewMode = newMode;
      }

      $scope.$on('$destroy', () => {
        dashboardStateManager.destroy();
        // Remove dark theme to keep it from affecting the appearance of other apps.
        setLightTheme();
      });

      function updateTheme() {
        dashboardStateManager.getDarkTheme() ? setDarkTheme() : setLightTheme();
      }

      $scope.$watch('model.darkTheme', () => {
        dashboardStateManager.setDarkTheme($scope.model.darkTheme);
        updateTheme();
      });

      $scope.$watch('model.description', () => $scope.savedStoryboard.description = $scope.model.description);
      $scope.$watch('model.title', () => $scope.savedStoryboard.title = $scope.model.title);
      $scope.$watch('model.timeRestore', () => $scope.savedStoryboard.timeRestore = $scope.model.timeRestore);
      $scope.$watch('model.query', $scope.updateQueryAndFetch);
      $scope.updateQueryAndFetch = function (query) {
        // reset state if language changes
        if ($scope.model.query.language && $scope.model.query.language !== query.language) {
          filterBar.removeAll();
          dashboardStateManager.getAppState().$newFilters = [];
        }
        $scope.model.query = migrateLegacyQuery(query);
        // Applying the filters to the dashboard. This filters include the filter query corresponds to
        // the configured search_string and the filters available at the filterBar.
        applyFilters($scope.model.query);
        $scope.refresh();
      };

      $scope.addDash = function (hit, showToast = true) {
        $scope.dashboards.push({ 'id': hit.id, 'name': hit.id });
        $scope.landingTab = hit.id;
        $scope.savedStoryboard.dashboardsJSON = angular.toJson($scope.dashboards);

        if (showToast) {
          notify.info(`Dashboard successfully added to your storyboard`);
        }
      };

      if ($route.current.params && $route.current.params[StoryBoardConstants.NEW_VISUALIZATION_ID_PARAM]) {
        const showToast = false;
        $scope.addDash({ id: $route.current.params[StoryBoardConstants.NEW_VISUALIZATION_ID_PARAM] }, showToast);

        kbnUrl.removeParam(StoryBoardConstants.ADD_VISUALIZATION_TO_DASHBOARD_MODE_PARAM);
        kbnUrl.removeParam(StoryBoardConstants.NEW_VISUALIZATION_ID_PARAM);
      }

      const addNewDash = function addNewDash() {
        kbnUrl.change(
          `${DashboardConstants.CREATE_NEW_DASHBOARD_URL}`);
      };


      $scope.showFilterBar = () => filterBar.getFilters().length > 0 || !dashboardStateManager.getFullScreenMode();

      const currentUser = chrome.getCurrentUser();
      const owner = { 'name': currentUser[0], 'role': currentUser[1], 'permission': currentUser[2] };

      $scope.opts = {
        displayName: storyboard.getDisplayName(),
        dashboard: storyboard,
        objectType: 'storyboard',
        save: $scope.save,
        addDash: $scope.addDash,
        addNewDash,
        timefilter: $scope.timefilter,
        allowedRoles: allowedRoles,
        owner: owner
      };
    }
  };
});