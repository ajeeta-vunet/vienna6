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


// This returns a list of BMV with metrics object and bucket(aggregation) length of BMV.
export function getMetricListWithAggLengthInBMV(savedObjectsClient) {

  const metricsAndBucketsLengthOfBMV = [];
  const mericListOfBMV = [];
  return savedObjectsClient.find({
    type: 'visualization',
    fields: [],
    perPage: 10000
  }).then(resp => {
    resp.savedObjects.map(obj => {
      const visState = JSON.parse(obj.attributes.visState);
      if(visState.type === 'business_metric') {

        // Object with bmv name as key and metrics list as value
        const metricObject = {};

        // Object with
        const metricObjDict = {};

        // Get the params from visState of BMV object.
        const bmvVisParams = visState.params;

        const metric = bmvVisParams.metrics;
        const aggLength = bmvVisParams.aggregations.length;

        const objTitle = obj.get('title');

        metric.map(metricobj => {
          if(!metricObject.hasOwnProperty(objTitle)) {
            metricObject[objTitle] = [];
            metricObject[objTitle].push(metricobj.label);
          } else {
            metricObject[objTitle].push(metricobj.label);
          }
          metricObject.aggregationLength = aggLength;
          metricObjDict[objTitle] = metricObject;
        });
        mericListOfBMV.push(metricObject);
        metricsAndBucketsLengthOfBMV.push(metricObjDict);
      }

    });
    return metricsAndBucketsLengthOfBMV;
  });
}