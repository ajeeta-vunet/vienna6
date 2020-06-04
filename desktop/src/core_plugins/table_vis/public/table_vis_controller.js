import { uiModules } from 'ui/modules';
import { assign } from 'lodash';
// import { fixTableHeightForPrintReport } from 'ui/utils/print_report_utils';

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/table_vis', ['kibana']);

// add a controller to tha module, which will transform the esResponse into a
// tabular format that we can pass to the table directive
module.controller('KbnTableVisController', function ($scope) {
  const uiStateSort = ($scope.uiState) ? $scope.uiState.get('vis.params.sort') : {};
  assign($scope.vis.params.sort, uiStateSort);

  $scope.sort = $scope.vis.params.sort;
  $scope.$watchCollection('sort', function (newSort) {
    $scope.uiState.set('vis.params.sort', newSort);
  });

  /**
   * Recreate the entire table when:
   * - the underlying data changes (esResponse)
   * - one of the view options changes (vis.params)
   */
  $scope.$watch('esResponse', function (resp) {

    let tableGroups = $scope.tableGroups = null;
    let hasSomeRows = $scope.hasSomeRows = null;

    if (resp) {
      tableGroups = resp;

      hasSomeRows = tableGroups.tables.some(function haveRows(table) {
        if (table.tables) return table.tables.some(haveRows);
        return table.rows.length > 0;
      });

      $scope.renderComplete();
    }

    $scope.hasSomeRows = hasSomeRows;
    if (hasSomeRows) {
      $scope.tableGroups = tableGroups;
    }

    // Update perPage in vis using number-of-rows
    // Updating the perPage value for tables.
    // We assume that the tableGroups always has one table.
    // And set the perpage to the no of rows in this table.
    // If there are multiple tables, then we will have to handle this case
    if ($scope.printReport) {
      if ($scope.tableGroups) {
        $scope.vis.params.perPage = $scope.tableGroups.tables[0].rows.length;

        /* This has been commented out as some of the last rows were getting cut in print reports. This was because we have
           taken the height of the row as 31 always but this fails when there is word wrapping in the row because of large
           amount of content. Hence not we are not calculating the height of the data-table manually, rather whatever is the height
           of the data-table is being taken dynamically automatically.
        */
        // fixTableHeightForPrintReport($scope, $element);
      }
    }

  });
});

