import 'plugins/kibana/assetsPage/assets';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { AssetConstants } from './asset_constants';
import assetsTemplate from 'plugins/kibana/assetsPage/assets.html';
import { fetchListOfAssets, fetchDeviceType, fetchVendorList, fetchAssetDetailsSummary } from './api_calls';

uiRoutes
  .defaults(/assets/, {
    requireDefaultIndex: true
  })
  .when(AssetConstants.LANDING_PAGE_PATH, {
    template: assetsTemplate,
    resolve: {
      assetList: function () {
        return fetchListOfAssets(0, 10);
      },
      deviceTypeList: function () {
        return fetchDeviceType();
      },
      vendorList: function () {
        return fetchVendorList();
      },
      assetDetailsSummary: function () {
        return fetchAssetDetailsSummary();
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
