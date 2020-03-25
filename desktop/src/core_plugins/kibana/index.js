import {
  resolve
} from 'path';

import Promise from 'bluebird';
import {
  mkdirp as mkdirpNode
} from 'mkdirp';

import manageUuid from './server/lib/manage_uuid';
import search from './server/routes/api/search';
import {
  scrollSearchApi
} from './server/routes/api/scroll_search';
import {
  importApi
} from './server/routes/api/import';
import {
  exportApi
} from './server/routes/api/export';
import scripts from './server/routes/api/scripts';
import {
  registerSuggestionsApi
} from './server/routes/api/suggestions';
import {
  reportDownloadApi
} from './server/routes/api/report';
import {
  registerFieldFormats
} from './server/field_formats/register';
import * as systemApi from './server/lib/system_api';
import handleEsError from './server/lib/handle_es_error';
import mappings from './mappings.json';
import {
  getUiSettingDefaults
} from './ui_setting_defaults';

import {
  injectVars
} from './inject_vars';

const mkdirp = Promise.promisify(mkdirpNode);

export default function (kibana) {
  const kbnBaseUrl = '/app/vienna';
  return new kibana.Plugin({
    id: 'kibana',
    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultAppId: Joi.string().default('home'),
        index: Joi.string().default('.kibana')
      }).default();
    },

    uiExports: {
      hacks: ['plugins/kibana/dev_tools/hacks/hide_empty_tools'],
      fieldFormats: ['plugins/kibana/field_formats/register'],
      savedObjectTypes: [
        'plugins/kibana/visualize/saved_visualizations/saved_visualization_register',
        'plugins/kibana/discover/saved_searches/saved_search_register',
        'plugins/kibana/dashboard/saved_dashboard/saved_dashboard_register',
        'plugins/kibana/alert/saved_alert/saved_alert_register',
        'plugins/kibana/anomaly/saved_anomaly/saved_anomaly_register',
        'plugins/kibana/report/saved_report/saved_report_register',
      ],
      app: {
        id: 'vienna',
        title: 'Vienna',
        listed: false,
        description: 'the kibana you know and love',
        main: 'plugins/kibana/kibana',
        uses: [
          'home',
          'visTypes',
          'visResponseHandlers',
          'visRequestHandlers',
          'visEditorTypes',
          'savedObjectTypes',
          'spyModes',
          'fieldFormats',
          'fieldFormatEditors',
          'navbarExtensions',
          'managementSections',
          'devTools',
          'docViews',
          'embeddableFactories',
        ],
        injectVars,
      },

      links: [{
        id: 'kibana:management',
        title: 'Advanced',
        order: -1000,
        url: `${kbnBaseUrl}#/management`,
        description: 'define index patterns, change config, and more',
        icon: 'plugins/kibana/assets/settings.svg',
        linkToLastSubUrl: false,
        group: 'Settings'
      }, {
        id: 'berlin:about',
        title: 'About',
        description: 'About',
        order: 9003,
        url: `${kbnBaseUrl}#/berlin/about`,
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'Settings'
      }, {
        id: 'kibana:anomaly',
        title: 'Anomaly Detection',
        order: -1001,
        url: `${kbnBaseUrl}#/anomalys`,
        description: 'Anomaly Detection',
        subUrlBase: `${kbnBaseUrl}#/anomaly`,
        group: 'Monitors'
      }, {
        id: 'kibana:report',
        title: 'Report',
        order: -1002,
        url: `${kbnBaseUrl}#/reports`,
        description: 'create highly customized reports',
        icon: 'plugins/kibana/assets/report.svg',
        subUrlBase: `${kbnBaseUrl}#/report`,
        group: 'Monitors'
      }, {
        id: 'kibana:alert',
        title: 'Manage Alerts',
        order: -1003,
        url: `${kbnBaseUrl}#/alerts`,
        description: 'Smart and intelligent alerts',
        subUrlBase: `${kbnBaseUrl}#/alert`,
        icon: 'plugins/kibana/assets/alert.svg',
        group: 'Monitors'
      }, {
        id: 'kibana:visualize',
        title: 'Visualizations',
        order: -1004,
        url: `${kbnBaseUrl}#/visualize`,
        description: 'design data visualizations',
        icon: 'plugins/kibana/assets/visualize.svg',
        group: 'Insights'
      }, {
        id: 'kibana:discover',
        title: 'Search',
        order: -1005,
        url: `${kbnBaseUrl}#/discover`,
        description: 'interactively explore your data',
        icon: 'plugins/kibana/assets/discover.svg',
        group: 'Insights'
      }, {
        id: 'kibana:event',
        title: 'Event',
        order: -1006,
        url: `${kbnBaseUrl}#/event`,
        // The subUrlBase is the common substring of all urls for this app. If not given, it defaults to the url
        // above. This app has to use a different subUrlBase. When we introduced a landing page, we needed to change
        // the url above in order to preserve the original url for BWC. The subUrlBase helps the Chrome api nav
        // to determine what url to use for the app link.
        subUrlBase: `${kbnBaseUrl}#/event`,
        description: 'compose visualizations for much win',
        icon: 'plugins/kibana/assets/event.svg',
        group: 'Insights'
      }, {
        id: 'kibana:storyboard',
        title: 'Insights',
        order: -1008,
        url: `${kbnBaseUrl}#/storyboards`,
        // The subUrlBase is the common substring of all urls for this app. If not given, it defaults to the url
        // above. This app has to use a different subUrlBase, in addition to the url above, because "#/storyboard"
        // routes to a page that creates a new storyboard. When we introduced a landing page, we needed to change
        // the url above in order to preserve the original url for BWC. The subUrlBase helps the Chrome api nav
        // to determine what url to use for the app link.
        subUrlBase: `${kbnBaseUrl}#/storyboard`,
        description: 'compose dashboards for your infrastructure',
        icon: 'plugins/kibana/assets/dashboard.svg',
        group: 'Insights'
      }, {
        id: 'kibana:dashboard',
        title: 'Insights',
        order: -1007,
        url: `${kbnBaseUrl}#/dashboards`,
        // The subUrlBase is the common substring of all urls for this app. If not given, it defaults to the url
        // above. This app has to use a different subUrlBase, in addition to the url above, because "#/dashboard"
        // routes to a page that creates a new dashboard. When we introduced a landing page, we needed to change
        // the url above in order to preserve the original url for BWC. The subUrlBase helps the Chrome api nav
        // to determine what url to use for the app link.
        subUrlBase: `${kbnBaseUrl}#/dashboard`,
        description: 'compose visualizations for much win',
        icon: 'plugins/kibana/assets/dashboard.svg',
        group: 'Insights'
      },
      {
        id: 'kibana:users',
        title: 'User',
        order: 9002,
        url: `${kbnBaseUrl}#/berlin/user/users`,
        description: 'Manage User',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'User',
      },
      {
        id: 'kibana:roles',
        title: 'Roles',
        order: 9003,
        url: `${kbnBaseUrl}#/berlin/user/roles`,
        description: 'Manage Roles',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'User',
      },
      {
        id: 'kibana:preferences',
        title: 'Preferences',
        order: 9004,
        url: `${kbnBaseUrl}#/berlin/preferences`,
        description: 'Manage User preferences',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'User',
      },
      {
        id: 'kibana:configuration',
        title: 'Configuration',
        order: 9005,
        url: `${kbnBaseUrl}#/berlin/data_source/configuration/`,
        description: 'Live Indices',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'Data Source',
      },
      {
        id: 'kibana:live_indices',
        title: 'Live Indices',
        order: 9005,
        url: `${kbnBaseUrl}#/berlin/data_source/storage/live_indices`,
        description: 'Live Indices',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'Data Source',
      },
      {
        id: 'kibana:archived_indices',
        title: 'Archived Indices',
        order: 9006,
        url: `${kbnBaseUrl}#/berlin/data_source/storage/archived_indices`,
        description: 'Archive indices',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'Data Source',
      },
      {
        id: 'kibana:enrichment',
        title: 'Enrichment',
        order: 9007,
        url: `${kbnBaseUrl}#/berlin/data_source/enrichment`,
        description: 'Enrichment',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'Data Source',
      },
      {
        id: 'kibana:credentials',
        title: 'Credentials',
        order: 9008,
        url: `${kbnBaseUrl}#/berlin/credentials`,
        description: 'Credentials',
        icon: 'plugins/kibana/assets/app_advanced_settings.svg',
        group: 'Settings',
      },
        // Hide dev tools section in top navbar.
        // {
        //   id: 'kibana:dev_tools',
        //   title: 'Dev Tools',
        //   order: 9001,
        //   url: '/app/kibana#/dev_tools',
        //   description: 'development tools',
        //   icon: 'plugins/kibana/assets/wrench.svg'
        // },
      ],

      injectDefaultVars(server, options) {
        return {
          kbnIndex: options.index,
          kbnBaseUrl
        };
      },

      translations: [
        resolve(__dirname, './translations/en.json')
      ],

      mappings,
      uiSettingDefaults: getUiSettingDefaults(),
    },

    preInit: async function (server) {
      try {
        // Create the data directory (recursively, if the a parent dir doesn't exist).
        // If it already exists, does nothing.
        await mkdirp(server.config().get('path.data'));
      } catch (err) {
        server.log(['error', 'init'], err);
        // Stop the server startup with a fatal error
        throw err;
      }
    },

    init: function (server) {
      // uuid
      manageUuid(server);
      // routes
      search(server);
      scripts(server);
      scrollSearchApi(server);
      importApi(server);
      exportApi(server);
      registerSuggestionsApi(server);
      registerFieldFormats(server);
      reportDownloadApi(server);

      server.expose('systemApi', systemApi);
      server.expose('handleEsError', handleEsError);
      server.expose('injectVars', injectVars);

    }
  });
}
