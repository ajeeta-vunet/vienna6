import chrome from 'ui/chrome';

//Create a new Scan

export async function createNewScan(chrome, newScanDetails) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/discovery/';


  const response = await fetch(urlBase, {
    method: 'POST',
    body: JSON.stringify(newScanDetails)
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