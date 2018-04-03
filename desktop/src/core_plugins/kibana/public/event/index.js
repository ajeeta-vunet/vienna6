import 'plugins/kibana/event/event';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import 'plugins/kibana/event/styles/main.less';
import uiRoutes from 'ui/routes';
import chrome from 'ui/chrome';
import { EventConstants } from './event_constants';
import eventTemplate from 'plugins/kibana/event/event.html';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { findObjectByTitle } from 'ui/saved_objects/find_object_by_title.js';

uiRoutes
  .defaults(/event/, {
    requireDefaultIndex: true
  })
  .when(EventConstants.EVENT_PATH, {
    template: eventTemplate,
    resolve: {
      index: function (Private) {
        const savedObjectsClient = Private(SavedObjectsClientProvider);

        // Get the complete index name passing the index type
        const indexTitle = chrome.getVunetIndexName('notification');

        // Get the index object and then the 'id' using the index 'title'
        return findObjectByTitle(savedObjectsClient, 'index-pattern', indexTitle)
          .then((idx) => {
            return idx.id;
          });
      }
    }
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'event',
    title: 'Event',
    description: 'Monitor your alerts',
    icon: '/plugins/kibana/assets/app_event.svg',
    path: '/app/kibana#/event',
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});
