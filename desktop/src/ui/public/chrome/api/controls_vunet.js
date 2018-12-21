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

  /*
   * Returns TRUE if the current user belongs to super Tenant and BU
   */
  chrome.isUserFromSuperTenant = function () {
    return (internals.tenantId === '1' && internals.buId === '1');
  };

  /*
   * This function is called to fetch the Tenant and BU id for the logged in
   * user
   */
  chrome.getTenantBu = function () {
    return [internals.tenantId, internals.buId];
  };

  // Our Base URL
  const BASE_URL = 'vuSmartMaps/api';

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
    // If the home dashboard is configured for the user return it
    if (internals.userHomeDashboard) {
      const userHomeDashboard = JSON.parse(internals.userHomeDashboard);
      return 'dashboard/' + userHomeDashboard.id;
    } else {
      // If no home dashboard is configured for the user return the
      // default app id configured in the config/kibana.yml
      return chrome.getInjected('kbnDefaultAppId', 'dashboard');
    }
  };

  /*
   * Get shipper URL
   */
  chrome.getShipperUrl = function () {
    return internals.shipperUrl;
  };

  // Prepare first part of the url using the
  // tenant and bu ids which can be used by
  // different apis to prepare the complete urls.
  chrome.getUrlBase = function () {
    const url = '/' + BASE_URL + '/' + internals.tenantId + '/bu/' + internals.buId;
    return url;
  };

  // This function returns the notification index.
  // We prepare the notification index using the
  // tenant id and bu id.
  chrome.getVunetIndexName = function (indexType) {
    const index = 'vunet-' + internals.tenantId + '-' + internals.buId + '-' + indexType + '-*';
    return index;
  };

  // This function returns the search string configured
  // for a given user role.
  chrome.getSearchString = function () {
    let searchString = '';
    if(internals.searchString) {
      searchString = internals.searchString;
    }
    return searchString;
  };

  // Prepare tenant url using the tenant id which can be used by
  // different apis to prepare the complete urls.
  // It has been created for email group. We can use this for
  // other apis in the feature.
  chrome.getTenantUrlBase = function () {
    const url = '/' + BASE_URL + '/' + internals.tenantId;
    return url;
  };

}
