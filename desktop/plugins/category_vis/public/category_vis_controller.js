import { uiModules } from 'ui/modules';
import { getDashboardsForCategory } from 'ui/utils/link_info_eval.js';

const module = uiModules.get('kibana/category_vis', ['kibana']);

module.controller('KbnCategoryVisController', function ($scope, Private, timefilter) {
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
      $scope.dashboards = getDashboardsForCategory(Private, timefilter, dashboardList);
    }
  });
});
