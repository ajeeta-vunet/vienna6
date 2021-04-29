import chrome from 'ui/chrome';

//this method is used to fetch the Summary details of Assets which will be used in Summary Component.
export function fetchAssetDetailsSummary() {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/unique/';

  const postBody = {
    fields: ['location', 'device_type', 'vendor_name']
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

//This method is used to fetch the nodes and edges to construct the graph.
export function fetchFilteredAssetsList(filters) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/network/';

  const postBody = {
    filter: filters
  }

  return fetch(urlBase,
    {
      method: 'POST',
      body: JSON.stringify(postBody)
   })
    .then(response => response.json())
    .then(data => {
      return data;
    });
}

//get details of the clicked node
export function fetchNodeDetails(node_id) {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + `/asset/${node_id}/`;

  return fetch(urlBase,{ method: 'GET' })
    .then(response => response.json())
    .then(data => {
      return data;
    });
}