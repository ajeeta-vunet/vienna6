const module = require('ui/modules').get('app/report');
const _ = require('lodash');

// Used only by the savedReports service, usually no reason to change this
module.factory('SavedReport', function (courier) {
  // SavedReport constructor. Usually you'd interact with an instance of this.
  // ID is option, without it one will be generated on save.
  _.class(SavedReport).inherits(courier.SavedObject);
  function SavedReport(id) {
    // Gives our SavedReport the properties of a SavedObject
    SavedReport.Super.call(this, {
      type: SavedReport.type,
      mapping: SavedReport.mapping,
      searchSource: SavedReport.searchsource,

      // if this is null/undefined then the SavedObject will be assigned the defaults
      id: id,

      // default values that will get assigned if the doc is new
      defaults: {
        title: 'New Report',
        description: '',
        panelsJSON: '[]',
        sectionJSON: '[]',
        allowedRolesJSON: '[]',
        optionsJSON: '',
        uiStateJSON: '{}',
        preparedBy: '',
        execSummary: '',
        timeTo: undefined,
        timeFrom: undefined,
        schedule: '{}',
        owner: '{}',
        company_name: '',
        timeRestore: false,
        scheduleFrequency: '',
        recipientsList: '[]'
      },

      // if an indexPattern was saved with the searchsource of a SavedReport
      // object, clear it. It was a mistake
      clearSavedIndexPattern: true
    });

  }

  // save these objects with the 'report' type
  SavedReport.type = 'report';

  // if type:report has no mapping, we push this mapping into ES
  SavedReport.mapping = {
    title: 'text',
    description: 'text',
    panelsJSON: 'text',
    allowedRolesJSON: 'text',
    sectionJSON: 'text',
    optionsJSON: 'text',
    uiStateJSON: 'text',
    preparedBy: 'text',
    execSummary: 'text',
    timeTo: 'text',
    timeFrom: 'text',
    schedule: 'text',
    owner: 'text',
    company_name: 'text',
    timeRestore: 'boolean',
    scheduleFrequency: 'string',
    recipientsList: 'string'
  };

  SavedReport.searchsource = true;

  return SavedReport;
});
