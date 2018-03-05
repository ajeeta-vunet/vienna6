const module = require('ui/modules').get('app/anomaly');
const _ = require('lodash');

// Used only by the savedAnomalies service, usually no reason to change this
module.factory('SavedAnomaly', function (courier) {
  // SavedAnomaly constructor. Usually you'd interact with an instance of this.
  // ID is option, without it one will be generated on save.
  _.class(SavedAnomaly).inherits(courier.SavedObject);
  function SavedAnomaly(id) {
    // Gives our SavedAnomalies the properties of a SavedObject
    SavedAnomaly.Super.call(this, {
      type: SavedAnomaly.type,
      mapping: SavedAnomaly.mapping,
      searchSource: SavedAnomaly.searchsource,

      // if this is null/undefined then the SavedObject will be assigned the defaults
      id: id,

      // default values that will get assigned if the doc is new
      defaults: {
        title: 'New Anomaly',
        description: '',
        metric: '',
        index: '',
        metricField: '',
        window: '',
        filter: '',
        groupByField: '',
        model: '',
        periodicity: '',
        type: '',
        docType: '',
        macroInterval: '',
        macroIntervalType: '',
        microInterval: '',
        microIntervalType: '',
        timeDuration: '',
        timeDurationType: '',
        allowedRolesJSON: '',
      },

      // if an indexPattern was saved with the searchsource of a SavedAnomaly
      // object, clear it. It was a mistake
      clearSavedIndexPattern: true
    });
  }

  // save these objects with the 'anomaly' type
  SavedAnomaly.type = 'anomaly';

  // if type:anomaly has no mapping, we push this mapping into ES
  SavedAnomaly.mapping = {
    title: 'string',
    description: 'string',
    metric: 'string',
    index: 'string',
    metricField: 'string',
    window: 'string',
    filter: 'string',
    groupbyField: 'string',
    model: 'string',
    periodicity: 'string',
    type: 'string',
    docType: 'string',
    macroInterval: 'string',
    macroIntervalType: 'string',
    microInterval: 'string',
    microIntervalType: 'string',
    timeDuration: 'string',
    timeDurationType: 'string',
    allowedRolesJSON: 'string'
  };

  SavedAnomaly.searchsource = true;

  return SavedAnomaly;
});
