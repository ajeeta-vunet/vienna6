define(function (require) {
  require('services/compile_recursive_directive');
  require('css!components/agg_table/agg_table.css');

  require('modules')
  .get('kibana')
  .directive('kbnAggTable', function ($filter, config, Private, compileRecursiveDirective) {
    var _ = require('lodash');
    var saveAs = require('file_saver');

    var tabifyAggResponse = Private(require('components/agg_response/tabify/tabify_agg_response'));
    var orderBy = $filter('orderBy');

    return {
      restrict: 'E',
      template: require('text!components/agg_table/agg_table.html'),
      scope: {
        table: '=',
        perPage: '=?',
        level: '=?'
      },
      controllerAs: 'aggTable',
      compile: function ($el) {
        // Use the compile function from the RecursionHelper,
        // And return the linking function(s) which it returns
        return compileRecursiveDirective.compile($el);
      },
      controller: function ($scope) {
        var self = this;

        $scope.level = $scope.level ? $scope.level + 1 : 1;
        $scope.nextLevel = $scope.level + 1;

        self.sort = null;
        self.csv = {
          showOptions: false,
          separator: config.get('csv:separator'),
          quoteValues: config.get('csv:quoteValues'),
          filename: 'table.csv'
        };

        self.getPerPage = function () {
          return $scope.perPage || Infinity;
        };

        self.getColumnClass = function (col, $first, $last) {
          var cls = [];
          var agg = $scope.table.aggConfig(col);

          if ($last || (agg.schema.group === 'metrics')) {
            cls.push('visualize-table-right');
          }

          if (!self.sort || self.sort.field !== col) {
            cls.push('no-sort');
          }

          return cls.join(' ');
        };

        self.cycleSort = function (col) {
          if (!self.sort || self.sort.col !== col) {
            self.sort = {
              col: col,
              asc: true
            };
          } else if (self.sort.asc) {
            self.sort.asc = false;
          } else {
            delete self.sort;
          }

          if (self.sort && !self.sort.getter) {
            var colI = $scope.columns.indexOf(self.sort.col);
            self.sort.getter = function (row) {
              return row[colI];
            };
            if (colI === -1) delete self.sort;
          }
        };

        self.exportAsCsv = function () {
          self.csv.showOptions = false;
          if (!$scope.rows || !$scope.columns) return;

          var text = '';
          var nonAlphaNumRE = /[^a-zA-Z0-9]/;
          var allDoubleQuoteRE = /"/g;
          var escape = function (val) {
            val = String(val);
            if (self.csv.quoteValues && nonAlphaNumRE.test(val)) {
              val = '"' + val.replace(allDoubleQuoteRE, '""') + '"';
            }
            return val;
          };

          // escape each cell in each row
          var csvRows = $scope.rows.map(function (row, i) {
            return row.map(escape);
          });

          // add the columns to the rows
          csvRows.unshift($scope.columns.map(_.compose(escape, self.colTitle)));

          var blob = new Blob(csvRows.map(function (row) {
            return row.join(self.csv.separator) + '\r\n';
          }), { type: 'text/plain' });

          saveAs(blob, self.csv.filename);
        };

        $scope.$watchMulti([
          'table',
          'aggTable.sort.asc',
          'aggTable.sort.field'
        ], function () {
          var table = $scope.table;

          if (!table) {
            $scope.formattedRows = null;
            return;
          }

          var formatters = table.columns.map(function (col) {
            return table.fieldFormatter(col);
          });

          // sort the row values, not formatted
          if (self.sort) {
            $scope.formattedRows = orderBy(table.rows, self.sort.getter, self.sort.asc);
          } else {
            $scope.formattedRows = null;
          }

          // format all row values
          $scope.formattedRows = ($scope.formattedRows || table.rows).map(function (row) {
            return row.map(function (cell, i) {
              return formatters[i](cell);
            });
          });
        });
      }
    };
  });
});
