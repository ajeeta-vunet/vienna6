export function getTenantData($http) {
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
    });
}
