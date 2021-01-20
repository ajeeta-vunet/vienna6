import 'plugins/kibana/discovery/discovery';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { DiscoveryConstants } from './discovery_constants';
import discoveryTemplate from 'plugins/kibana/discovery/discovery.html';
import { fetchCredentialsList, fetchSourceIpAddressList } from './api_calls';

uiRoutes
  .defaults(/discovery/, {
    requireDefaultIndex: true
  })
  .when(DiscoveryConstants.LANDING_PAGE_PATH, {
    template: discoveryTemplate,
    resolve: {
      credList: function (chrome) {
        return fetchCredentialsList(chrome);
      },
      sourceIpAddressList: function (chrome) {
        return fetchSourceIpAddressList(chrome);
      }
    }
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'discovery',
    title: 'Discovery',
    description: 'Monitor your networks',
    icon: '',
    path: '/app/kibana#/discovery',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
