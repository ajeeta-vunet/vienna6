import 'plugins/kibana/alert/alert';
import 'plugins/kibana/alert/saved_alert/saved_alerts';
import 'plugins/kibana/alert/directives/details';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/alert/styles/main.less';
import uiRoutes from 'ui/routes';
import alertListingTemplate from './listing/alert_listing.html';
import { AlertListingController } from './listing/alert_listing';
import { AlertConstants } from './alert_constants';

uiRoutes
  .defaults(/alert/, {
    requireDefaultIndex: true
  })
  .when(AlertConstants.LANDING_PAGE_PATH, {
    template: alertListingTemplate,
    controller: AlertListingController,
    controllerAs: 'listingController',
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'alert',
    title: 'Alert',
    description: 'Create smart, intelligent and compound alerts for your data',
    icon: '/plugins/kibana/assets/app_alert.svg',
    path: `/app/kibana#${AlertConstants.LANDING_PAGE_PATH}`,
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
