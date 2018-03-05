import { savedObjectManagementRegistry } from 'plugins/kibana/management/saved_object_registry';
import { SavedObjectLoader } from 'ui/courier/saved_object/saved_object_loader';

const module = require('ui/modules').get('app/anomaly');

//const lup = require('plugins/kibana/log_user_operation');
// bring in the factory
require('plugins/kibana/anomaly/saved_anomaly/_saved_anomaly');

// Register this service with the saved object registry so it can be
// edited by the object editor.
savedObjectManagementRegistry.register({
  service: 'savedAnomalies',
  title: 'anomalies'
});

// This is the only thing that gets injected into controllers
module.service('savedAnomalies', function (SavedAnomaly, kbnIndex, kbnUrl, $http) {
  return new SavedObjectLoader(SavedAnomaly, kbnIndex, kbnUrl, $http);
});
