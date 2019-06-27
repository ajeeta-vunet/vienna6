const chrome = require('ui/chrome');

// Get the search string assigned to the logged-in user's role.
export function addSearchStringForUserRole(esFilter) {

  // Get the search string assigned to the logged-in user's role.
  const searchString = chrome.getSearchString();

  // if not empty means then there is a search string for the logged-in user.
  if (searchString !== '') {
    // Just add the query string to the must list. We are just pushing this
    // as there might be an existing query if this vis is called
    // from the dashboard.
    esFilter.bool.must.push({
      query_string: {
        query: searchString,
        analyze_wildcard: true,
        default_field: '*'
      }
    });
  }

  return esFilter;
}
