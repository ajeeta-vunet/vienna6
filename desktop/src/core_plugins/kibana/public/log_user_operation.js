import _ from 'lodash';

// This function will make a api call to vusmartmaps
// to log the user operations like load, save and delete.
// This will take the request method, vienna object type and
// object title and id as input for save and load, id for delete.
export function logUserOperation(http, method, type, title, id) {
  let objectTitle = '';

  if (title !== '') {
    objectTitle =  title.replace(/\s+/g, '-') + '/' + id;
  } else {
    objectTitle = id;
  }

  const operationObject = http({
    method: method,
    url: '/vuSmartMaps/api/1/vienna/' + type + '/' +  objectTitle + '/',
    data: {},
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
    .then(resp => resp.data)
    .catch(resp => {throw resp.data;});

  operationObject.then(function () {
    // Nothing needs to be done
  });
}

export function logUserOperationForDeleteMultipleObjects($http, ids, type) {
  _.each(ids, function (id) {
    logUserOperation($http, 'DELETE', type, '', id);
  });
}
