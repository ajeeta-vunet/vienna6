import { uiModules } from 'ui/modules';
import { matrixifyAggResponseProvider } from 'ui/agg_response/matrixify/matrixify';
import moment from 'moment';
import _ from 'lodash';

const module = uiModules.get('kibana/matrix_vis', ['kibana']);

module.controller('KbnMatrixVisController', function ($scope, Private, timefilter) {

  const matrixifyAggResponse = Private(matrixifyAggResponseProvider);

  $scope.$watch('esResponse', function (resp) {
    $scope.interval = {
      'interval': $scope.vis.params.interval,
      'custom-interval': $scope.vis.params.customInterval,
      'custom-interval-type': $scope.vis.params.customIntervalType
    };

    let tableGroups = $scope.tableGroups = null;
    let hasSomeRows = $scope.hasSomeRows = null;

    const input = timefilter.getActiveBounds();
    if (input !== undefined) {
      // This is applicable only for time series indices
      $scope.startDate = moment(input.min._d).format('ddd MMM DD YYYY HH:mm:ss');
      $scope.noOfDays = moment(input.max._d).diff(moment(input.min._d), 'days', true);
      $scope.outputTimeFormat = $scope.vis.params.outputTimeFormat;
      $scope.exceededNoOfDaysErrorMessage = 'No of Days cannot exceed 31! Please use the ' +
                                            'global time picker at the top right corner of ' +
                                            'the screen to update the time';
    }

    if (resp) {
      const vis = $scope.vis;
      const params = vis.params;

      // We will use the metricsInPercentage flag as True only if all the
      // metrics are count, sum or unique count.
      let metricsInPercentage = params.metricsInPercentage;
      _.each(vis.aggs, function (agg) {
        if (agg.type.type === 'metrics' &&
            agg.type.title !== 'Count' &&
            agg.type.title !== 'Sum' &&
            agg.type.title !== 'Unique Count') {
          metricsInPercentage = false;
        }
      });

      tableGroups = matrixifyAggResponse(vis, resp, {
        partialRows: params.showPartialRows,
        metricsInPercentage: metricsInPercentage,
        minimalColumns: vis.isHierarchical() && !params.showMeticsAtAllLevels,
        asAggConfigResults: true
      });

      // If we have MetricsInPercentage flag enabled, let us iterate on each
      // row and calculate the sum for each row and update the aggConfigResult
      if (metricsInPercentage) {
        tableGroups.tables[0].rows.forEach(function (row) {
          let sum = 0;

          row.forEach(function (cell) {
            if (cell.type === 'metric' && cell.value !== '' && typeof (cell.value) === 'number') {
              sum += cell.value;
            }
          });

          row.forEach(function (cell) {
            if (cell.type === 'metric' && cell.value !== '' && typeof (cell.value) === 'number') {
              cell.sum = sum;
            }
          });

        });
      }

      hasSomeRows = tableGroups.tables.some(function haveRows(table) {
        if (table.tables) {
          return table.tables.some(haveRows);
        }
        return table.rows.length > 0;
      });
    }

    $scope.hasSomeRows = hasSomeRows;
    // hide the visualization and show only the error message
    if($scope.noOfDays > 31 && $scope.vis.params.collapseTimeHeaders === true) {
      hasSomeRows = false;
    }

    if (hasSomeRows) {
      $scope.tableGroups = tableGroups;
    }

    // Update perPage in vis using number-of-rows
    if ($scope.printReport) {
      $scope.vis.params.perPage = $scope.tableGroups.tables[0].rows.length;
    }
  });
});
