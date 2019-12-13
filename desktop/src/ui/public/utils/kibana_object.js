import _ from 'lodash';
import { SavedObjectsClientProvider } from 'ui/saved_objects';

// This function returns only the value part with comma delimitted
// for the specified field
// List - [{"id":"1", "name":"admin"},{"id":"2", "name":"dba"}
// fieldToFetch - name output = admin,dba
// fieldToFetch - id, output = 1,2
export function getValueToStoreInKibana(objectList, fieldToFetch) {
  let value = '';
  _.each(objectList, function (obj) {
    value = value + obj[fieldToFetch] + ',';
  });
  value = value.replace(/,\s*$/, '');
  return value;
}

// It returns the saved object like search, index-pattern...from the .kibana
// object based on the param doc_type. For ex; To get title of all the saved
// searched we need to pass 'search' for doc_type and ['title'] for the list.
export async function getSavedObject(doc_type, fieldList, page_size, Private) {
  let savedObject = [];
  let savedObjectsClient = Private(SavedObjectsClientProvider);
  await savedObjectsClient.find({
    type: doc_type,
    fields: fieldList,
    perPage: page_size
  }).then(response => {
    savedObject = response.savedObjects.map(pattern => {
      const id = pattern.id;
      let objectPattern = {}
      objectPattern.id = id;
      fieldList.map(function (field) {
        objectPattern[field] = pattern.get(field);
      })
      return objectPattern;
    });
  });
  return savedObject;
}

// It returns a specific visualization object based on the param vis_type.
// For ex; To get all the business metrics, we need to pass 'business_metric'
// for the vis_type param
export async function getVisualizationObjectByType(doc_tpye, fieldList, page_size, vis_type, Private) {
  let visualizationObject = [];
  let savedObjectsClient = Private(SavedObjectsClientProvider);
  await savedObjectsClient.find({
    type: doc_tpye,
    fields: fieldList,
    perPage: page_size
  }).then(response => {
    response.savedObjects.map(pattern => {
      if(JSON.parse(pattern.attributes.visState).type === vis_type) {
        const id = pattern.id;
        const visTitle = {
          id: id,
          title: pattern.get('title'),
        };
        visualizationObject.push(visTitle);
      }
    });
  });
  return visualizationObject;
}