//This function is used for fetching logged-in user preferences.
export function fetchPreferences($http, chrome) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase.slice(0, -4) + '/check_preferences/ITSMPreference/';

  const httpResult = $http
    .get(urlBase, {})
    .then((resp) => resp.data)
    .catch((resp) => {
      throw resp.data;
    });

  return httpResult
    .then(function (resp) {
      return resp;
    })
    .catch((error) => {
      throw error;
    });
}