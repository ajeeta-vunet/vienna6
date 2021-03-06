import 'ui/paginated_table';
import 'ui/compile_recursive_directive';
import 'ui/agg_table/agg_table.less';
import _ from 'lodash';
import { uiModules } from 'ui/modules';
import aggTableTemplate from 'ui/agg_table/agg_table.html';
import { RegistryFieldFormatsProvider } from 'ui/registry/field_formats';
import { addSrNumberAndTotalsRow } from 'ui/utils/cell_utils';
uiModules
  .get('kibana')
  .directive('kbnAggTable', function ($filter, config, Private, compileRecursiveDirective) {
    const fieldFormats = Private(RegistryFieldFormatsProvider);
    const numberFormatter = fieldFormats.getDefaultInstance('number').getConverterFor('text');
    return {
      restrict: 'E',
      template: aggTableTemplate,
      scope: {
        table: '=',
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
        cellFontSize: '=?',
        cumulativeRowOperation: '=?',
        cumulativeColumnOperation: '=?',
        showProgressBar: '=?',
        showWordWrap: '=?'
      },
      controllerAs: 'aggTable',
      compile: function ($el) {
      // Use the compile function from the RecursionHelper,
      // And return the linking function(s) which it returns
        return compileRecursiveDirective.compile($el);
      },
      controller: function ($scope) {
        const self = this;

        self.srHeaderAdded = false;
        self.cumulativeColumnHeaderAdded = false;

        self._saveAs = require('@elastic/filesaver').saveAs;
        self.csv = {
          separator: config.get('csv:separator'),
          quoteValues: config.get('csv:quoteValues')
        };

        self.results = {};

        self.exportAsCsv = function (formatted) {
          const csv = new Blob([self.toCsv(formatted)], { type: 'text/plain;charset=utf-8' });
          self._saveAs(csv, self.csv.filename);
        };

        self.toCsv = function (formatted) {
          const rows = $scope.table.rows;
          const columns = formatted ? $scope.formattedColumns.filter(
            formattedCol => formattedCol.enabled) : $scope.table.columns.filter(col => col.aggConfig.enabled);
          const nonAlphaNumRE = /[^a-zA-Z0-9]/;
          const allDoubleQuoteRE = /"/g;
          let srNumber = -1;

          if ($scope.addSrNumber && !self.srHeaderAdded) {
            columns.unshift({ title: $scope.srNumberTitle });
            self.srHeaderAdded = true;
          }

          if ($scope.cumulativeColumnOperation && !self.cumulativeColumnHeaderAdded) {
            columns.push({ title: 'Cumulative ( ' + _.startCase($scope.cumulativeColumnOperation) + ' )' });
            self.cumulativeColumnHeaderAdded = true;
          }

          function escape(val) {
            if (!formatted && _.isObject(val)) val = val.valueOf();
            val = String(val);
            if (self.csv.quoteValues && nonAlphaNumRE.test(val)) {
              val = '"' + val.replace(allDoubleQuoteRE, '""') + '"';
            }
            return val;
          }

          // escape each cell in each row
          const csvRows = rows.map(function (row) {
            return row.map(escape);
          });

          // add the columns to the rows
          csvRows.unshift(columns.map(function (col) {
            return escape(col.title);
          }));

          // Add the cumulative results row / column.
          // Based on the configured row / column cumulative operation,
          // calculate the cumulative result and add it to the results table
          return csvRows.map(function (row, rowNumber) {
            if ($scope.addSrNumber) {
              srNumber += 1;
            }
            return addSrNumberAndTotalsRow(row,
              rowNumber,
              csvRows,
              $scope.cumulativeRowOperation,
              $scope.cumulativeColumnOperation,
              $scope.addSrNumber,
              srNumber,
              self.csv,
              self.results
            );
          }).join('');
        };

        $scope.exportPopoverStatus = false;

        $scope.toggleExportPopoverState = function () {
          $scope.exportPopoverStatus = !$scope.exportPopoverStatus;
        };

        $scope.$watch('table', function () {
          const table = $scope.table;

          if (!table) {
            $scope.rows = null;
            $scope.formattedColumns = null;
            return;
          }

          self.csv.filename = ($scope.exportTitle || table.title() || 'table') + '.csv';
          $scope.rows = table.rows;
          $scope.formattedColumns = table.columns.map(function (col, i) {
            const agg = $scope.table.aggConfig(col);
            const field = agg.getField();
            const formattedColumn = {
              title: col.title,
              enabled: col.aggConfig.enabled,
              filterable: field && field.filterable && agg.schema.group === 'buckets',
              aggConfigResult: col.aggConfigResult,
              show: col.show
            };

            const last = i === (table.columns.length - 1);

            if (last || (agg.schema.group === 'metrics')) {
              formattedColumn.class = 'visualize-table-right';
            }

            let isFieldNumeric = false;
            let isFieldDate = false;
            const aggType = agg.type;
            if (aggType && aggType.type === 'metrics') {
              if (aggType.name === 'top_hits') {
                if (agg._opts.params.aggregate !== 'concat') {
                // all other aggregate types for top_hits output numbers
                // so treat this field as numeric
                  isFieldNumeric = true;
                }
              } else if (field) {
              // if the metric has a field, check if it is either number or date
                isFieldNumeric = field.type === 'number';
                isFieldDate = field.type === 'date';
              } else {
              // if there is no field, then it is count or similar so just say number
                isFieldNumeric = true;
              }
            } else if (field) {
              isFieldNumeric = field.type === 'number';
              isFieldDate = field.type === 'date';
            }

            if (isFieldNumeric || isFieldDate || $scope.totalFunc === 'count') {
              function sum(tableRows) {
                return _.reduce(tableRows, function (prev, curr) {
                // some metrics return undefined for some of the values
                // derivative is an example of this as it returns undefined in the first row
                  if (curr[i].value === undefined) return prev;
                  return prev + curr[i].value;
                }, 0);
              }
              const formatter = agg.fieldFormatter('text');

              switch ($scope.totalFunc) {
                case 'sum':
                  if (!isFieldDate) {
                    formattedColumn.total = formatter(sum(table.rows));
                  }
                  break;
                case 'avg':
                  if (!isFieldDate) {
                    formattedColumn.total = formatter(sum(table.rows) / table.rows.length);
                  }
                  break;
                case 'min':
                  formattedColumn.total = formatter(_.chain(table.rows).map(i).map('value').min().value());
                  break;
                case 'max':
                  formattedColumn.total = formatter(_.chain(table.rows).map(i).map('value').max().value());
                  break;
                case 'count':
                  formattedColumn.total = numberFormatter(table.rows.length);
                  break;
                default:
                  break;
              }
            }
            return formattedColumn;
          });
        });
      }
    };
  });
