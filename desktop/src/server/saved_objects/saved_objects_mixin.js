import { SavedObjectsClient } from './client';

import {
  createBulkGetRoute,
  createCreateRoute,
  createDeleteRoute,
  createFindRoute,
  createGetRoute,
  createUpdateRoute,
} from './routes';

export function savedObjectsMixin(kbnServer, server) {
  const prereqs = {
    getSavedObjectsClient: {
      assign: 'savedObjectsClient',
      method(req, reply) {
        reply(req.getSavedObjectsClient());
      },
    },
  };

  server.route(createBulkGetRoute(prereqs));
  server.route(createCreateRoute(prereqs));
  server.route(createDeleteRoute(prereqs));
  server.route(createFindRoute(prereqs));
  server.route(createGetRoute(prereqs));
  server.route(createUpdateRoute(prereqs));

  async function onBeforeWrite() {
    const adminCluster = server.plugins.elasticsearch.getCluster('admin');

    try {
      const index = server.config().get('kibana.index');
      await adminCluster.callWithInternalUser('indices.putTemplate', {
        name: `kibana_index_template:${index}`,
        body: {
          template: index,
          settings: {
            number_of_shards: 1,
          },
          mappings: server.getKibanaIndexMappingsDsl(),
        },
      });
    } catch (error) {
      server.log(['debug', 'savedObjects'], {
        tmpl: 'Attempt to write indexTemplate for SavedObjects index failed: <%= err.message %>',
        es: {
          resp: error.body,
          status: error.status,
        },
        err: {
          message: error.message,
          stack: error.stack,
        },
      });

      // We reject with `es.ServiceUnavailable` because writing an index
      // template is a very simple operation so if we get an error here
      // then something must be very broken
      throw new adminCluster.errors.ServiceUnavailable();
    }
  }

  server.decorate('server', 'savedObjectsClientFactory', (tenantId, buId, { callCluster }) => {

    // Create the kibana index using tenant and bu id
    const kbnIndex = '.kibana' + '-' + tenantId + '-' + buId;

    return new SavedObjectsClient({
      //index: server.config().get('kibana.index'),
      index: kbnIndex,
      mappings: server.getKibanaIndexMappingsDsl(),
      callCluster,
      onBeforeWrite,
    });
  });

  const savedObjectsClientCache = new WeakMap();
  server.decorate('request', 'getSavedObjectsClient', function () {
    const request = this;

    // Get the tenant and bu id from the request header
    const tenantId = request.headers.tenant_id;
    const buId = request.headers.bu_id;

    if (savedObjectsClientCache.has(request)) {
      return savedObjectsClientCache.get(request);
    }

    const { callWithRequest } = server.plugins.elasticsearch.getCluster('admin');
    const callCluster = (...args) => callWithRequest(request, ...args);
    // We need to pass tenant/bu id to this factory which uses it internally to
    // create tenant/bu specific kibana index and use that
    const savedObjectsClient = server.savedObjectsClientFactory(tenantId, buId, { callCluster });

    savedObjectsClientCache.set(request, savedObjectsClient);
    return savedObjectsClient;
  });
}
