import angular from 'angular';
import { DashboardContainerAPI } from '../../dashboard/dashboard_container_api';
import { DashboardStateManager } from '../../dashboard/dashboard_state_manager';
import { DashboardViewportProvider } from '../../dashboard/viewport/dashboard_viewport_provider';
import { EmbeddableFactoriesRegistryProvider } from 'ui/embeddable/embeddable_factories_registry';
import { TabbedDashboardViewMode } from '../../dashboard/dashboard_view_mode';
import { FilterManagerProvider } from 'ui/filter_manager';
import * as filterActions from 'ui/doc_table/actions/filter';
import { store } from '../../store';
import { SavedObjectNotFound } from 'ui/errors';

const module = require('ui/modules').get('kibana');

module.directive('dashboardViewportProvider', function (reactDirective) {
  return reactDirective(DashboardViewportProvider);
});

module.directive('storyboardProvider', function (savedDashboards, $injector, Notifier) {
  return {
    template: require('plugins/kibana/storyboard/directives/storyboard_provider.html'),
    restrict: 'AE',
    scope: {
      dashBoards: '=',
      landingTab: '=',
      showDelete: '=',
      onTabChange: '&',
      getEmbeddableFactory: '=',
      getContainerApi: '='
    },

    link: function (scope) {
      const AppState = $injector.get('AppState');
      const Private = $injector.get('Private');
      const notify = new Notifier({ location: 'Alert' });
      const filterManager = Private(FilterManagerProvider);
      const embeddableFactories = Private(EmbeddableFactoriesRegistryProvider);
      scope.dashboardExists = true;
      scope.dashboards = scope.dashBoards;
      getDashboard(scope.landingTab);

      // id - Dashboard's id
      // This function gets called when a tab is selected...
      // This will get the dashboard for the given dashboard's id
      scope.onTabChange = function (title) {
        getDashboard(title);
      };

      // id - Index position of the tab which is to be deleted
      // This function gets called when a tab is deleted by clicking the close button...
      scope.onTabRemove = function (index) {
        scope.dashBoards.splice(index, 1);
        scope.$parent.savedStoryboard.dashboardsJSON = angular.toJson(scope.dashBoards);
      };

      // This function gets the dashboard for the given dashboard's id
      function getDashboard(title) {
        Promise.resolve(savedDashboards.get(title))
          .then(function (response) {
            scope.storyboard = response;
            scope.dashboardExists = true;
            scope.getEmbeddableFactory = panelType => embeddableFactories.byName[panelType];
            //Before rendering the new dashboard, remove the current dashboard and panels
            //from the store.
            store.getState().panels = {};
            store.getState().dashboard = {};
            scope.objectType = TabbedDashboardViewMode.TYPE;
            const dashboardStateManager = new DashboardStateManager(scope.storyboard, AppState, true, TabbedDashboardViewMode.TYPE);
            const containerApi = new DashboardContainerAPI(
              dashboardStateManager,
              (field, value, operator, index) => {
                filterActions.addFilter(field, value, operator, index, dashboardStateManager.getAppState(), filterManager);
                dashboardStateManager.saveState();
              }
            );
            scope.getContainerApi = () => containerApi;
          })
          .catch((error) => {
            if (error instanceof SavedObjectNotFound) {
              scope.dashboardExists = false;
              Promise.resolve(savedDashboards.get()
                .then(function (response) {
                  scope.storyboard = response;
                  const dashboardStateManager = new DashboardStateManager(scope.storyboard, AppState, true, TabbedDashboardViewMode.TYPE);
                  dashboardStateManager.saveState();
                  const containerApi = new DashboardContainerAPI(
                    dashboardStateManager,
                    (field, value, operator, index) => {
                      filterActions.addFilter(field, value, operator, index, dashboardStateManager.getAppState(), filterManager);
                      dashboardStateManager.saveState();
                    }
                  );
                  scope.getContainerApi = () => containerApi;
                })
              );
            }
            else {
              // Display the error message to the user.
              notify.error(error);
              throw error;
            }
          });
      }
    }
  };
});