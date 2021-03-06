require('angular-file-saver');
require('angular-ui-notification');
require('angular-ui-bootstrap');

import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/berlin/styles/main.less';
import 'plugins/kibana/berlin/details/details.less';
import uiRoutes from 'ui/routes';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';

import 'plugins/kibana/berlin/berlin';
import 'plugins/kibana/berlin/user/manage_users/manage_users';
import 'plugins/kibana/berlin/user/roles/roles';
import 'plugins/kibana/berlin/data_source/configuration/configuration';
import 'plugins/kibana/berlin/data_source/storage/storage';
import 'plugins/kibana/berlin/data_source/storage/live_indices/live_indices';
import 'plugins/kibana/berlin/data_source/storage/archived_indices/archived_indices';
import 'plugins/kibana/berlin/data_source/enrichment/enrichment_tables';
import 'plugins/kibana/berlin/data_source/enrichment/enrichment';
import 'plugins/kibana/berlin/data_source/vublock/vublock_list';
import 'plugins/kibana/berlin/data_source/vublock/vublock_details';
import 'plugins/kibana/berlin/data_source/vublock_store/vublock_store_list';
import 'plugins/kibana/berlin/data_source/vublock_store/vublock_modify_data';
import 'plugins/kibana/berlin/data_source/landscape/host_landscape';
import 'plugins/kibana/berlin/preferences/preferences';
import 'plugins/kibana/berlin/definitions/definition';
import 'plugins/kibana/berlin/definitions/credentials/credentials';
import 'plugins/kibana/berlin/definitions/email_groups/email_groups';
import 'plugins/kibana/berlin/about/about';
import 'plugins/kibana/berlin/network_configuration/view_network_configuration';
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
import 'plugins/kibana/berlin/data_source/files/files';
import 'plugins/kibana/berlin/data_source/settings/settings';
import 'plugins/kibana/berlin/image_manager/image_manager.js';
import 'plugins/kibana/berlin/backup/backup.js';
import 'plugins/kibana/berlin/license/license';

import { BerlinConstants } from './berlin_constants';
import { EnrichmentConstants } from './data_source/enrichment/enrichment_constants';
import { ConfigurationConstants } from './data_source/configuration/configuration_constants';
import { StorageConstants } from './data_source/storage/storage_constants';
import { VuBlockConstants } from  './data_source/vublock/vu_block_constants';
import { PreferenceConstants } from './preferences/preference_constants';
import { DefinitionConstants } from './definitions/definition_constants';
import { AboutConstants } from './about/about_constants';
import { NetworkConfigurationConstants } from './network_configuration/network_configuration_constants';
import { DetailsConstants } from './details/details_constants';
import { UserConstants } from './user/user_constants';
import { FilesConstants } from './data_source/files/files_constants';
import { DataRetentionSettingsConstants } from './data_source/settings/settings_constants';
import { ImageManagerInterfaceConstants } from './image_manager/image_manager_constants.js';
import { BackupConstants } from './backup/backup_constants.js';

import enrichmentTablesTemplate from 'plugins/kibana/berlin/data_source/enrichment/enrichment_tables.html';
import enrichmentDataTemplate from 'plugins/kibana/berlin/data_source/enrichment/enrichment.html';
import vuBlockTemplate from 'plugins/kibana/berlin/data_source/vublock/vublock_list.html';
import hostLandscapeTemplate from 'plugins/kibana/berlin/data_source/landscape/host_landscape.html';
import vuBlockDetailsTemplate from 'plugins/kibana/berlin/data_source/vublock/vublock_details.html';
import configurationTemplate from 'plugins/kibana/berlin/data_source/configuration/configuration.html';
import storageTemplate from 'plugins/kibana/berlin/data_source/storage/storage.html';
import preferencesTemplate from 'plugins/kibana/berlin/preferences/preferences.html';
import definitionTemplate from 'plugins/kibana/berlin/definitions/definition.html';
import aboutTemplate from 'plugins/kibana/berlin/about/about.html';
import networkConfiguartionTemplate from 'plugins/kibana/berlin/network_configuration/network_configuration.html';
import detailsTemplate from 'plugins/kibana/berlin/details/details.html';
import userTemplate from './user/user.html';
import vuBlockStoreTemplate from 'plugins/kibana/berlin/data_source/vublock_store/vublock_store_list.html';
import vuBlockModifyTemplate from 'plugins/kibana/berlin/data_source/vublock_store/vublock_modify_data.html';
import filesTemplate from 'plugins/kibana/berlin/data_source/files/files.html';
import settingsTemplate from 'plugins/kibana/berlin/data_source/settings/settings.html';
import imageManagerTemplate from 'plugins/kibana/berlin/image_manager/image_manager.html';
import backupTemplate from 'plugins/kibana/berlin/backup/backup.html';

uiRoutes
  .defaults(/berlin/, {
    requireDefaultIndex: true
  })
  .when(BerlinConstants.BERLIN_PATH + UserConstants.USER_PATH, {
    template: userTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + EnrichmentConstants.ENRICHMENT_TABLES_PATH, {
    template: enrichmentTablesTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + EnrichmentConstants.ENRICHMENT_DATA_PATH, {
    template: enrichmentDataTemplate,
    resolve: {
      tableMetaDataList: function () {
        return apiProvider
          .getAll(EnrichmentConstants.ENRICHMENT_TABLES_API_URL).then(function (data) {
            return data.data;
          });
      }
    }
  })
  .when(BerlinConstants.BERLIN_PATH + VuBlockConstants.VUBLOCK_PATH, {
    template: vuBlockTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + VuBlockConstants.VUBLOCK_STORE_PATH, {
    template: vuBlockStoreTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + VuBlockConstants.VUBLOCK_MODIFY_PATH, {
    template: vuBlockModifyTemplate,
    resolve: {
      vuBlockId: function ($route) {
        return $route.current.params.vuBlockName;
      },
    }
  })
  .when(BerlinConstants.BERLIN_PATH + VuBlockConstants.HOST_LANDSCAPE_PATH, {
    template: hostLandscapeTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + VuBlockConstants.VUBLOCK_DETAILS_PATH, {
    template: vuBlockDetailsTemplate,
    resolve: {
      vuBlock: function (StateService, $route) {
        return StateService.getvuBlockDetails($route.current.params.vuBlockName)
          .then(function (data) {
            return data;
          });
      },
      // visObj: function (savedVisualizations) {
      //   return savedVisualizations.get(
      //     'area-aug').then(function (savedVisualization) {
      //     return savedVisualization;
      //   });
      // }
    }
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
  })
  .when(BerlinConstants.BERLIN_PATH + FilesConstants.FILES_PATH, {
    template: filesTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + DataRetentionSettingsConstants.DATA_RETENTION_SETTINGS_PATH, {
    template: settingsTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + ImageManagerInterfaceConstants.IMAGEMANAGER_PATH, {
    template: imageManagerTemplate,
  })
  .when(BerlinConstants.BERLIN_PATH + BackupConstants.BACKUP_PATH, {
    template: backupTemplate,
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
