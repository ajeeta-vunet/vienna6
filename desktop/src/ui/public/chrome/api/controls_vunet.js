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
  let loggedInUserClaimList = [];
  loggedInUserClaimList = internals.userPermission.split(',');

  /*
   * Returns TRUE if the current user belongs to super Tenant and BU
   */
  chrome.isUserFromSuperTenant = function () {
    return (internals.tenantId === '1' && internals.buId === '1');
  };



  // Defining the value of session timeout but later it needs to come in req.headers (internals)
  chrome.getSessionIdleTimeout =  function () {
    return 900000;
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
        if ((internals.userRole.includes(role.name) && role.permission === 'view') ||
            (internals.userRole.includes(role.name) && role.permission === 'modify')) {
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
        if (internals.userRole.includes(role.name) && role.permission === 'modify') {
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

  /*
  * To see if the current user has ViewObject claim
  */
  chrome.canViewObject = function () {
    if(loggedInUserClaimList.indexOf('ViewObject') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageObject' claim
  */
  chrome.canManageObject = function () {
    if(loggedInUserClaimList.indexOf('ManageObject') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageDataSources' claim
  */
  chrome.canManageDataSources = function () {
    if(loggedInUserClaimList.indexOf('ManageDataSources') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageDataSettings' claim
  */
  chrome.canManageDataSettings = function () {
    if(loggedInUserClaimList.indexOf('ManageDataSettings') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageDataEnrichment' claim
  */
  chrome.canManageDataEnrichment = function () {
    if(loggedInUserClaimList.indexOf('ManageDataEnrichment') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageFiles' claim
  */
  chrome.canManageFiles = function () {
    if(loggedInUserClaimList.indexOf('ManageFiles') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManagePreferences' claim
  */
  chrome.canManagePreferences = function () {
    if(loggedInUserClaimList.indexOf('ManagePreferences') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageImages' claim
  */
  chrome.canManageImages = function () {
    if(loggedInUserClaimList.indexOf('ManageImages') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageUsers' claim
  */
  chrome.canManageUsers = function () {
    if(loggedInUserClaimList.indexOf('ManageUsers') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageLicense' claim
  */
  chrome.canManageLicense = function () {
    if(loggedInUserClaimList.indexOf('ManageLicense') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'Manage Agent' claim
  */
  chrome.canManageAgent = function () {
    if(loggedInUserClaimList.indexOf('ManageAgent') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'DataFetchAPIs' claim
  */
  chrome.canDataFetchAPIs = function () {
    if(loggedInUserClaimList.indexOf('DataFetchAPIs') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageDiagnostic' claim
  */
  chrome.canManageDiagnostic = function () {
    if(loggedInUserClaimList.indexOf('ManageDiagnostic') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the current user has 'ManageEvents' claim
  */
  chrome.canManageEvents = function () {
    if(loggedInUserClaimList.indexOf('ManageEvents') > -1) {
      return true;
    }
    return false;
  };

  /*
  * To see if the given sidebar tab should be visible to the current user.
  */
  chrome.hideShowSideBarTab = function (tabClaimList) {
    let show = false;

    tabClaimList.forEach(element => {
      if(loggedInUserClaimList.indexOf(element) > -1) {
        show = true;
      }
    });
    if(show === true) {
      return true;
    }
    else{
      return false;
    }
  };
  //The function will return the corresponding home page
  //according to the user claims.
  chrome.userHomePage = function () {
    switch(true) {
      case chrome.canViewObject():
      //ManageObject user will have ViewObject claim by default
      //Therefore it is not needed to check for ManageObject
        return chrome.getUserHomeDashboard();
        break;
      case chrome.canManageDataSources():
        return 'berlin/data_source/configuration';
        break;
      case chrome.canManageDataSettings():
        return 'berlin/data_source/storage';
        break;
      case chrome.canManageDataEnrichment():
        return 'berlin/data_source/enrichment/';
        break;
      case chrome.canManageFiles():
        return 'berlin/data_source/files';
        break;
      case chrome.canManagePreferences():
        return 'berlin/preferences';
        break;
      case chrome.canManageUsers():
        return 'berlin/user';
        break;
      case chrome.canManageLicense():
      case chrome.canManageAgent():
      case chrome.canDataFetchAPIs():
      case chrome.canManageDiagnostic():
        return 'berlin/about';
        break;
    }
  };
}
