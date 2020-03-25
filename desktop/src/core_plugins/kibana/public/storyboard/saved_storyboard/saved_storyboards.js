import 'plugins/kibana/storyboard/saved_storyboard/saved_storyboard';
import { SavedObjectLoader } from 'ui/courier/saved_object/saved_object_loader';
import { savedObjectManagementRegistry } from 'plugins/kibana/management/saved_object_registry';
require('plugins/kibana/storyboard/saved_storyboard/saved_storyboard');
const module = require('ui/modules').get('app/storyboard');
// Register this service with the saved object registry so it can be
// edited by the object editor.
savedObjectManagementRegistry.register({
  service: 'savedStoryboards',
  title: 'storyboards'
});

// This is the only thing that gets injected into controllers
module.service('savedStoryboards', function (SavedStoryboard, kbnIndex, kbnUrl, $http) {
  return new SavedObjectLoader(SavedStoryboard, kbnIndex, kbnUrl, $http);
});
