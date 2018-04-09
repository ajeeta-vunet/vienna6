import { savedObjectManagementRegistry } from 'plugins/kibana/management/saved_object_registry';
import { SavedObjectLoader } from 'ui/courier/saved_object/saved_object_loader';

const module = require('ui/modules').get('app/alert');

// bring in the factory
require('plugins/kibana/alert/saved_alert/_saved_alert');

// Register this service with the saved object registry so it can be
// edited by the object editor.
savedObjectManagementRegistry.register({
  service: 'savedAlerts',
  title: 'alerts'
});

// This is the only thing that gets injected into controllers
module.service('savedAlerts', function (SavedAlert, kbnIndex, kbnUrl, $http) {
  return new SavedObjectLoader(SavedAlert, kbnIndex, kbnUrl, $http);
});
