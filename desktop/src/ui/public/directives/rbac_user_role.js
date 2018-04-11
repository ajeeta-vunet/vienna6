const module = require('ui/modules').get('kibana');
const chrome = require('ui/chrome');
const notify = require('ui/notify');
import _ from 'lodash';

module.directive('rbacUserRole', function ($http) {

  return {
    restrict: 'EA',
    scope: {
      allowedRoles: '='
    },
    template: require('ui/partials/rbac_user_role.html'),
    link: function ($scope) {
      $scope.rbac_options = false;

      // We need to get all the roles available every time someone is
      // trying to save an object. This is because we need to update the
      // role list in the object if a new role is created or an existing
      // one is deleted.
      // Now get all the roles available
      const currentUser = chrome.getCurrentUser();

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
          // current user's role, we automatically set the permission
          // to modify
          _.each(data.user_groups, function (role) {
            const newRole = { 'name': role.name, 'permission': '' };
            // If the role is same as current user, mark the
            // permission as 'modify'
            if (role.name === currentUser[1]) {
              newRole.permission = 'modify';
            }
            userRoles.push(newRole);
          });

        } else {

          // Iterate on all roles from backend and check it in current
          // allowed-roles list, if it exists there, copy it from
          // allowed-roles list otherwise create a new one and push it
          // With this logic, we should finally have the same roles in
          // the allowed roles list as what we have in backend
          _.each(data.user_groups, function (role) {
            let roleFound = false;
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
