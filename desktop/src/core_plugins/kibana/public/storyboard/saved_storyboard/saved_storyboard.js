import angular from 'angular';
import _ from 'lodash';
import { uiModules } from 'ui/modules';
const module = uiModules.get('app/storyboard');

// Used only by the savedStoryboards service, usually no reason to change this
module.factory('SavedStoryboard', function (courier, config) {
  // SavedStoryboard constructor. Usually you'd interact with an instance of this.
  // ID is option, without it one will be generated on save.
  _.class(SavedStoryboard).inherits(courier.SavedObject);
  function SavedStoryboard(id) {
    // Gives our SavedStoryboard the properties of a SavedObject
    SavedStoryboard.Super.call(this, {
      type: SavedStoryboard.type,
      mapping: SavedStoryboard.mapping,
      searchSource: SavedStoryboard.searchsource,

      // if this is null/undefined then the SavedObject will be assigned the defaults
      id: id,

      // default values that will get assigned if the doc is new
      defaults: {
        title: 'New Storyboard',
        hits: 0,
        description: '',
        dashboardsJSON: '[]',
        optionsJSON: angular.toJson({
          darkTheme: config.get('storyboard:defaultDarkTheme'),
          useMargins: id ? false : true,
          hidePanelTitles: false,
          category: '',
        }),
        uiStateJSON: '{}',
        allowedRolesJSON: '',
        version: 1,
        timeRestore: false,
        timeTo: undefined,
        timeFrom: undefined,
        refreshInterval: undefined
      },
      clearSavedIndexPattern: true
    });
  }

  // save these objects with the 'storyboard' type
  SavedStoryboard.type = 'storyboard';

  // if type:storyboard has no mapping, we push this mapping into ES
  SavedStoryboard.mapping = {
    title: 'text',
    hits: 'integer',
    description: 'text',
    panelsJSON: 'text',
    dashboardsJSON: 'text',
    optionsJSON: 'text',
    uiStateJSON: 'text',
    allowedRolesJSON: 'text',
    version: 'integer',
    timeRestore: 'boolean',
    timeTo: 'keyword',
    timeFrom: 'keyword',
    refreshInterval: {
      type: 'object',
      properties: {
        display: { type: 'keyword' },
        pause: { type: 'boolean' },
        section: { type: 'integer' },
        value: { type: 'integer' }
      }
    }
  };

  // Order these fields to the top, the rest are alphabetical
  SavedStoryboard.fieldOrder = ['title', 'description'];

  SavedStoryboard.searchsource = true;

  return SavedStoryboard;
});
