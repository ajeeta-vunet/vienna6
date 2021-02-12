require('ui/directives/metric_link_info');
import { uiModules } from 'ui/modules';
import matrixVisParamsTemplate from 'plugins/matrix_vis/matrix_vis_params.html';
import { updateColorCodeOnPercentage } from 'ui/utils/vunet_colorcode_on_percentage';

// Set of colors that can be selected as background colors for cells
const tableCellColors = {
  red: '#dc3545',
  yellow: '#ffc107',
  orange: '#fd7e14',
  green: '#28a745',
  blue: '#007bff',
  pink: '#e83e8c',
  teal: '#20c997',
  cyan: '#17a2b8',
  grey: '#6c757d'
};

// Array of the same for easier logic implementation
const tableCellColorsList = [
  '#dc3545',
  '#ffc107',
  '#fd7e14',
  '#28a745',
  '#007bff',
  '#e83e8c',
  '#20c997',
  '#17a2b8',
  '#6c757d'
];

// Importing library to find the nearest hex code of a specific color
const nearestColor = require('nearest-color').from(tableCellColors);

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
        // Logic to convert pre-applied cell color to nearest color
        // in the defined list of colors
        const colorSchema = $scope.vis.params.colorSchema;
        for (let i = 0; i < colorSchema.length; i++) {
          const bkColor = colorSchema[i].color;
          // If the color already is present in the list
          // Else we are finding the nearest color in the list
          if(tableCellColorsList.includes(bkColor)) {
            continue;
          } else {
            $scope.vis.params.colorSchema[i].color = nearestColor(bkColor).value;
          }
        }
      }
    };
  });
