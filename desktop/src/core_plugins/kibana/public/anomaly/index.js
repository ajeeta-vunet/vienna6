import 'plugins/kibana/anomaly/anomaly';
import 'plugins/kibana/anomaly/saved_anomaly/saved_anomalies';
import 'plugins/kibana/anomaly/directives/details';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import uiRoutes from 'ui/routes';
import anomalyListingTemplate from './listing/anomaly_listing.html';
import { AnomalyListingController } from './listing/anomaly_listing';
import { AnomalyConstants } from './anomaly_constants';

uiRoutes
  .defaults(/anomaly/, {
    requireDefaultIndex: true
  })
  .when(AnomalyConstants.LANDING_PAGE_PATH, {
    template: anomalyListingTemplate,
    controller: AnomalyListingController,
    controllerAs: 'listingController',
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'anomaly',
    title: 'Anomaly',
    description: 'Anomaly Detection',
    icon: '/plugins/kibana/assets/app_alert.svg',
    path: `/app/kibana#${AnomalyConstants.LANDING_PAGE_PATH}`,
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
