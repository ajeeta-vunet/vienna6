import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { ManagePermissionsPage } from './ManagePermissionsPage';

const app = uiModules.get('app/manage_permissions', []);


//ManagePermissions react component
app.directive('managePermissionsPage', (reactDirective) => {
  return reactDirective(ManagePermissionsPage, [
    'dashboardsList',
    'userRolesList',
    'permissionsList',
    'savedDashboardService',
    'savedVisualizationService',
    'savedSearcheService',
    'notify',
  ]);
});

app.directive('managePermissionsApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'managePermissionsApp',
    controller: function ($route, $scope, Private) {

      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change('Manage permissions');
      }
      //passing these to the ManagePermissionsPage react component
      $scope.dashboardsList = $route.current.locals.dashboardsList;
      $scope.userRolesList = $route.current.locals.userRolesList;
      $scope.permissionsList = $route.current.locals.permissionsList;
      $scope.savedDashboardService = $route.current.locals.savedDashboardService;
      $scope.savedVisualizationService = $route.current.locals.savedVisualizationService;
      $scope.savedSearcheService = $route.current.locals.savedSearcheService;
      $scope.notify = $route.current.locals.notify;


      init();
    },
  };
});
