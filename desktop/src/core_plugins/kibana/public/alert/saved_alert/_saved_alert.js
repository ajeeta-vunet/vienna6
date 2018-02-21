const module = require('ui/modules').get('app/alert');
const _ = require('lodash');

// Used only by the savedAlerts service, usually no reason to change this
module.factory('SavedAlert', function (courier) {
  // SavedAlert constructor. Usually you'd interact with an instance of this.
  // ID is option, without it one will be generated on save.
  _.class(SavedAlert).inherits(courier.SavedObject);
  function SavedAlert(id) {
    // Gives our SavedAlert the properties of a SavedObject
    SavedAlert.Super.call(this, {
      type: SavedAlert.type,
      mapping: SavedAlert.mapping,
      searchSource: SavedAlert.searchsource,

      // if this is null/undefined then the SavedObject will be assigned the defaults
      id: id,

      // default values that will get assigned if the doc is new
      defaults: {
        title: 'New Alert',
        description: '',
        ruleLevelThreshold: '',
        evalCriteria: '{}',
        ruleList: '',
        severity: '',
        summary: '',
        allowedRolesJSON: '',
        enableThrottle: '',
        throttleDuration: '',
        throttleDurationType: '',
        alertByTicket: false,
        alertByEmail: false,
        alertEmailId: '',
        description: '',
        lastModifiedTime: '',
        activeStartTime: '',
        activeEndTime: '',
        enableAlert: '',
        activeAlertCheck: '',
        weekdays: '',
        evalCriteriaAlias: '',
        advancedConfiguration: '',
      },

      // if an indexPattern was saved with the searchsource of a SavedAlert
      // object, clear it. It was a mistake
      clearSavedIndexPattern: true
    });

  }

  // save these objects with the 'alert' type
  SavedAlert.type = 'alert';

  // if type:alert has no mapping, we push this mapping into ES
  SavedAlert.mapping = {
    title: 'text',
    description: 'text',
    ruleList: 'text',
    ruleLevelThreshold: 'text',
    evalCriteria: 'text',
    severity: 'text',
    summary: 'text',
    allowedRolesJSON: 'text',
    enableThrottle: 'text',
    throttleDurationType: 'text',
    throttleDuration: 'text',
    alertByTicket: 'boolean',
    alertByEmail: 'boolean',
    alertEmailId: 'text',
    description: 'text',
    lastModifiedTime: 'text',
    activeStartTime: 'text',
    activeEndTime: 'text',
    enableAlert: 'text',
    activeAlertCheck: 'text',
    weekdays: 'text',
    evalCriteriaAlias: 'text',
    advancedConfiguration: 'text',
  };

  SavedAlert.searchsource = true;

  return SavedAlert;
});
