import 'plugins/kibana/storyboard/storyboard_app';
import 'plugins/kibana/storyboard/styles/main.less';
import 'plugins/kibana/storyboard/saved_storyboard/saved_storyboards';
import 'plugins/kibana/storyboard/storyboard_config';
import uiRoutes from 'ui/routes';
import { notify } from 'ui/notify';
import storyboardListingTemplate from './listing/storyboard_listing.html';
import { StoryboardListingController } from './listing/storyboard_listing';

import storyboardTemplate from 'plugins/kibana/storyboard/storyboard_app.html';
import { StoryBoardConstants, createStoryboardEditUrl } from './storyboard_constants';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { SavedObjectNotFound } from 'ui/errors';

uiRoutes
  .defaults(/storyboard/, {
    requireDefaultIndex: true
  })
  .when(StoryBoardConstants.LANDING_PAGE_PATH, {
    template: storyboardListingTemplate,
    controller: StoryboardListingController,
    controllerAs: 'listingController',
    resolve: {
      storyboard: function ($route, Private, courier, kbnUrl) {
        const savedObjectsClient = Private(SavedObjectsClientProvider);
        const title = $route.current.params.title;
        if (title) {
          return savedObjectsClient.find({
            search: `"${title}"`,
            search_fields: 'title',
            type: 'storyboard',
          }).then(results => {
            // The search isn't an exact match, lets see if we can find a single exact match to use
            const matchingStoryboards = results.savedObjects.filter(
              storyboard => storyboard.attributes.title.toLowerCase() === title.toLowerCase());
            if (matchingStoryboards.length === 1) {
              kbnUrl.redirect(createStoryboardEditUrl(matchingStoryboards[0].id));
            } else {
              kbnUrl.redirect(`${StoryBoardConstants.LANDING_PAGE_PATH}?filter="${title}"`);
            }
            throw uiRoutes.WAIT_FOR_URL_CHANGE_TOKEN;
          }).catch(courier.redirectWhenMissing({
            'storyboard': StoryBoardConstants.LANDING_PAGE_PATH
          }));
        }
      },
    }
  })
  .when(StoryBoardConstants.CREATE_NEW_STORYBOARD_URL, {
    template: storyboardTemplate,
    resolve: {
      storyboard: function (savedStoryboards, courier) {
        return savedStoryboards.get()
          .catch(courier.redirectWhenMissing({
            'storyboard': StoryBoardConstants.LANDING_PAGE_PATH
          }));
      },
    }
  })
  .when(createStoryboardEditUrl(':id'), {
    template: storyboardTemplate,
    resolve: {
      storyboard: function (savedStoryboards, Notifier, $route, $location, courier, kbnUrl, AppState) {
        const id = $route.current.params.id;
        return savedStoryboards.get(id)
          .catch((error) => {
            if (error instanceof SavedObjectNotFound && id === 'create') {
              // Note "new AppState" is neccessary so the state in the url is preserved through the redirect.
              kbnUrl.redirect(StoryBoardConstants.CREATE_NEW_STORYBOARD_URL, {}, new AppState());
            } else {
              // Display the error message to the user.
              notify.error(error);
              throw error;
            }
          })
          .catch(courier.redirectWhenMissing({
            'storyboard': StoryBoardConstants.LANDING_PAGE_PATH
          }));
      },
    }
  });

FeatureCatalogueRegistryProvider.register(() => {
  return {
    id: 'storyboard',
    title: 'Storyboard',
    description: 'Display a collection of dashboards.',
    icon: '/plugins/kibana/assets/app_storyboard.svg',
    path: `/app/kibana#${StoryBoardConstants.LANDING_PAGE_PATH}`,
    showOnHomePage: true,
    category: FeatureCatalogueCategory.DATA
  };
});