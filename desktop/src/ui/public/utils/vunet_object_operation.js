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
    }else if (objType === 'report') {
      const reportId = 'report:' + item.id;
      url = '/vuSmartMaps/api/report_status/';
      data = { 'report_id': reportId, 'report_title': item.title, 'action': action, 'tenant_id': tenantBu[0], 'bu_id': tenantBu[1] };
    }  else if (objType === 'index_pattern') {
      const indexId = 'index-pattern:' + item.id;
      url = '/vuSmartMaps/api/index_pattern_status/';
      data = {
        'id': indexId, 'title': item.title, 'action': action, 'tenant_id': tenantBu[0], 'bu_id': tenantBu[1] };
    }
    else if (objType === 'search') {
      url = '/vuSmartMaps/api/search_status/';
      data = {
        'id': item.id, 'title': item.title, 'action': action, 'tenant_id': tenantBu[0], 'bu_id': tenantBu[1] };
    }
    else if (objType === 'visualization') {
      url = '/vuSmartMaps/api/visualization_status/';
      data = {
        'id': item.id, 'title': item.title, 'type': item.visState.type, 'action': action, 'tenant_id': tenantBu[0], 'bu_id': tenantBu[1] };
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
