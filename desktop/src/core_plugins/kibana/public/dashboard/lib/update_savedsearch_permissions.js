//This function is to update each savedSearches user role permission
//if dashboard user role permissions are higher than savedSearches user role permissions
export async function updateSavedsearchPermissions(dashboardPermissions, savedSearchIds, savedSearches) {
  //This will have the current dashboard user role permisisons
  const dashboardRolesJson = JSON.parse(dashboardPermissions);

  //This is permissions object to cross check each linked saved search with the dashboard permisions
  const PermissionPriority = { 'modify': 1, 'view': 2, '': 3 };

  //This is a flag whether we need to display the confirmPermisionsUpdate modal or not
  let showConfirmMessage = false;

  //This is a list which will have all inked saved searches list
  const selectedPanelsData = [];

  //This is an object having updated saved searches list and showConfirmMessage
  const updatedSavedSearchesList = {};

  //Getting each savedSearchUserRoles permissions and comparing with dashboardUserRoles permissions
  //Assigning updated savedSearch user role permissions to selectedPanelsData
  await Promise.all(savedSearchIds.map(async (id) => {
    await savedSearches.get(id).then(function (savedSearchResult) {
      const savedSearchRolesJson = JSON.parse(savedSearchResult.allowedRolesJSON);
      savedSearchRolesJson.map((searchRole, searchIndex) => {
        dashboardRolesJson.map((dashboardRole) => {
          if(searchRole.name === dashboardRole.name) {
            if(PermissionPriority[searchRole.permission] > PermissionPriority[dashboardRole.permission]) {
              showConfirmMessage = true;
              savedSearchRolesJson[searchIndex].permission = dashboardRole.permission;
            }
          }
        });
      });
      savedSearchResult.allowedRolesJSON = JSON.stringify(savedSearchRolesJson);
      selectedPanelsData.push(savedSearchResult);
    });
  }));

  updatedSavedSearchesList.showModal = showConfirmMessage;
  updatedSavedSearchesList.savedSearches = selectedPanelsData;

  return updatedSavedSearchesList;
}