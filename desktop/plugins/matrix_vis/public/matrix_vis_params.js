import { uiModules } from 'ui/modules';
import matrixVisParamsTemplate from 'plugins/matrix_vis/matrix_vis_params.html';
import { updateColorCodeOnPercentage } from 'ui/utils/vunet_colorcode_on_percentage';

uiModules.get('kibana/matrix_vis')
  .directive('matrixVisParams', function () {
    return {
      restrict: 'E',
      template: matrixVisParamsTemplate,
      link: function ($scope) {

        // If there is any change params reload the visualization.
        $scope.$watch('vis.params', function () {
          $scope.vis.reload = true;
        });

        $scope.$watch('vis.aggs[0].type.title', function () {
          $scope.metricTypeSelected = $scope.vis.aggs[0].type.title;
        });

        // updates colorCodeOnPercentageUsed based on user
        // configuration of metricsInPercentage
        updateColorCodeOnPercentage($scope);
      }
    };
  });
