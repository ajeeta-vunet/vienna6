import './network';
import {
  FeatureCatalogueRegistryProvider,
  FeatureCatalogueCategory,
} from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { NetworkConstants } from './network_constants';
import networkMapTemplate from './network.html';
import { apiProvider } from '../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';

uiRoutes
  .defaults(/networkMap/, {
    requireDefaultIndex: true,
  })
  .when(NetworkConstants.LANDING_PAGE_PATH, {
    template: networkMapTemplate,
    resolve: {
      assetList: function () {
        const postBody = {
          filter: {},
        };

        return apiProvider.post(NetworkConstants.FETCH_ASSET_LIST_FOR_NETWORK, postBody);
      },
      assetDetailsSummary: function () {
        const postBody = {
          fields: ['location', 'device_type', 'vendor_name', 'system_ip'],
        };
        return apiProvider.post(NetworkConstants.FETCH_ASSETS_SUMMARY, postBody);
      },
    },
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'networkMap',
    title: 'NetworkMap',
    description: 'Visualise your network',
    icon: '',
    path: '/app/kibana#/networkMap',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA,
  };
});
