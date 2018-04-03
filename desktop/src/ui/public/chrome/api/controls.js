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

  // Hard coding the tenant and bu ids which will be
  // populated later through api calls.
  const tenantId = 1;
  const buId = 1;
  const BASE_URL = 'vuSmartMaps/api';

  let permanentlyHideChrome = false;
  internals.permanentlyHideChrome = () => {
    permanentlyHideChrome = true;
    internals.visible = false;
  };

  chrome.getIsChromePermanentlyHidden = () => {
    return permanentlyHideChrome;
  };

  /**
   * @param {boolean} display - should the chrome be displayed
   * @return {chrome}
   */
  chrome.setVisible = function (display) {
    if (permanentlyHideChrome) {
      return chrome;
    }
    internals.visible = Boolean(display);
    return chrome;
  };

  /**
   * @return {boolean} - display state of the chrome
   */
  chrome.getVisible = function () {
    if (_.isUndefined(internals.visible)) return !permanentlyHideChrome;
    return internals.visible;
  };

  // Prepare first part of the url using the
  // tenant and bu ids which can be used by
  // different apis to prepare the complete urls.
  chrome.getUrlBase = function () {
    const url = '/' + BASE_URL + '/' + tenantId + '/bu/' + buId;
    return url;
  };

  // This function returns the notification index.
  // We prepare the notification index using the
  // tenant id and bu id.
  chrome.getVunetIndexName = function (indexType) {
    const index = 'vunet-' + tenantId + '-' + buId + '-' + indexType + '-*';
    return index;
  };
}
