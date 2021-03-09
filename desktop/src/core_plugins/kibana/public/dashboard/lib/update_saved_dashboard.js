import _ from 'lodash';
import { FilterUtils } from './filter_utils';
import ConfirmPermissionUpdate from './confirm_permission_update.js';
import { updateVisualizationPermissions } from './update_visualization_permissions';
import { updateSavedsearchPermissions } from './update_savedsearch_permissions';

export async function updateSavedDashboard(
  savedDashboard,
  savedVisualizations,
  savedSearches,
  appState,
  uiState,
  timeFilter,
  toJson,
  $uibModal,
  savedDashboards) {
  savedDashboard.title = appState.title;
  savedDashboard.description = appState.description;
  savedDashboard.timeRestore = appState.timeRestore;
  savedDashboard.panelsJSON = toJson(appState.panels);
  savedDashboard.uiStateJSON = toJson(uiState.getChanges());
  savedDashboard.optionsJSON = toJson(appState.options);

  const panelData = JSON.parse(savedDashboard.panelsJSON);
  //This visualizationIds is to store dashbaord linked visualization id's

  const visualizationIds = [];
  //This savedSearchIds is to store dashbaord linked visualization id's

  const savedSearchIds = [];
  //This is to store the boolean result of any visulization is upgraded to higher permissions or not

  let isVisualizationsUpdated = false;
  //This is to store the boolean result of any savedSeaches is upgraded to higher permissions or not

  let isSavedSearchUpdated = false;
  //This is to store the updated visualizations

  let updatedVisualizations = [];
  //This is to store the updated saved searches

  let updatedSavedSearches = [];
  const dashboardPermissions = savedDashboard.allowedRolesJSON;
  const dashboardUpdatedPermissions = JSON.parse(dashboardPermissions);
  let isDashboardPermissionChanged = false;
  let dashboardResultRolesData = [];

  //Checking whether the savedDashboard permissions are modified are not with the before modified dashabord data
  await savedDashboards.get(savedDashboard.id).then(async function (dashboardResult) {
    if (dashboardResult.allowedRolesJSON === '') {
      isDashboardPermissionChanged = true;
    } else {
      dashboardResultRolesData = JSON.parse(dashboardResult.allowedRolesJSON);
      await dashboardResultRolesData.map(async (permissionBeforeUpdate) => {
        await dashboardUpdatedPermissions.map((permissionAfterUpdate) => {
          if(permissionBeforeUpdate.name === permissionAfterUpdate.name) {
            if (permissionBeforeUpdate.permission !== permissionAfterUpdate.permission) {
              isDashboardPermissionChanged = true;
            }
          }
        });
      });
    }
  });

  if (isDashboardPermissionChanged === true) {
    //Getting visualisation and savedSearch Id's into individual arrays
    //as we can create a dashboard with both visualizations and savedSearches
    panelData.map(function (value) {
      if (value.type === 'visualization') {
        visualizationIds.push(value.id);
      } else {
        savedSearchIds.push(value.id);
      }
    });

    //Getting updated visualization objects
    const selectedVisualizationsData = Promise.resolve(
      updateVisualizationPermissions(dashboardPermissions, visualizationIds, savedVisualizations)
    );

    //Getting updated savedsearch objects
    const selectedSavedSearchesData = Promise.resolve(
      updateSavedsearchPermissions(dashboardPermissions, savedSearchIds, savedSearches)
    );

    await selectedVisualizationsData.then(function (result) {
      isVisualizationsUpdated = result.showModal;
      updatedVisualizations = result.visualizations;
    });
    await selectedSavedSearchesData.then(function (result) {
      isSavedSearchUpdated = result.showModal;
      updatedSavedSearches = result.savedSearches;
    });

    const showConfirmMessage = (isVisualizationsUpdated === true || isSavedSearchUpdated === true) ? true : false;
    //When atleast one visualization/savedSearch user role has lower permissions than the dashboard user permissions then open a modal
    if (showConfirmMessage === true) {
      const modalInstance = $uibModal.open({
        animation: true,
        template: require('./confirm_permission_update.html'),
        controller: ConfirmPermissionUpdate,
        resolve: {
          showConfirmMessage: function () { return showConfirmMessage; }
        },
        windowClass: 'confirm-permission-update-modal',
      });
      //Based on modal result updating visualizations/savedSearches user role permissions
      await modalInstance.result
        .then(async function () {
        //Updating visulization/savedSearch user role permissions to the level of dashboard user role permissions
          await updatedVisualizations.map(async (eachVisualization) => {
            await eachVisualization.save();
          });
          await updatedSavedSearches.map(async (eachSavedSearch) => {
            await eachSavedSearch.save();
          });
        }, function () {
        });
    }
  }

  savedDashboard.timeFrom = savedDashboard.timeRestore ?
    FilterUtils.convertTimeToString(timeFilter.time.from)
    : undefined;
  savedDashboard.timeTo = savedDashboard.timeRestore ?
    FilterUtils.convertTimeToString(timeFilter.time.to)
    : undefined;
  const timeRestoreObj = _.pick(timeFilter.refreshInterval, ['display', 'pause', 'section', 'value']);
  savedDashboard.refreshInterval = savedDashboard.timeRestore ? timeRestoreObj : undefined;
}
