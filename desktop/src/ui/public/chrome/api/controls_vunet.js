
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
