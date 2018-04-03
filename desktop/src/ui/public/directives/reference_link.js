import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';

require('ui/courier');

const app = require('ui/modules').get('kibana', [
  'kibana/courier'
]);

app.directive('vudataReferenceLink', function (Private) {
  return {
    restrict: 'E',
    scope: {
      referenceLink: '=',
    },
    template: require('ui/partials/reference_link.html'),
    link: function (scope) {

      const services = Private(SavedObjectRegistryProvider).byLoaderPropertiesName;
      const dashboardService = services.dashboards;

      // Set the reference-link-type
      scope.setReferenceLinkType = function () {

        // If reference link type is dashboard, we need to get the
        // list of dashboards
        dashboardService.find('', 1000).then(result => {
          // Get list of dashboards
          scope.dashboardList = result.hits.map(hit => {
            const dashboardObj = {
              'id': hit.id,
              'title': hit.title
            };

            return dashboardObj;
          });

        });
      };

      scope.dashboardList = [];

      // Initialize stuff
      function init() {
        // If there is a dashboard, we need to get that and add it as
        // reference to the dashboard list
        scope.setReferenceLinkType();
      }

      init();
    }
  };
});
