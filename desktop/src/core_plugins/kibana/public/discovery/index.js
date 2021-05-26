import 'plugins/kibana/discovery/discovery';
import {
  FeatureCatalogueRegistryProvider,
  FeatureCatalogueCategory,
} from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { DiscoveryConstants } from './discovery_constants';
import discoveryTemplate from 'plugins/kibana/discovery/discovery.html';
import { apiProvider } from '../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';

uiRoutes
  .defaults(/discovery/, {
    requireDefaultIndex: true,
  })
  .when(DiscoveryConstants.LANDING_PAGE_PATH, {
    template: discoveryTemplate,
    resolve: {
      credList: function () {
        return apiProvider.getAll(DiscoveryConstants.FETCH_CRED_LIST);
      },
      sourceIpAddressList: function () {
        return apiProvider.getAllWithoutBU(DiscoveryConstants.FETCH_PREFERENCES)
          .then((responseJSON) => {
            let SourceIpPreference;
            responseJSON.preferences.map((preference) => {
              SourceIpPreference = preference.SourceIpPreference
                ? preference.SourceIpPreference
                : 'undefined';
            });
            return SourceIpPreference;
          });
      }
    },
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'discovery',
    title: 'Discovery',
    description: 'Monitor your networks',
    icon: '',
    path: '/app/kibana#/discovery',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA,
  };
});
