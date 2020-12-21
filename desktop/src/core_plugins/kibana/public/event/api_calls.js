// This function is used to fetch the list of all events.
//It takes as its arguments the dashboard context and the time duration start and end values.
//These are used to fetch events based on the time filter chosen.
export function fetchListOfEvents($http, chrome, dashboardContext, timeDurationStart, timeDurationEnd) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/events_of_interest';

  const httpListOfEventsResult = $http.post(urlBase + '/list_of_events/', {
    extended: {
      es: {
        filter: dashboardContext()
      }
    },
    time: { 'gte': timeDurationStart, 'lte': timeDurationEnd },
    sample_size: 10000
  })
    .then(resp => { return resp.data;})
    .catch(resp => { throw resp.data; });

  return httpListOfEventsResult
    .then(function (resp) {
      return resp;
    })
    .catch(error => { throw error; });
}

//This function is used to fetch the list of columns and hidden fields of the user for the column selector.
export function fetchColumnSelectorInfo($http, chrome) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/events_of_interest/';
  const currentUser = chrome.getCurrentUser();
  const username = currentUser[0];
  const httpResult = $http.get(urlBase + 'fields/' + username, {})
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });

  return httpResult
    .then(function (resp) {
      return resp;
    })
    .catch(error => { throw error; });
}

//This function is used to update a user's preferences for the hidden fields.
export function updateColumnSelectorInfo($http, chrome, fields, hiddenFields) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/events_of_interest/';
  const currentUser = chrome.getCurrentUser();
  const username = currentUser[0];

  $http.put(urlBase + 'fields/' + username, {
    alert_details: {
      fields: fields,
      hidden_fields: hiddenFields
    },
    ticket_details: {
      fields: [],
      hidden_fields: []
    }
  })
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });
}

//This function is used for fetching Users List for assigning alerts.
//These fetched users will be used in EventDetails.js in a dropdown as list of users from which the
//admin user can assign an event to any user from the fetched list.
export function fetchUserList($http, chrome) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/events_of_interest/' + 'users_list/';

  const httpResult = $http.get(urlBase, {})
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });

  return httpResult
    .then(function (resp) {
      return resp;
    })
    .catch(error => { throw error; });
}
//This function is used for fetching the filter fields that will be used to apply filters
//on the events. The list of filter fields expected is sent as a object array in the post api call.
export function fetchFilterFields($http, chrome) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/events_of_interest/' + 'filter_fields/';
  const filterFields = {
    field: ['alarm_state', 'severity',
      'created_by', 'category',
      'status', 'assignee',
      'impact', 'ip_address',
      'region', 'source']
  };

  const httpResult = $http.post(urlBase, filterFields)
    .then(resp => resp.data)
    .catch(resp => { throw resp.data; });

  return httpResult
    .then(function (resp) {
      return resp;
    })
    .catch(error => { throw error; });
}