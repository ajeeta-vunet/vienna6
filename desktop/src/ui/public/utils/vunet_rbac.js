import _ from 'lodash';

// Function called to check if modify permission is available for
// save/delete to happen
export function rbacCheckForModifyPermission(chrome, type, title, visState, allowedRoles, permissionList) {

  // Verify whether we should allow this user to load this object or not
  // Get the current user
  const currentUser = chrome.getCurrentUser();

  // An admin is allowed to load and save everything..
  if (currentUser[2] === 'admin') {
    return true;
  }

  let checkPermission = true;
  let operAllowed = false;
  // There is an exception for category visualization and home dashboards
  if (type === 'dashboard') {
    if (title === 'Home') {
      checkPermission = false;
    }
  }
  else if (type === 'visualization') {
    // Allow category dashboards irrespective of permissions
    // var visState = JSON.parse(visState);
    if (visState.type === 'category') {
      checkPermission = false;
    }
  }

  if (checkPermission) {
    // Add the code to check if we should allow this or not
    _.each(allowedRoles, function (role) {
      if (role.name === currentUser[1] && _.contains(permissionList, role.permission)) {
        operAllowed = true;
      }
    });
  } else {
    operAllowed = true;
  }

  return operAllowed;
}
