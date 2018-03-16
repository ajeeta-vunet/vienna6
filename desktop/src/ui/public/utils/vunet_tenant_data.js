export function getTenantData($http, notify) {
  // We currently assume tenant-id is 1
  const tenantId = 1;
  const url = '/vuSmartMaps/api/' + tenantId + '/';
  const httpResult = $http({
    method: 'GET',
    url: url
  })
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });

  return httpResult
    .then(function (resp) {
      return resp;
    }).catch(function () {
      notify.error('Unable to print the report');
    });
}
