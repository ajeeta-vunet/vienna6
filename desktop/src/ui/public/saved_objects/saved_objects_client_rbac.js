import chrome from 'ui/chrome';

export function filterSavedObjectUsingRbac(resp) {

  const savedObjectList = resp.saved_objects.filter(function (savedObject) {

    // All saved objects must use allowedRolesJSON, if a given object does
    // not use it, we allow all
    if(savedObject.attributes.hasOwnProperty('allowedRolesJSON')) {

      const allowedRoles = JSON.parse(savedObject.attributes.allowedRolesJSON);

      if (chrome.canCurrentUserViewModify(allowedRoles)) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  });

  return savedObjectList;
}
