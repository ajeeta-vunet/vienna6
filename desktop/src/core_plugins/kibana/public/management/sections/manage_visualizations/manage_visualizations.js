import { uiModules } from 'ui/modules';
import { DocTitleProvider } from 'ui/doc_title';
import { ManageVisualizationsPage } from './ManageVisualizationsPage';
import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'Manage visualizations' });
const app = uiModules.get('app/manage_permissions', []);

//Manage visualizations react component
app.directive('manageVisualizationsPage', (reactDirective) => {
  return reactDirective(ManageVisualizationsPage, [
    'dashboardsList',
    'visualizationsList',
    'reportsList',
    'alertRulesList',
    'deleteVizs',
  ]);
});

app.directive('manageVisualizationsApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'manageVisualizationsApp',
    controller: manageVisualizationsApp,
  };
});

function manageVisualizationsApp($scope, Private, $route) {
  // Always display doc title as 'Manage visualizations'
  const docTitle = Private(DocTitleProvider);
  docTitle.change('Manage visualizations');

  // Passing these to the ManagePermissionsPage react component
  $scope.dashboardsList = $route.current.locals.dashboardsList;
  $scope.visualizationsList = $route.current.locals.visualizationsList;
  $scope.reportsList = $route.current.locals.reportsList;
  $scope.alertRulesList = $route.current.locals.alertRulesList;

  //Function to delete selected visualizations files
  $scope.deleteVizs = function (selectedIds) {
    const services = Private(
      SavedObjectRegistryProvider
    ).byLoaderPropertiesName;
    const visualizationService = services.visualizations;

    return visualizationService
      .delete(selectedIds)
      .then(function () {})
      .catch((error) => notify.error(error));
  };
}
