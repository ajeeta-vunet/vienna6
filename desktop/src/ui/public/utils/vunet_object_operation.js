import _ from 'lodash';

export function updateVunetObjectOperation(selectedItems, objType, $http, action, chrome) {

  // Now that deletion has gone through, let us tell
  // Backend about the items that have been deleted..
  _.map(selectedItems, function (item) {
    const tenantBu = chrome.getTenantBu();
    let url = '';
    let data = '';
    if (objType === 'alert') {
      const alertId = 'alert:' + item.id;
      data = { 'alert_id': alertId, 'alert_title': item.title, 'action': action, 'tenant_id': tenantBu[0], 'bu_id': tenantBu[1] };
      url = '/vuSmartMaps/api/alert_status/';
    } else if (objType === 'anomaly') {
      const anomalyId = 'anomaly:' + item.id;
      url = '/vuSmartMaps/api/anomaly_status/';
      data = { 'detector_id': anomalyId, 'detector_title': item.title, 'action': action, 'tenant_id': tenantBu[0], 'bu_id': tenantBu[1] };
    }

    const httpResult = $http({
      method: 'POST',
      url: url,
      data: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    httpResult
      .then(function () {
      });
  });

}
