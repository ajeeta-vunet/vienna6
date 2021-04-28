import chrome from 'ui/chrome';

//Create a new Scan

export async function createNewScan(chrome, newScanDetails) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/discovery/';


  const response = await fetch(urlBase, {
    method: 'POST',
    body: newScanDetails
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return response;
}

// Get list of Scans
export async function fetchListOfScans(chrome) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/topology/';


  const response = await fetch(urlBase, {
    method: 'GET'
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
}

//Delete an existing scan

export async function deleteScan(chrome, topologyId) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/topology/' + topologyId;


  const response = await fetch(urlBase, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
}

//Fetch Credentials List

export async function fetchCredentialsList(chrome) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/credentials/';


  const response = await fetch(urlBase, {
    method: 'GET'
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
}

//Fetch Source IP list

export async function fetchSourceIpAddressList(chrome) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase.substring(0, urlBase.length - 4) + 'preferences';


  const response = await fetch(urlBase, {
    method: 'GET'
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return await response.json()
    .then(responseJSON => {
      let SourceIpPreference;
      responseJSON.preferences.map((preference) => {
        SourceIpPreference = preference.SourceIpPreference ? preference.SourceIpPreference : 'undefined';
      });
      return SourceIpPreference;
    });
}

//Fetch list of nodes of a specific topology
// This method takes three paramteres - topology_id, scroll_id & size.
// topology_id - ID of the topology whose details should be fetched.
// scroll_id - start point of from where nodes should be fetched.
// size - number of nodes from start point that should be fetched.

export async function fetchNodesList(topologyId, scrollId, size) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/topology/' + topologyId + '/';
  const postBody = {
    scroll_id: scrollId,
    size: size
  };

  const response = await fetch(urlBase, {
    method: 'POST',
    body: JSON.stringify(postBody)
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return response;
}

//This function is used to fetch the summary details to be diaplyed under Node Details component.
export function fetchNodeDetailsSummary(topologyId) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/nodes/unique/';

  const postBody = {
    fields: ['device_type', 'vendor_name', 'system_ip'],
    topology_id: topologyId
  };

  return fetch(urlBase, {
    method: 'POST',
    body: JSON.stringify(postBody)
  })
    .then(response => response.json());
}

//Fetch list of scheduled scans.
export async function fetchListOfScheduledScans() {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/schedule/';


  const response = await fetch(urlBase, {
    method: 'GET'
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return await response.json()
    .then(data => {
      return data.schedules;
    });
}

//Create a new Scan
export async function createNewScheduledScan(newScheduleScanDetails) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/schedule/';


  const response = await fetch(urlBase, {
    method: 'POST',
    body: newScheduleScanDetails
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return response;
}

//This method is called to edit an existing scheduled scan.
export async function editScheduleScan(configId, scheduleScanData) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/schedule/' + configId + '/';


  const response = await fetch(urlBase, {
    method: 'PUT',
    body: scheduleScanData
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return response;
}

//this method is used to search the database for Node details of a particular
//topology with search string present in postBody.
export async function searchNodeDetails(topologyId, postBody) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/topology/' + topologyId + '/nodes/search/';
  // const postBody = {
  //   scroll_id: 0,
  //   size: 10,
  //   search_string: searchString
  // };

  const response = await fetch(urlBase, {
    method: 'POST',
    body: JSON.stringify(postBody)
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return await response.json()
    .then(data => {
      return data;
    });
}

//this method is called to delete a scheduled scan.
export async function deleteScheduledScan(configId) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/schedule/' + configId + '/';

  const response = await fetch(urlBase, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
}

//this method is called to fetch list of nodes with applied filters.
export async function filteredListOfNodes(topologyId, scrollId, filter, sortString, searchString) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/topology/' + topologyId + '/';
  const postBody = {
    scroll_id: scrollId,
    size: 10,
    filter: filter,
    sort_string: sortString,
    search_string: searchString
  };

  const response = await fetch(urlBase, {
    method: 'POST',
    body: JSON.stringify(postBody)
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return response;
}

//this method is called to rescan a topology.
export async function reScan(scanId) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/scan/again/' + scanId + '/';

  const response = await fetch(urlBase, {
    method: 'POST'
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  return response;
}