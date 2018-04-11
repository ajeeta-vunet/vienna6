export function getTenantData($http, chrome) {
  const tenantBu = chrome.getTenantBu();
  const url = '/vuSmartMaps/api/' + tenantBu[0] + '/';
  const httpResult = $http({
    method: 'GET',
    url: url
  })
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });

  return httpResult
    .then(function (resp) {
      return resp;
    });
}
