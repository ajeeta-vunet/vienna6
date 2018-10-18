import { uiModules } from 'ui/modules';
import tableVisParamsTemplate from 'plugins/table_vis/table_vis_params.html';
import { updateColorCodeOnPercentage } from 'ui/utils/vunet_colorcode_on_percentage';

uiModules.get('kibana/table_vis')
  .directive('tableVisParams', function () {
    return {
      restrict: 'E',
      template: tableVisParamsTemplate,
      link: function ($scope) {
        $scope.totalAggregations = ['sum', 'avg', 'min', 'max', 'count'];

        // updates colorCodeOnPercentageUsed based on user
        // configuration of metricsInPercentage
        updateColorCodeOnPercentage($scope);

        $scope.$watchMulti([
          'vis.params.showPartialRows',
          'vis.params.showMeticsAtAllLevels'
        ], function () {
          if (!$scope.vis) return;

          const params = $scope.vis.params;
          if (params.showPartialRows || params.showMeticsAtAllLevels) {
            $scope.metricsAtAllLevels = true;
          } else {
            $scope.metricsAtAllLevels = false;
          }

        });
      }
    };
  });
