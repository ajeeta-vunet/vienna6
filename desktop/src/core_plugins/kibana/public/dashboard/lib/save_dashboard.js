import { updateSavedDashboard } from './update_saved_dashboard';

/**
 * Saves the dashboard.
 * @param toJson {function} A custom toJson function. Used because the previous code used
 * the angularized toJson version, and it was unclear whether there was a reason not to use
 * JSON.stringify
 * @param timeFilter
 * @param dashboardStateManager {DashboardStateManager}
 * @returns {Promise<string>} A promise that if resolved, will contain the id of the newly saved
 * dashboard.
 */
export async function saveDashboard(toJson, timeFilter, dashboardStateManager, savedVisualizations, savedSearches, $uibModal, savedDashboards) {

  dashboardStateManager.saveState();

  const savedDashboard = dashboardStateManager.savedDashboard;
  const appState = dashboardStateManager.appState;

  await Promise.resolve(updateSavedDashboard(
    savedDashboard,
    savedVisualizations,
    savedSearches,
    appState,
    dashboardStateManager.uiState,
    timeFilter,
    toJson,
    $uibModal,
    savedDashboards
  ));
  return savedDashboard.save()
    .then((id) => {
      dashboardStateManager.lastSavedDashboardFilters = dashboardStateManager.getFilterState();
      dashboardStateManager.resetState();
      return id;
    });
}
