require('angular-file-saver');
require('angular-ui-notification');
require('angular-ui-bootstrap');

import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/berlin/styles/main.less';
import 'plugins/kibana/berlin/details/details.less';
import uiRoutes from 'ui/routes';

import 'plugins/kibana/berlin/berlin';
import 'plugins/kibana/berlin/user/manage_users/manage_users';
import 'plugins/kibana/berlin/user/roles/roles';
import 'plugins/kibana/berlin/data_source/configuration/configuration';
import 'plugins/kibana/berlin/data_source/storage/storage';
import 'plugins/kibana/berlin/data_source/storage/live_indices/live_indices';
import 'plugins/kibana/berlin/data_source/storage/archived_indices/archived_indices';
import 'plugins/kibana/berlin/data_source/enrichment/enrichment_groups';
import 'plugins/kibana/berlin/data_source/enrichment/enrichment';
import 'plugins/kibana/berlin/preferences/preferences';
import 'plugins/kibana/berlin/definitions/definition';
import 'plugins/kibana/berlin/definitions/credentials/credentials';
import 'plugins/kibana/berlin/definitions/email_groups/email_groups';
import 'plugins/kibana/berlin/data_source/enrichment/enrichment_table.directive';
import 'plugins/kibana/berlin/about/about';
// import 'plugins/kibana/berlin/network_configuration/view_network_configuration';
import 'plugins/kibana/berlin/details/details';
import 'plugins/kibana/berlin/user/user';
import 'plugins/kibana/berlin/network_configuration/network_configuration';
import 'plugins/kibana/berlin/data_source/configuration/deviceheartbeatDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/cliDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/configurationcollectorDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/healthbeatDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/jdbcDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/logbeatDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/logcollectorDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/netflowDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/serviceheartbeatDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/snmpDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/syslogDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/tracepathbeatDataSource.directive';
import 'plugins/kibana/berlin/data_source/configuration/urlheartbeatDataSource.directive';


import { BerlinConstants } from './berlin_constants';
import { EnrichmentConstants } from './data_source/enrichment/enrichment_constants';
import { ConfigurationConstants } from './data_source/configuration/configuration_constants';
import { StorageConstants } from './data_source/storage/storage_constants';
import { PreferenceConstants } from './preferences/preference_constants';
import { DefinitionConstants } from './definitions/definition_constants';
import { AboutConstants } from './about/about_constants';
import { NetworkConfigurationConstants } from './network_configuration/network_configuration_constants';
import { DetailsConstants } from './details/details_constants';
import { UserConstants } from './user/user_constants';

import enrichmentGroupsTemplate from 'plugins/kibana/berlin/data_source/enrichment/enrichment_groups.html';
import enrichmentTemplate from 'plugins/kibana/berlin/data_source/enrichment/enrichment.html';
import configurationTemplate from 'plugins/kibana/berlin/data_source/configuration/configuration.html';
import storageTemplate from 'plugins/kibana/berlin/data_source/storage/storage.html';
import preferencesTemplate from 'plugins/kibana/berlin/preferences/preferences.html';
import definitionTemplate from 'plugins/kibana/berlin/definitions/definition.html';
import aboutTemplate from 'plugins/kibana/berlin/about/about.html';
import networkConfiguartionTemplate from 'plugins/kibana/berlin/network_configuration/network_configuration.html';
import detailsTemplate from 'plugins/kibana/berlin/details/details.html';
import userTemplate from './user/user.html';


uiRoutes
  .defaults(/berlin/, {
    requireDefaultIndex: true
  })
  .when(BerlinConstants.BERLIN_PATH + UserConstants.USER_PATH, {
    template: userTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + EnrichmentConstants.ENRICHMENT_GROUPS_PATH, {
    template: enrichmentGroupsTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + EnrichmentConstants.ENRICHMENT_PATH, {
    template: enrichmentTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + ConfigurationConstants.CONFIGURATION_PATH, {
    template: configurationTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + StorageConstants.STORAGE_PATH, {
    template: storageTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + PreferenceConstants.PREFERENCE_PATH, {
    template: preferencesTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + DefinitionConstants.DEFINITION_PATH, {
    template: definitionTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + AboutConstants.ABOUT_PATH, {
    template: aboutTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + NetworkConfigurationConstants.NETWORK_CONFIGURATION_PATH, {
    template: networkConfiguartionTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + DetailsConstants.DETAILS_PATH, {
    template: detailsTemplate,
    controller: 'DetailsCtrl'
  });


FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'berlin',
    title: 'Berlin',
    description: 'Manage Vienna',
    icon: 'plugins/kibana/assets/app_advanced_settings.svg',
    path: '/app/vienna#/berlin',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
