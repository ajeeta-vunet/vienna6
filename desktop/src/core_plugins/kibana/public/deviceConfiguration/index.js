import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import { DeviceConfigConstants } from './deviceConfigurationConstants';
import deviceConfigurationTemplate from './deviceConfiguration.html';
import './deviceConfiguration';
// import deviceFamiliesTemplate from './deviceFamiliesTab.html';
// import './deviceFamiliesTab';

uiRoutes
  .defaults(/deviceConfiguration/, {
    requireDefaultIndex: true
  })
  .when(DeviceConfigConstants.LANDING_PAGE_PATH, {
    template: deviceConfigurationTemplate
  })
  // .when(DeviceConfigConstants.DEVICE_FAMILIES, {
  //   template: deviceFamiliesTemplate
  // });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'deviceConfiguration',
    title: 'DeviceConfiguration',
    description: 'Device Configuration Management',
    icon: '',
    path: '/app/vienna#/deviceConfiguration',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});