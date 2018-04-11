import _ from 'lodash';

/*
// This function is called to filter the passed buckets list
// for the current tenant.
// If its a IMS tenant, it may be allowed to host multiple
// tenants - This information is available in
// /vienna_data/controller_tenant.json
*/

export function filterIndexBucketsForTenant(buckets, $http, chrome) {
  const tenantBu = chrome.getTenantBu();
  const tenantBuStr = tenantBu[0] + '-' + tenantBu[1];

  // If its a super tenant, we don't need to do anything and just return
  // all the buckets as it is
  if (chrome.isUserFromSuperTenant()) {
    return _.sortBy(buckets.map(bucket => {
      return {
        name: bucket.key
      };
    }), 'name');
  }

  const httpResult = $http({
    method: 'GET',
    url: '/ui/vienna_data/controller_tenant.json'
  })
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });

  return httpResult.then(function (controllerTenantData) {

    // Iterate on buckets and filter them out if they are not having
    // the right tenant-bu in the index name
    const filteredBuckets = _.filter(buckets, bucket => {

      // This is the tenant-bu derived from the index pattern entered (which is the value)
      const tenantBuValueMatch = bucket.key.match('(.+)?(-)?([0-9]+)-([0-9]+)-?(.+)?');

      // If the logged-in user belongs to a tenant-bu which can see
      // data of other tenant-bu, we check if the tenant-bu derived
      // from the index-pattern is one which this logged-in user can
      // access
      let valueTenantBu = '';
      if (tenantBuValueMatch) {
        valueTenantBu = tenantBuValueMatch[3] + '-' + tenantBuValueMatch[4];
        // This is to match case of '<tenant>-<bu>-<snapshot>' format
        if (tenantBuValueMatch[5] === undefined) {
          // This is of the format <tenant-id>-<bu-id>
          if (tenantBuValueMatch[1] === undefined) {
            valueTenantBu = tenantBuValueMatch[3] + '-' + tenantBuValueMatch[4];
          } else if (tenantBuValueMatch[1].match('[0-9]+-')) {
            // If the first match group is a number, then use that
            // and the next group as tenant and bu ids
            valueTenantBu = tenantBuValueMatch[1] + tenantBuValueMatch[3];
          }
        }
      }

      // If the tenant-bu in the index-name matches that of logged in
      // user, then valid
      if (valueTenantBu === tenantBuStr) {
        return true;
      } else if (tenantBuStr in controllerTenantData) {
        // If tenant-bu derived from the index-pattern entered is
        // on the logged in user can access, then it is valid
        if (controllerTenantData[tenantBuStr].indexOf(valueTenantBu) !== -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }

    });

    return _.sortBy(filteredBuckets.map(bucket => {
      return {
        name: bucket.key
      };
    }), 'name');

  });

}
