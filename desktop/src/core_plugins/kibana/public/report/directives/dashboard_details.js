const _ = require('lodash');

import { FilterManagerProvider } from 'ui/filter_manager';
import { EmbeddableFactoriesRegistryProvider } from 'ui/embeddable/embeddable_factories_registry';
import { Notifier } from 'ui/notify';
import * as filterActions from 'ui/doc_table/actions/filter';
import { DashboardContainerAPI } from '../../dashboard/dashboard_container_api';
import { DashboardStateManager } from '../../dashboard/dashboard_state_manager';
import { DashboardViewportProvider } from '../../dashboard/viewport/dashboard_viewport_provider';
const app = require('ui/modules').get('app/report');
const module = require('ui/modules').get('kibana');

module.directive('dashboardViewportProvider', function (reactDirective) {
  return reactDirective(DashboardViewportProvider);
});

app.directive('reportStoryboard', function (savedStoryboards, $injector) {
  return {
    restrict: 'E',
    require: '^reportApp', // must inherit from the reportApp
    link: function ($scope) {

      function init() {
        const AppState = $injector.get('AppState');
        const Private = $injector.get('Private');
        const notify = new Notifier();
        const timefilter = $injector.get('timefilter');
        const quickRanges = $injector.get('quickRanges');
        const filterManager = Private(FilterManagerProvider);
        // Currently we are not able to render a dashboard directly in pdf report.
        // So we are doing this with the help of the tabbed dashboard.
        // For this, we are using a dummy/empty storyboard object stored in kibana index.
        // Get the "pdf-storyboard" object, add the dashboards to it and render it in the pdf report.
        savedStoryboards.get(
          'pdf-storyboard').then(function (savedStoryboard) {
          const storyboard = savedStoryboard;
          // Basically the storyboard provider was created for tabbed dashboard purpose.
          // So this directive will accept the following 2 params.
          // 1. dashboards - List of dashboards
          // 2. Landing tab - Default dashboard in the above list.

          // If you want to render only one dashboard instead of tabbed dashboard then
          // send the dashboards param as empty list. Storyboard provider will pick
          // the default dashboard from the landing tab param and render it.
          // In reports case, we want to render a single dashboard not tabbed dashboard.
          $scope.dashboards = [];
          const dashboardStateManager = new DashboardStateManager(storyboard, AppState, false, 'storyboard');
          // The 'previouslyStored' check is so we only update the time filter on dashboard open, not during
          // normal cross app navigation.
          if (dashboardStateManager.getIsTimeSavedWithDashboard()) {
            dashboardStateManager.syncTimefilterWithDashboard(timefilter, quickRanges);
          }
          $scope.getDashboardState = () => dashboardStateManager;

          $scope.containerApi = new DashboardContainerAPI(
            dashboardStateManager,
            (field, value, operator, index) => {
              filterActions.addFilter(field, value, operator, index, dashboardStateManager.getAppState(), filterManager);
              dashboardStateManager.saveState();
            }
          );
          $scope.getContainerApi = () => $scope.containerApi;
          const embeddableFactories = Private(EmbeddableFactoriesRegistryProvider);
          $scope.getEmbeddableFactory = panelType => embeddableFactories.byName[panelType];
        }).catch(function (e) {
          notify.error(e);
        });
      }
      init();
    }
  };
});