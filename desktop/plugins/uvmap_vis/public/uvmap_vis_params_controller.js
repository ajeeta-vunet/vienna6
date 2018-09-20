import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana/uvmap_vis', ['kibana']);
module.controller('UVMapVisParamsController', function ($scope, $rootScope) {
  $scope.vis.params.expression = $scope.vis.params.expression || '.es(*)';
  $scope.vis.params.connection = $scope.vis.params.connection || '';
  $scope.vis.params.colorSchema = $scope.vis.params.colorSchema || [];
  $scope.search = function () {
    $rootScope.$broadcast('courier:searchRefresh');
  };

  // Event to update $scope.vis.params.connection.
  $rootScope.$on('vusop:uvMapData', (event, newParamsConnection) => {
    $scope.vis.params.connection = newParamsConnection;
    $scope.$apply();
  });
});
