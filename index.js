import { HostBasedProxyConfigCollection } from './server/host_based_proxy_config';

module.exports = function (kibana) {
  let { resolve, join, sep } = require('path');
  let Joi = require('joi');
  let Boom = require('boom');
  let modules = resolve(__dirname, 'public/webpackShims/');
  let src = resolve(__dirname, 'public/src/');
  let { existsSync } = require('fs');
  const { startsWith, endsWith } = require('lodash');

  const apps = [
    {
      title: 'Sense',
      description: 'JSON aware developer\'s interface to ElasticSearch',
      icon: 'plugins/sense/bonsai.png',
      main: 'plugins/sense/sense',
      injectVars: function (server, options) {
        return options;
      }
    }
  ];

  if (existsSync(resolve(__dirname, 'public/tests'))) {
    apps.push({
      title: 'Sense Tests',
      id: 'sense-tests',
      main: 'plugins/sense/tests',
      hidden: true
      //listed: false // uncomment after https://github.com/elastic/kibana/pull/4755
    });
  }

  return new kibana.Plugin({
    id: 'sense',

    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultServerUrl: Joi.string().default('http://localhost:9200'),
        proxyFilter: Joi.array().items(Joi.string()).single().default(['.*']),
        ssl: Joi.object({
          verify: Joi.boolean(),
        }).default(),
        proxyConfig: Joi.array().items(
          Joi.object().keys({
            match: Joi.object().keys({
              protocol: Joi.string().default('*'),
              host: Joi.string().default('*'),
              port: Joi.string().default('*'),
              path: Joi.string().default('*')
            }),

            timeout: Joi.number(),
            ssl: Joi.object().keys({
              verify: Joi.boolean(),
              ca: Joi.array().single().items(Joi.string()),
              cert: Joi.string(),
              key: Joi.string()
            }).default()
          })
        ).default([
          {
            match: {
              protocol: '*',
              hostname: '*',
              port: '*',
              path: '*'
            },

            timeout: 180000,
            ssl: {
              verify: true
            }
          }
        ])
      }).default();
    },

    init: function (server, options) {
      const filters = options.proxyFilter.map(str => new RegExp(str));

      if (options.ssl && options.ssl.verify) {
        throw new Error('sense.ssl.version is no longer supported.');
      }

      const hostBasedProxyConfig = new HostBasedProxyConfigCollection(options.proxyConfig);

      // http://hapijs.com/api/8.8.1#route-configuration
      server.route({
        path: '/api/sense/proxy',
        method: ['*', 'GET'],
        config: {
          validate: {
            query: Joi.object().keys({
              uri: Joi.string().uri({
                allowRelative: false,
                shema: ['http:', 'https:'],
              }),
            }).unknown(true),
          },

          pre: [
            function filterUri(req, reply) {
              const { uri } = req.query;

              if (!filters.some(re => re.test(uri))) {
                const err = Boom.forbidden();
                err.output.payload = "Error connecting to '" + uri + "':\n\nUnable to send requests to that url.";
                err.output.headers['content-type'] = 'text/plain';
                reply(err);
              } else {
                reply();
              }
            }
          ]
        },

        handler(req, reply) {
          const { uri } = req.query;

          reply.proxy({
            uri,
            xforward: true,
            passThrough: true,
            onResponse(err, res, request, reply, settings, ttl) {
              if (err != null) {
                reply("Error connecting to '" + request.query.uri + "':\n\n" + err.message).type("text/plain").statusCode = 502;
              } else {
                reply(null, res);
              }
            },

            ...hostBasedProxyConfig.configForUri(uri)
          })
        }
      });

      server.route({
        path: '/api/sense/api_server',
        method: ['GET', 'POST'],
        handler: function (req, reply) {
          let server = require('./api_server/server');
          let {sense_version, apis} = req.query;
          if (!apis) {
            reply(Boom.badRequest('"apis" is a required param.'));
            return;
          }

          return server.resolveApi(sense_version, apis.split(","), reply);
        }
      });

      const testApp = kibana.uiExports.apps.hidden.byId['sense-tests'];
      if (testApp) {
        server.route({
          path: '/app/sense-tests',
          method: 'GET',
          handler: function (req, reply) {
            return reply.renderApp(testApp);
          }
        });
      }
    },

    uiExports: {
      apps: apps,

      noParse: [
        join(modules, 'ace' + sep),
        join(modules, 'moment_src/moment' + sep),
        join(src, 'sense_editor/mode/worker.js')
      ]
    }
  })
};
