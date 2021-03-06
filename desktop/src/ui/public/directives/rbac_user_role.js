const module = require('ui/modules').get('kibana');
const chrome = require('ui/chrome');
const notify = require('ui/notify');
import _ from 'lodash';

module.directive('rbacUserRole', function ($http) {

  return {
    restrict: 'EA',
    scope: {
      allowedRoles: '=',
      owner: '<'
    },
    template: require('ui/partials/rbac_user_role.html'),
    link: function ($scope) {
      $scope.rbac_options = false;

      // We need to get all the roles available every time someone is
      // trying to save an object. This is because we need to update the
      // role list in the object if a new role is created or an existing
      // one is deleted.
      // Now get all the roles available
      $scope.vunetAdminRole = 'VunetAdmin';

      const userRolePermissionDetails = [];

      const currentUser = chrome.getCurrentUser();
      // We need to disable 'modify' permission for users with only ViewObject
      // permission and no ManageObject permission
      $scope.isModifyDisabled = (roleName) => {
        const index = userRolePermissionDetails.findIndex(x => x.name === roleName);
        if(userRolePermissionDetails && userRolePermissionDetails.length &&
          userRolePermissionDetails[index].claims.indexOf('ManageObject') === -1) {
          return true;
        }
        return false;
      };

      // Get the first part of the url containing the tenant
      // and bu id to prepare urls for api calls.
      // Example output: /vuSmartMaps/api/1/bu/1/
      const urlBase = chrome.getUrlBase();
      const url = urlBase + '/user_groups/';

      const httpResult = $http({
        method: 'GET',
        url: url
      })
        .then(resp => resp.data)
        .catch(resp => { throw resp.data; });


      httpResult.then(function (data) {

        const userRoles = [];

        if ($scope.allowedRoles.length === 0) {

          // This seems to be a request for a new object, let us create
          // roles information for each existing role and add it. For
          // current user's roles, we automatically set the permission
          // to modify, if the role has ManageObject permission. Or else we set
          // to view if the role has only ViewObject permission.

          _.each(data.user_groups, function (role) {
            // User Roles and Permissions are stored
            const userdetails = { 'name': role.name, 'claims': role.permissions };
            userRolePermissionDetails.push(userdetails);

            //indexOf returns -1 if ViewObject is not found.
            if(role.permissions.indexOf('ViewObject') > -1) {
              const newRole = { 'name': role.name, 'permission': '' };

              // If the role is VunetAdmin, or if the current user belongs 
              // to the role and the role has ManageObject Permission,
              // Set the permission to modify
              if ((currentUser[1].includes(role.name) && role.permissions.includes('ManageObject')) || role.name === $scope.vunetAdminRole) {
                newRole.permission = 'modify';
              }
              
              // If the current user belongs to the role and the role has ViewObject Permission
              // Set the permission to view
              else if (currentUser[1].includes(role.name) && role.permissions.includes('ViewObject')){
                newRole.permission = 'view'; 
              }
              userRoles.push(newRole);
            }
          });

        } else {
          // Iterate on all roles from backend which has 'ViewObject'
          // claim and check it in current
          // allowed-roles list, if it exists there, copy it from
          // allowed-roles list otherwise create a new one and push it
          // With this logic, we should finally have the same roles in
          // the allowed roles list as what we have in backend
          _.each(data.user_groups, function (role) {
            const userdetails = { 'name': role.name, 'claims': role.permissions };
            userRolePermissionDetails.push(userdetails);
            let roleFound = false;
            if(role.permissions.indexOf('ViewObject') > -1) {
              _.each($scope.allowedRoles, function (allowRole) {
                if (role.name === allowRole.name) {
                  userRoles.push(allowRole);
                  roleFound = true;
                }
              });

              // If we didn't found this role in existing allowedRole,
              // it means this is a newly created role
              if (!roleFound) {
                const newRole = { 'name': role.name, 'permission': '' };
                userRoles.push(newRole);
              }
            }
          });
        }
        $scope.allowedRoles = userRoles;
      }).catch(function () {
        notify.error('Failed to find user roles');
      });

      $scope.toggle_rbac_options = function () {
        $scope.rbac_options = !$scope.rbac_options;
      };
    }
  };
});
