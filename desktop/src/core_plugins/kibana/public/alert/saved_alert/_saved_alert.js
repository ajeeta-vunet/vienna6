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
        evalCriteria: '',
        ruleList: '',
        severity: 'warning',
        summary: '',
        allowedRolesJSON: '',
        enableThrottle: false,
        throttleDuration: '',
        throttleDurationType: '',
        alertByTicket: false,
        alertByWhatsapp: false,
        alertWhatsappNumber: '',
        alertByEmail: false,
        alertEmailId: '',
        alertEmailGroup: '',
        enable_runbook_automation: false,
        runbook_script: '',
        enable_ansible_playbook: false,
        ansible_playbook_name: '',
        ansible_playbook_options: '',
        description: '',
        lastModifiedTime: '',
        activeStartTime: '00:00:00',
        activeEndTime: '23:59:59',
        enableAlert: true,
        activeAlertCheck: false,
        weekdays: '[{"name": "Sunday", "selected": true }, {"name": "Monday", "selected": true },' +
        '{"name": "Tuesday", "selected": true }, {"name": "Wednesday", "selected": true },' +
        '{"name": "Thursday", "selected": true }, {"name": "Friday", "selected": true },' +
        '{"name": "Saturday", "selected": true }]',
        evalCriteriaAlias: '',
        enableAdvancedConfig: false,
        advancedConfiguration: '',
        alertEmailBody: '',
        alertByReport: false,
        alertReportList: '',
        enableAlarmMode: true,
        evalCriteriaConditionList: ''
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
    enableThrottle: 'boolean',
    throttleDurationType: 'text',
    throttleDuration: 'text',
    alertByTicket: 'boolean',
    alertByWhatsapp: 'boolean',
    alertWhatsappNumber: 'text',
    alertByEmail: 'boolean',
    alertEmailId: 'text',
    alertEmailGroup: 'text',
    enable_runbook_automation: 'boolean',
    runbook_script: 'text',
    enable_ansible_playbook: 'boolean',
    ansible_playbook_name: 'text',
    ansible_playbook_options: 'text',
    description: 'text',
    lastModifiedTime: 'text',
    activeStartTime: 'text',
    activeEndTime: 'text',
    enableAlert: 'boolean',
    activeAlertCheck: 'boolean',
    weekdays: 'text',
    evalCriteriaAlias: 'text',
    enableAdvancedConfig: 'boolean',
    advancedConfiguration: 'text',
    alertEmailBody: 'text',
    alertByReport: 'boolean',
    alertReportList: 'text',
    enableAlarmMode: 'boolean',
    evalCriteriaConditionList: 'text'
  };

  SavedAlert.searchsource = true;

  return SavedAlert;
});
