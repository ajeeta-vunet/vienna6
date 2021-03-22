import chrome from 'ui/chrome';

// Get list of Assets
export async function fetchListOfAssets(scrollId, size) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/list/';
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

  const data = await response.json();
  return data;
}

//This method is used to fetch the list of device types.
export function fetchDeviceType() {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/data_source/vendor_device_info/';

  return fetch(urlBase, { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      return data.device_list;
    });
}

//This method is used to fetch the list of different vendors.
export function fetchVendorList() {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/data_source/vendor_device_info/';

  return fetch(urlBase, { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      return data.vendor_list;
    });
}

//this method is used to fetch the Summary details of Assets which will be used in Summary Component.
export function fetchAssetDetailsSummary() {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/unique/';

  const postBody = {
    fields: ['location', 'device_type', 'vendor_name', 'system_ip']
  };

  return fetch(urlBase, {
    method: 'POST',
    body: JSON.stringify(postBody)
  })
    .then(response => response.json())
    .then(data => {
      return data;
    });
}

//this method is called to search the database based on fields under assets.
export async function searchAssetDetails(postBody) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/search/';

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

//this method is used to download the list of assets.
export function downloadAssets() {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/export/';

  fetch(urlBase, {
    method: 'POST',
    responseType: 'blob'
  }).then((response) => {
    return response.text();
  }).then((data) => {
    const saveAs = require('@elastic/filesaver').saveAs;
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'assets.csv');
  });
}

// Get filtered list of Assets
export async function fetchFilteredListOfAssets(scrollId, filter) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/list/';
  const postBody = {
    scroll_id: scrollId,
    size: 10,
    filter: filter
  };

  const response = await fetch(urlBase, {
    method: 'POST',
    body: JSON.stringify(postBody)
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
}

//this method is called to import a list of assets from a '.xls' file.
export async function importAssets(postBody) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/import/';

  const response = await fetch(urlBase, {
    method: 'POST',
    body: postBody
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return response;
}