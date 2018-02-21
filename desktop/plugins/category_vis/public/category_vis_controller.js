import { uiModules } from 'ui/modules';
import { SavedObjectsClientProvider } from 'ui/saved_objects';

const module = uiModules.get('kibana/category_vis', ['kibana']);

module.controller('KbnCategoryVisController', function ($scope, Private) {
  $scope.show_dashboards = false;
  $scope.dashboards = [];
  const savedObjectsClient = Private(SavedObjectsClientProvider);

  $scope.$watch('vis.params', function (resp) {
    $scope.category_image = `/ui/vienna_images/${resp.image}`;
  });

  // Show dashboards which are behind the category description
  $scope.toggleDisplayDashboards = function () {
    $scope.show_dashboards = !$scope.show_dashboards;
  };

  // Find the title for each dashboard by the dashboard ids in vis object
  $scope.$watch('vis.params.dashboards', function (dashboardIds) {

    if (dashboardIds.length !== 0) {

      $scope.dashboards = [];

      dashboardIds.forEach(function (dashboardId) {

        savedObjectsClient.get('dashboard', dashboardId).then(results => {
          $scope.dashboards.push({
            id: dashboardId,
            title: results.attributes.title,
            url: `#/dashboard/${dashboardId}`
          });
        });
      });
    }
  });
});
