import _ from 'lodash';

// eslint-disable-next-line @elastic/kibana-custom/no-default-export
export default function (chrome, internals) {
  /**
   * ui/chrome Controls API
   *
   *   Exposes controls for the Kibana chrome
   *
   *   Visible
   *     determines if the Kibana chrome should be displayed
   */

  /**
   * @return {current user, role and permission} - get current user
   */
  chrome.getCurrentUser = function () {
    return [internals.userName, internals.userRole, internals.userPermission];
  };

  /*
   * Is current user has admin permission
   */
  chrome.isCurrentUserAdmin = function () {
    if (internals.userPermission === 'admin') {
      return true;
    } else {
      return false;
    }
  };

  /**
   * @return {current user, role and permission} - Return True if the current
   * logged in user is allowed to create new objects
   */
  chrome.canCurrentUserCreateObject = function () {
    if (internals.userPermission === 'modify' || internals.userPermission === 'admin') {
      return true;
    } else {
      return false;
    }
  };

  // Find if the current logged in user can view or modify a object. We figure this out
  // by checking if the current user's user-role is allowed to view or modify the
  // object
  chrome.canCurrentUserViewModify = function (allowedRoles) {

    // For a new object, let us allow
    if (allowedRoles.length === 0) {
      return true;
    } else {

      let userAllowedToViewModify = false;

      // If the user has a view or modify permission on this object, we allow him to
      // modify the permissions as well
      _.each(allowedRoles, function (role) {
        if ((role.name === internals.userRole && role.permission === 'view') ||
            (role.name === internals.userRole && role.permission === 'modify')) {
          userAllowedToViewModify = true;
        }
      });

      return userAllowedToViewModify;
    }
  };

  // Find if the current logged in user can modify a object. We figure this out
  // by checking if the current user's user-role is allowed to modify the
  // object
  chrome.canCurrentUserModifyPermissions = function (allowedRoles) {

    // For a new object, let us allow
    if (allowedRoles.length === 0) {
      return true;
    } else {

      let userAllowedToModify = false;

      // If the user has a modify permission on this object, we allow him to
      // modify the permissions as well
      _.each(allowedRoles, function (role) {
        if (role.name === internals.userRole && role.permission === 'modify') {
          userAllowedToModify = true;
        }
      });

      return userAllowedToModify;
    }
  };

  /*
   * Get Dashboard name configured for the User
   */
  chrome.getUserHomeDashboard = function () {
    if (internals.userHomeDashboard === '') {
      return '/' + chrome.getInjected('kbnDefaultAppId', 'dashboard');
    }

    return '/dashboard/' + internals.userHomeDashboard;
  };

  /*
   * Get shipper URL
   */
  chrome.getShipperUrl = function () {
    return internals.shipperUrl;
  };

}
