import chrome from 'ui/chrome';

//this method is used to download the list of assets.
export function downloadAssets() {
  let urlBase = chrome.getUrlBase();
  urlBase = urlBase + '/asset/export/';

  fetch(urlBase, {
    method: 'POST',
    responseType: 'blob',
  })
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      const saveAs = require('@elastic/filesaver').saveAs;
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'assets.csv');
    });
}