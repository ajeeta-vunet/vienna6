import { uiModules } from 'ui/modules';
import showCumulativeRowTemplate from 'ui/partials/show_cumulative_row.html';

uiModules.get('kibana/matrix_vis')
  .directive('showCumulativeRow', function () {
    return {
      restrict: 'E',
      template: showCumulativeRowTemplate
    };
  });
