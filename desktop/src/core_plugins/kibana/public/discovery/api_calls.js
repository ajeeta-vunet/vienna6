// import chrome from 'ui/chrome';
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

  const responseJSON = await response.json();
  return responseJSON.preferences[6].SourceIpPreference;
}