import manageUuid from './server/lib/manage_uuid';
import ingest from './server/routes/api/ingest';
import search from './server/routes/api/search';
import settings from './server/routes/api/settings';
import scripts from './server/routes/api/scripts';

module.exports = function (kibana) {
  const kbnBaseUrl = '/app/kibana';
  return new kibana.Plugin({
    id: 'kibana',
    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultAppId: Joi.string().default('discover'),
        index: Joi.string().default('.kibana')
      }).default();
    },

    uiExports: {
      app: {
        id: 'kibana',
        title: 'Kibana',
        listed: false,
        description: 'the kibana you know and love',
        main: 'plugins/kibana/kibana',
        uses: [
          'visTypes',
          'spyModes',
          'fieldFormats',
          'navbarExtensions',
          'managementSections',
          'devTools',
          'docViews'
        ],

        injectVars: function (server, options) {
          let config = server.config();
          return {
            kbnDefaultAppId: config.get('kibana.defaultAppId'),
            tilemap: config.get('tilemap')
          };
        },
      },

      links: [
        {
          id: 'kibana:discover',
          title: 'Discover',
          order: -1003,
          url: `${kbnBaseUrl}#/discover`,
          description: 'interactively explore your data',
          icon: 'plugins/kibana/assets/discover.svg',
        },
        {
          id: 'kibana:visualize',
          title: 'Visualize',
          order: -1002,
          url: `${kbnBaseUrl}#/visualize`,
          description: 'design data visualizations',
          icon: 'plugins/kibana/assets/visualize.svg',
        },
        {
          id: 'kibana:dashboard',
          title: 'Dashboard',
          order: -1001,
          url: `${kbnBaseUrl}#/dashboard`,
          description: 'compose visualizations for much win',
          icon: 'plugins/kibana/assets/dashboard.svg',
        },
        {
          id: 'kibana:management',
          title: 'Management',
          order: 1000,
          url: `${kbnBaseUrl}#/management`,
          description: 'define index patterns, change config, and more',
          icon: 'plugins/kibana/assets/settings.svg',
          linkToLastSubUrl: false
        },
        {
          title: 'DevTools',
          order: 1010,
          url: '/app/kibana#/dev_tools',
          description: 'development tools',
          icon: 'plugins/kibana/assets/wrench.svg'
        }
      ],
      injectDefaultVars(server, options) {
        return {
          kbnIndex: options.index,
          kbnBaseUrl
        };
      },
    },

    init: function (server, options) {
      // uuid
      manageUuid(server);
      // routes
      ingest(server);
      search(server);
      settings(server);
      scripts(server);
    }
  });

};
