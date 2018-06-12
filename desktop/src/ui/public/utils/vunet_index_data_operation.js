// This function is called to update data for the given object
// in the passed index. Caller has to pass the whole object with updated
// fields and/or values
export function updateIndexDataOperation($http, esUrl, index, id, body) {

  // Create the url based on index and id
  const url = esUrl + '/' + index + '/doc/' + id;

  const httpResult = $http({
    method: 'PUT',
    url: url,
    data: body,
    headers: { 'Content-Type': 'application/json' },
  }).then(resp => resp.data)
    .catch(resp => { throw resp.data; });

  httpResult
    .then(function () {
      // We don't worry about the return response..
    });

}
