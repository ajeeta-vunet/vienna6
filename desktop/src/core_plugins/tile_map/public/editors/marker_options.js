import { uiModules } from 'ui/modules';
import markerOptionsTemplate from './marker_options.html';
const module = uiModules.get('kibana');

module.directive('markerOptions', function () {
  return {
    restrict: 'E',
    template: markerOptionsTemplate,
    replace: true,
    link: function ($scope) {
      $scope.$watch('vis.aggs', function () {
        $scope.metrics = [];
        // Go through each vis metric agg and get the custom label defined.
        // This list will be used for the red marker metric selection field.
        // The red marker in the map will use the selected metric.
        // If custom label is not given then we don't show that metric.
        // Facing Some challenges when label is not given. We need to resolve
        // this in the future.
        $scope.vis.aggs.forEach(agg => {
          if (agg.schema.name === 'metric' && agg.params.customLabel !== undefined) {
            $scope.metrics.push(agg.params.customLabel);
          }
        });
      });
    }
  };
});
