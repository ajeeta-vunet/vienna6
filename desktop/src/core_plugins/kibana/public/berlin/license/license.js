import {
  FeatureCatalogueRegistryProvider,
  FeatureCatalogueCategory,
} from 'ui/registry/feature_catalogue';
import uiRoutes from 'ui/routes';
import licenseTemplate from './license.html';
import { LicenseUsage } from './license_usage';

uiRoutes.when('/berlin/license', {
  template: licenseTemplate,
  resolve: {
    licenseModulesUsageLimit: function (StateService) {
      return StateService.getLicenseUsageLimit().then(function (
        licenseUsageLimit
      ) {
        return licenseUsageLimit;
      });
    },
    licenseModulesActiveUsage: function (StateService) {
      return StateService.getLicenseActiveUsage().then(function (
        licenseActiveUsage
      ) {
        return licenseActiveUsage;
      });
    },
  },
});

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'licenseUsage',
    title: 'LicenseUsage',
    description: 'Monitor you license',
    icon: '',
    path: '/app/kibana#/berlin/license',
    showOnHomePage: false,
    category: FeatureCatalogueCategory.DATA,
  };
});
