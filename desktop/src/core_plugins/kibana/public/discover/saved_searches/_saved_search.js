import _ from 'lodash';
import 'ui/notify';
import { uiModules } from 'ui/modules';


const module = uiModules.get('discover/saved_searches', [
  'kibana/notify',
  'kibana/courier'
]);

module.factory('SavedSearch', function (courier) {
  _.class(SavedSearch).inherits(courier.SavedObject);
  function SavedSearch(id) {
    courier.SavedObject.call(this, {
      type: SavedSearch.type,
      mapping: SavedSearch.mapping,
      searchSource: SavedSearch.searchSource,

      id: id,
      defaults: {
        title: 'New Saved Search',
        description: '',
        columns: [],
        customColumns: [],
        allowedRolesJSON: '',
        hits: 0,
        sort: [],
        version: 1,
        sampleSize: 0
      }
    });
  }

  SavedSearch.type = 'search';

  SavedSearch.mapping = {
    title: 'text',
    description: 'text',
    hits: 'integer',
    columns: 'keyword',
    customColumns: 'keyword',
    allowedRolesJSON: 'text',
    sort: 'keyword',
    version: 'integer',
    sampleSize: 'integer'
  };

  // Order these fields to the top, the rest are alphabetical
  SavedSearch.fieldOrder = ['title', 'description'];

  SavedSearch.searchSource = true;

  return SavedSearch;
});
