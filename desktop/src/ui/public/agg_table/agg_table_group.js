import 'ui/compile_recursive_directive';
import 'ui/agg_table';
import { uiModules } from 'ui/modules';
import aggTableGroupTemplate from 'ui/agg_table/agg_table_group.html';

uiModules
  .get('kibana')
  .directive('kbnAggTableGroup', function (compileRecursiveDirective) {
    return {
      restrict: 'E',
      template: aggTableGroupTemplate,
      scope: {
        group: '=',
        perPage: '=?',
        sort: '=?',
        exportTitle: '=?',
        showTotal: '=',
        totalFunc: '=',
        isMatrix: '=',
        colorSchema: '=?',
        interval: '=?',
        printReport: '=?',
        hideExportOptions: '=?',
        isCollapseTimeHeaders: '=?',
        addSrNumber: '=?',
        srNumberTitle: '=?',
        useTableGrids: '=?',
        cellFontSize: '=?',
        cumulativeRowOperation: '=?',
        cumulativeColumnOperation: '=?',
        showProgressBar: '=?',
        showWordWrap: '=?'
      },
      compile: function ($el) {
      // Use the compile function from the RecursionHelper,
      // And return the linking function(s) which it returns
        return compileRecursiveDirective.compile($el, {
          post: function ($scope) {
            $scope.$watch('group', function (group) {
            // clear the previous "state"
              $scope.rows = $scope.columns = false;

              if (!group || !group.tables.length) return;

              const firstTable = group.tables[0];
              const params = firstTable.aggConfig && firstTable.aggConfig.params;
              // render groups that have Table children as if they were rows, because iteration is cleaner
              const childLayout = (params && !params.row) ? 'columns' : 'rows';

              $scope[childLayout] = group.tables;
            });
          }
        });
      }
    };
  });
