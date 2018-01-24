import { metricLimitedColorSchema } from 'ui/directives/metric_limited_color_schema';
import { uiModules } from 'ui/modules';
  const module = uiModules.get('kibana/uvmap_vis', ['kibana']);
    module.controller('UVMapVisParamsController', function ($scope, $rootScope) {
      $scope.vis.params.expression = $scope.vis.params.expression || '.es(*)';
      $scope.vis.params.connection = $scope.vis.params.connection || '';
      $scope.vis.params.colorSchema = $scope.vis.params.colorSchema || [];
      $scope.search = function () {
        $rootScope.$broadcast('courier:searchRefresh');
      };
    });
