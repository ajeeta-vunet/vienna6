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

// This function returns only email group's name from the input
// input - preferredEmailGroup [{"name":"admin"},{"name":"dba"},
// {"name":"network team"},{"name":"Support L1"}]
// Output - admin,dba,network team,Support L1
export function getEmailGroupNameForDisplay(selectEmailGroupList) {
  let emailGroupName = '';
  _.each(selectEmailGroupList, function (emailgroup) {
    emailGroupName = emailGroupName + emailgroup.name + ',';
  });
  emailGroupName = emailGroupName.replace(/,\s*$/, '');
  return emailGroupName;
}
