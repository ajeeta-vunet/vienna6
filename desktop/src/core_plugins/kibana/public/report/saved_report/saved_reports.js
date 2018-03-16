import { savedObjectManagementRegistry } from 'plugins/kibana/management/saved_object_registry';
import { SavedObjectLoader } from 'ui/courier/saved_object/saved_object_loader';

const module = require('ui/modules').get('app/report');

require('plugins/kibana/report/saved_report/_saved_report');

// Register this service with the saved object registry so it can be
// edited by the object editor.
savedObjectManagementRegistry.register({
  service: 'savedReports',
  title: 'reports'
});

// This is the only thing that gets injected into controllers
module.service('savedReports', function (SavedReport, kbnIndex, kbnUrl, $http) {
  return new SavedObjectLoader(SavedReport, kbnIndex, kbnUrl, $http);
});
