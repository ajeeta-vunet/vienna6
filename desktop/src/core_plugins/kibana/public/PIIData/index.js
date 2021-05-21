import 'plugins/kibana/PIIData/piiData';
import {
  FeatureCatalogueRegistryProvider,
  FeatureCatalogueCategory,
} from 'ui/registry/feature_catalogue';
import 'plugins/kibana/PIIData/main.less';
import uiRoutes from 'ui/routes';
import encryptDataTemplate from 'plugins/kibana/PIIData/piiData.html';

uiRoutes
  .defaults(/piiData/, {
    requireDefaultIndex: true,
  })
  .when('/piiData', {
    template: encryptDataTemplate,
    resolve: {},
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'piiData',
    title: 'PII Data',
    description: 'Convert data into equivalent Hash value',
    icon: '',
    path: '/app/kibana#/piiData',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA,
  };
});
