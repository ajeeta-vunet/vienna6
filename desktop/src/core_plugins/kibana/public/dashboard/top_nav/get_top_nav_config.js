import { DashboardViewMode, TabbedDashboardViewMode } from '../dashboard_view_mode';
import { TopNavIds } from './top_nav_ids';

/**
 * @param {DashboardMode} dashboardMode.
 * @param actions {Object} - A mapping of TopNavIds to an action function that should run when the
 * corresponding top nav is clicked.
 * @param hideWriteControls {boolean} if true, does not include any controls that allow editing or creating objects.
 * @return {Array<kbnTopNavConfig>} - Returns an array of objects for a top nav configuration, based on the
 * mode.
 */
export function getTopNavConfig(dashboardMode, actions, hideWriteControls) {
  switch (dashboardMode) {
    case DashboardViewMode.VIEW:
      return (
        hideWriteControls ?
          [
            // getFullScreenConfig(actions[TopNavIds.FULL_SCREEN])
            getRefreshConfig(actions[TopNavIds.REFRESH]), //'Refresh button was needed for view users also.
          ]
          : [
            getHomeConfig(actions[TopNavIds.HOME]),
            getRefreshConfig(actions[TopNavIds.REFRESH]),
            // Hiding the 'Full Screen' and 'Share' options
            //getFullScreenConfig(actions[TopNavIds.FULL_SCREEN]),
            //getShareConfig(),
            //getCloneConfig(actions[TopNavIds.CLONE]),
            getEditConfig(actions[TopNavIds.ENTER_EDIT_MODE]),
          ]
      );
    case DashboardViewMode.EDIT:
      return [
        getHomeConfig(actions[TopNavIds.HOME]),
        getRefreshConfig(actions[TopNavIds.REFRESH]),
        getSaveConfig(),
        getViewConfig(actions[TopNavIds.EXIT_EDIT_MODE]),
        getAddConfig(),
        getOptionsConfig(),
        // Hiding the 'Share' option in 'Edit' mode.
        //getShareConfig()
      ];
    default:
      return [];
  }
}

export function getTabbedDashboardConfig(dashboardMode, actions, hideWriteControls) {
  switch (dashboardMode) {
    case TabbedDashboardViewMode.VIEW:
      return (
        hideWriteControls ?
          [
            // getFullScreenConfig(actions[TopNavIds.FULL_SCREEN])
            getRefreshConfig(actions[TopNavIds.REFRESH]), //'Refresh button was needed for view users also.
          ]
          : [
            getHomeConfig(actions[TopNavIds.HOME]),
            getRefreshConfig(actions[TopNavIds.REFRESH]),
            getEditConfig(actions[TopNavIds.ENTER_EDIT_MODE]),
          ]
      );
    case TabbedDashboardViewMode.EDIT:
      return [
        getHomeConfig(actions[TopNavIds.HOME]),
        getRefreshConfig(actions[TopNavIds.REFRESH]),
        getSaveConfig(),
        getViewConfig(actions[TopNavIds.EXIT_EDIT_MODE]),
        getAddTabbedDashboardConfig(),
        getOptionsConfig(),
      ];
    default:
      return [];
  }
}
// function getFullScreenConfig(action) {
//   return {
//     key: 'full screen',
//     description: 'Full Screen Mode',
//     testId: 'dashboardFullScreenMode',
//     run: action
//   };
// }

/**
 * @returns {kbnTopNavConfig}
 */
function getEditConfig(action) {
  return {
    key: 'edit',
    description: 'Switch to edit mode',
    testId: 'dashboardEditMode',
    run: action
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getSaveConfig() {
  return {
    key: 'save',
    description: 'Save your dashboard',
    testId: 'dashboardSaveMenuItem',
    template: require('plugins/kibana/dashboard/top_nav/save.html')
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getViewConfig(action) {
  return {
    key: 'cancel',
    description: 'Cancel editing and switch to view-only mode',
    testId: 'dashboardViewOnlyMode',
    run: action
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
// function getCloneConfig(action) {
//   return {
//     key: 'clone',
//     description: 'Create a copy of your dashboard',
//     testId: 'dashboardClone',
//     run: action
//   };
// }

/**
 * @returns {kbnTopNavConfig}
 */
function getAddConfig() {
  return {
    key: TopNavIds.ADD,
    description: 'Add a panel to the dashboard',
    testId: 'dashboardAddPanelButton',
    template: require('plugins/kibana/dashboard/top_nav/add_panel.html')
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getAddTabbedDashboardConfig() {
  return {
    key: TopNavIds.ADD,
    description: 'Add a dashboard to the storyboard',
    testId: 'StoryboardAddDashboardButton',
    template: require('plugins/kibana/dashboard/top_nav/add_panel.html')
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
// function getShareConfig() {
//   return {
//     key: TopNavIds.SHARE,
//     description: 'Share Dashboard',
//     testId: 'dashboardShareButton',
//     template: require('plugins/kibana/dashboard/top_nav/share.html')
//   };
// }

/**
 * @returns {kbnTopNavConfig}
 */
function getOptionsConfig() {
  return {
    key: TopNavIds.OPTIONS,
    description: 'Options',
    testId: 'dashboardOptionsButton',
    template: require('plugins/kibana/dashboard/top_nav/options.html')
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getHomeConfig(action) {
  return {
    key: 'home',
    description: 'Home',
    testId: 'dashboardHome',
    run: action
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getRefreshConfig(action) {
  return {
    key: 'refresh',
    description: 'REFRESH',
    testId: 'dashboardRefresh',
    run: action
  };
}
