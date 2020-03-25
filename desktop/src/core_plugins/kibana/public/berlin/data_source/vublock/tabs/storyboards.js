import { uiModules } from 'ui/modules';
import { FilterManagerProvider } from 'ui/filter_manager';
import { EmbeddableFactoriesRegistryProvider } from 'ui/embeddable/embeddable_factories_registry';
import { Notifier } from 'ui/notify';
import * as filterActions from 'ui/doc_table/actions/filter';
import '../styles/vublock.less';
import { DashboardContainerAPI } from
  '../../../../dashboard/dashboard_container_api.js';
import { DashboardStateManager } from
  '../../../../dashboard/dashboard_state_manager';
const app = uiModules.get('app/berlin');

// This directive takes care of displaying storyboards information
app.directive('vuBlockStoryboards', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockStoryboards',
    controller: vuBlockStoryboards,
  };
});

function vuBlockStoryboards($scope, savedStoryboards, $injector) {
  const AppState = $injector.get('AppState');
  const Private = $injector.get('Private');
  const notify = new Notifier();
  const timefilter = $injector.get('timefilter');
  const quickRanges = $injector.get('quickRanges');
  const filterManager = Private(FilterManagerProvider);

  // We always get a list with one storyboard in it.
  // Fetching the first storyboard from it.
  const firstObj = $scope.vuBlock.story_boards && $scope.vuBlock.story_boards[0];
  // Get the storyboard object
  savedStoryboards.get(
    firstObj.id).then(function (savedStoryboard) {
    const storyboard = savedStoryboard;
    $scope.dashboards = [];

    if (JSON.parse(savedStoryboard.dashboardsJSON).length > 0) {
      $scope.dashboards = JSON.parse(storyboard.dashboardsJSON);
      $scope.landingTab = $scope.dashboards[0].id;
    }

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