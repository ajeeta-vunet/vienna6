import DataService from   'plugins/kibana/berlin/services/data_service/data.service';
import StateService from 'plugins/kibana/berlin/services/state/state.service';
import { uiModules } from 'ui/modules';
import { VunetDataTable }  from 'ui_framework/src/vunet_components/vunet_table/vunet_table';
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal';
import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';


import DataEnrichmentUtilService from 'plugins/kibana/berlin/data_source/enrichment/data_enrichment.utils.service';

const app = uiModules.get('app/berlin', ['react', 'ngFileSaver', 'ui-notification', 'ui.bootstrap']);
app
  .constant('SUPER_TENANT_ID', '1')
  .constant('HTTP_SUCCESS_CODE', 200)
  .constant('POLLING_TIME', 180000)
  .constant('NOTIFICATION_TIMEOUT', 30000)
  .constant('EMAIL_PREF_CONST', '1')
  .constant('BASE_URL', '/vuSmartMaps/api')
  .constant('VUINSITE_BASE_URL', '/vuInsite/api/default/')
  .constant('MAXIMUM_FILE_SIZE', 209715200)
  .constant('MAXIMUM_IMAGE_FILE_SIZE', 51200)

  .constant('USER_BASE_URL', '/api/default/');

app.service('DataService', DataService);
app.service('StateService', StateService);
app.service('DataEnrichmentUtilService', DataEnrichmentUtilService);

app.config(function (NotificationProvider) {
  NotificationProvider.setOptions({
    startTop: 60,
  });
}).run(function () {
  // user is coming from berlin and getting set here through chrome
});

app.directive('vunetSwitch', function (reactDirective) {
  return reactDirective(VunetSwitch);
});

app.directive('vunetDataTable', function (reactDirective) {

  return reactDirective(VunetDataTable);
});

app.directive('vunetModal', function (reactDirective) {

  return reactDirective(VunetModal);
});

app.directive('vunetTab', function (reactDirective) {

  return reactDirective(VunetTab);
});
