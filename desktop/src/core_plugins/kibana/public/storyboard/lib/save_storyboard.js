import { updateSavedStoryboard } from './update_saved_storyboard';

/**
 * Saves the storyboard.
 * @param toJson {function} A custom toJson function. Used because the previous code used
 * the angularized toJson version, and it was unclear whether there was a reason not to use
 * JSON.stringify
 * @param timeFilter
 * @param storyboard
 * @param dashboardStateManager {DashboardStateManager}
 * @returns {Promise<string>} A promise that if resolved, will contain the id of the newly saved
 * dashboard.
 */
export function saveStoryboard(toJson, timeFilter, storyboard, dashboardStateManager) {
  dashboardStateManager.saveState();
  const dashboard = dashboardStateManager.savedDashboard;
  storyboard.searchSource = dashboard.searchSource;
  const appState = dashboardStateManager.appState;
  updateSavedStoryboard(storyboard, appState, dashboardStateManager.uiState, timeFilter, toJson);
  return storyboard.save()
    .then((id) => {
      return id;
    });
}
