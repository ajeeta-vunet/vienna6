import {
  FeatureCatalogueRegistryProvider,
  FeatureCatalogueCategory,
} from 'ui/registry/feature_catalogue';
import uiRoutes from 'ui/routes';
import { ServicePortalConstants } from './service_portal_constants';
import servicePortalTemplate from './servicePortal.html';
import './servicePortal.less';
import { uiModules } from 'ui/modules';

const app = uiModules.get('app/berlin');

uiRoutes
  .defaults(/service_portal/, {
    requireDefaultIndex: true,
  })
  .when(ServicePortalConstants.SERVICE_PORTAL_PATH, {
    template: servicePortalTemplate,
    resolve: {},
  });

//This is the directive created to send data from here to the other site loaded in iframe
//using vunetServicePortal controller
app.directive('vunetServicePortal', function () {
  return {
    restrict: 'E',
    controllerAs: 'vunetServicePortal',
    controller: vunetServicePortal,
  };
});

//Getting the user data and posting it to the respective site
function vunetServicePortal(Promise, chrome, StateService) {
  const userName = chrome.getCurrentUser()[0];
  const searchString = chrome.getSearchString();

  const iframeReference = document.getElementById('servicePortalIframe');

  //The below function will run once the iframe contents are loaded.
  //Inside the function, API call to get user information is done only after the iframe containing service portal app is loaded.
  //After getting the user information posting it to the app inside the iframe.
  iframeReference.contentWindow.onload = function () {
    //API call to get user information
    StateService.getUserInfo(userName).then((data) => {
      data.searchString = searchString;
      //Constructing logged in user details which need to be send to iframe
      const userData = {
        bu_id: data.bu_id,
        email: data.email,
        mobile_kpi: data.mobile_kpi,
        name: data.name,
        permissions: data.permissions,
        search_string: searchString,
        tenant_id: data.tenant_id,
        user_group: data.user_group,
        status: data.status,
      };

      //Doing window.post message to send user information to the app inside the iframe
      const win = iframeReference.contentWindow;
      win.postMessage(userData, ServicePortalConstants.SERVICE_PORTAL_APP_URL);
    });
  };
}

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'servicePortal',
    title: 'Service Portal',
    description: '',
    icon: '',
    path: 'app/kibana#/service_portal',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.ADMIN,
  };
});
