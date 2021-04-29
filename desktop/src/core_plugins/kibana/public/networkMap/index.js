import './network';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { NetworkConstants } from './network_constants';
import networkMapTemplate from './network.html';
import { fetchFilteredAssetsList, fetchAssetDetailsSummary } from './api_calls';

uiRoutes
  .defaults(/networkMap/, {
    requireDefaultIndex: true
  })
  .when(NetworkConstants.LANDING_PAGE_PATH, {
    template: networkMapTemplate,
    resolve: {
      assetList: function () {
        return fetchFilteredAssetsList({});
      },
      assetDetailsSummary: function () {
        return fetchAssetDetailsSummary();
      }
    }
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'networkMap',
    title: 'NetworkMap',
    description: 'Visualise your network',
    icon: '',
    path: '/app/kibana#/networkMap',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
