//This function is to update each visualization user role permission
//if dashboard user role permissions are higher than visualization user role permissions
export async function updateVisualizationPermissions(dashboardPermissions, visualizationIds, savedVisualizations) {
  //This will have the current dashboard user role permisisons
  const dashboardRolesJson = JSON.parse(dashboardPermissions);

  //This is permissions object to cross check each linked visualization with the dashboard permisions
  const PermissionPriority = { 'modify': 1, 'view': 2, '': 3 };

  //This is a flag whether we need to display the confirmPermisionsUpdate modal or not
  let showConfirmMessage = false;

  //This is a list which will have all inked visualizations list
  const selectedPanelsData = [];

  //This is an object having updated visualizations list and showConfirmMessage
  const updatedVisualizationsList = {};

  //Getting each visualization User Role permissions and comparing with dashboardUserRoles permissions
  //Assigning updated visualization user role permissions to selectedPanelsData
  await Promise.all(visualizationIds.map(async (id) => {
    await savedVisualizations.get(id).then(function (visualizationResult) {
      const visualizationRolesJson = JSON.parse(visualizationResult.allowedRolesJSON);
      visualizationRolesJson.map((vizRole, vizIndex) => {
        dashboardRolesJson.map((dashboardRole) => {
          if(vizRole.name === dashboardRole.name) {
            if(PermissionPriority[vizRole.permission] > PermissionPriority[dashboardRole.permission]) {
              showConfirmMessage = true;
              visualizationRolesJson[vizIndex].permission = dashboardRole.permission;
            }
          }
        });
      });
      visualizationResult.allowedRolesJSON = JSON.stringify(visualizationRolesJson);
      selectedPanelsData.push(visualizationResult);
    });
  }));

  updatedVisualizationsList.showModal = showConfirmMessage;
  updatedVisualizationsList.visualizations = selectedPanelsData;

  return updatedVisualizationsList;
}
