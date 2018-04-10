import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/category_vis', ['kibana']);

module.controller('KbnCategoryVisController', function ($scope) {
  $scope.show_dashboards = false;
  $scope.dashboards = [];

  $scope.$watch('vis.params', function (resp) {
    $scope.category_image = `/ui/vienna_images/${resp.image}`;
  });

  // Show dashboards which are behind the category description
  $scope.toggleDisplayDashboards = function () {
    $scope.show_dashboards = !$scope.show_dashboards;
  };

  // Find the title for each dashboard by the dashboard ids in vis object
  $scope.$watch('vis.params.dashboards', function (dashboardList) {

    if (dashboardList.length !== 0) {

      // Initializing a list to store dashboard objects containing
      // id, title and url.
      $scope.dashboards = [];

      // prepare the dashboard object with id, title and url.
      dashboardList.forEach(function (dashboard) {
        $scope.dashboards.push({
          id: dashboard.id,
          title: dashboard.title,
          url: `#/dashboard/${dashboard.id}`
        });
      });
    }
  });
});
