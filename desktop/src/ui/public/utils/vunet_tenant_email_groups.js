import _ from 'lodash';

// This function returns all the email groups for the tenants
export function getTenantEmailGroups($http, chrome) {
  const url = chrome.getTenantUrlBase() + '/' + '/attributes/email-group/?summary=true';
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
