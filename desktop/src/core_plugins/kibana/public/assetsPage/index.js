import 'plugins/kibana/assetsPage/assets';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { AssetConstants } from './asset_constants';
import assetsTemplate from 'plugins/kibana/assetsPage/assets.html';
import { apiProvider } from '../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';

uiRoutes
  .defaults(/assets/, {
    requireDefaultIndex: true
  })
  .when(AssetConstants.LANDING_PAGE_PATH, {
    template: assetsTemplate,
    resolve: {
      assetList: function () {
        const postBody = {
          scroll_id: 0,
          size: 10
        };
        return apiProvider.post(AssetConstants.FETCH_ASSET_LIST, postBody);
      },
      vendorDeviceInfo: function () {
        return apiProvider.getAll(AssetConstants.FETCH_VENDOR_DEVICE_INFO);
      },
      assetDetailsSummary: function () {
        const postBody = {
          fields: ['location', 'device_type', 'vendor_name', 'system_ip']
        };
        return apiProvider.post(AssetConstants.FETCH_ASSETS_SUMMARY, postBody);
      }
    }
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'assets',
    title: 'Assets',
    description: 'Monitor your networks',
    icon: '',
    path: '/app/kibana#/assets',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
