require('ui/courier');

import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/category_vis', ['kibana']);
module.controller('CategoryVisParamsController', function ($scope, $rootScope, courier, $filter, Private) {

  $scope.operDashboardsList = [];

  $scope.search = function () {
    $rootScope.$broadcast('courier:searchRefresh');
  };

  // Delete one of the dashboards configured.
  $scope.removeDashboard = function (index) {
    $scope.vis.params.dashboards.splice(index, 1);
    $scope.operDashboardsList.splice(index, 1);
  };

  // Add a new dashboard to category
  $scope.addDashboard = function () {
    $scope.vis.params.dashboards.splice($scope.vis.params.dashboards.length, 0, {});
    initDashboard($scope.vis.params.dashboards.length - 1);
    $scope.operDashboardsList.push({ expanded: false });
  };

  // This will move element inside array
  // from old position to new position
  function move(arr, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    $scope.operDashboardsList.splice(newIndex, 0, $scope.operDashboardsList.splice(oldIndex, 1)[0]);
  }

  // Move a dashboard one position above the
  // current position.
  $scope.moveUp = function (index) {
    move($scope.vis.params.dashboards, index, index - 1);
  };

  // Move a dashboard one position below the
  // current position.
  $scope.moveDown = function (index) {
    move($scope.vis.params.dashboards, index, index + 1);
  };

  // This function gets called for each dashboard
  function initDashboard(bmIndex) {
    $scope.vis.params.dashboards[bmIndex].searchString = '';
    $scope.vis.params.dashboards[bmIndex].label = '';
    $scope.vis.params.dashboards[bmIndex].useCurrentTime = false;
    $scope.vis.params.dashboards[bmIndex].dashboard = '';
  }

  // Get all the available dashboards to display
  const savedObjectsClient = Private(SavedObjectsClientProvider);
  savedObjectsClient.find({
    type: 'dashboard',
    fields: ['title'],
    perPage: 1000
  }).then(response => {
    // Create a list of dashboarads for showing in the dashboard selection
    // list
    $scope.dashboardList = response.savedObjects.map(pattern => {
      const id = pattern.id;
      const dashboard = {
        id: id,
        title: pattern.get('title'),
      };
      return dashboard;
    });

    // for edit
    // check if dashboard exists loop through to populate
    if (!($scope.vis.params.dashboards)) {
      $scope.operDashboardsList.push({ expanded: false });
      $scope.vis.params = {
        dashboards: [{}]
      };
      initDashboard(0);
    } else {
      $scope.vis.params.dashboards.forEach(function () {
        $scope.operDashboardsList.push({ expanded: false });
      });
    }
  });
});
