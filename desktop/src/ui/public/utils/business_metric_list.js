// This function returns a promise with business metric list.
export function getBusinessMetricList(savedObjectsClient) {
  const bmvList = [];
  return savedObjectsClient.find({
    type: 'visualization',
    fields: [],
    perPage: 10000
  }).then(resp => {
    resp.savedObjects.map(obj => {
      if(JSON.parse(obj.attributes.visState).type === 'business_metric') {
        const bmIdTitle = {
          id: obj.id,
          title: obj.get('title'),
        };
        bmvList.push(bmIdTitle);
      }
    });
    return bmvList;
  });
}