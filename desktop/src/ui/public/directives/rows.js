import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import { doCumulativeOperation } from 'ui/utils/cumulative_ops.js';
import AggConfigResult from 'ui/vis/agg_config_result';
import { FilterBarClickHandlerProvider } from 'ui/filter_bar/filter_bar_click_handler';
import { uiModules } from 'ui/modules';
import tableCellFilterHtml from './partials/table_cell_filter.html';
import { createCellContents, applyColorSchemaForMatrixVis, applyColorSchemaForTableVis } from 'ui/utils/cell_utils.js';
const module = uiModules.get('kibana');

module.directive('kbnRows', function ($compile, $rootScope, getAppState, Private, timefilter) {
  const filterBarClickHandler = Private(FilterBarClickHandlerProvider);
  return {
    restrict: 'A',
    link: function ($scope, $el, attr) {
      function addCell($tr, contents, interval, configObj) {
        function createCell() {
          return $(document.createElement('td'));
        }

        function createFilterableCell(aggConfigResult) {
          const $template = $(tableCellFilterHtml);
          $template.addClass('cell-hover');

          const scope = $scope.$new();

          const $state = getAppState();
          const addFilter = filterBarClickHandler($state);
          scope.onFilterClick = (event, negate) => {
            // Don't add filter if a link was clicked.
            if ($(event.target).is('a')) {
              return;
            }

            addFilter({ point: { aggConfigResult: aggConfigResult }, negate });
          };

          return $compile($template)(scope);
        }

        let $cell;
        let $cellContent;

        let val;
        let visType;
        if (contents instanceof AggConfigResult) {
          const field = contents.aggConfig.getField();
          const isCellContentFilterable =
            contents.aggConfig.isFilterable()
            && (!field || field.filterable);

          if (isCellContentFilterable) {
            $cell = createFilterableCell(contents);
            $cellContent = $cell.find('[data-cell-content]');
          } else {
            $cell = $cellContent = createCell();
          }

          visType = contents.aggConfig.vis.type.name;
          val = contents.value;

          contents = createCellContents(contents);
        } else {
          $cell = $cellContent = createCell();

          // TODO: It would be better to actually check the type of the field, but we don't have
          // access to it here. This may become a problem with the switch to BigNumber
          if (_.isNumeric(contents)) {
            $cell.addClass('numeric-value');
          }
        }

        if (_.isObject(contents)) {
          if (contents.attr) {
            $cellContent.attr(contents.attr);
          }

          if (contents.class) {
            $cellContent.addClass(contents.class);
          }

          if (contents.scope) {
            $cellContent = $compile($cellContent.prepend(contents.markup))(contents.scope);
          } else {
            $cellContent.prepend(contents.markup);
          }

          if (contents.attr) {
            $cellContent.attr(contents.attr);
          }
        } else {
          if (contents === '') {
            $cellContent.prepend('&nbsp;');
          } else {
            let dontAddContent = false;
            if (visType === 'matrix') {
              applyColorSchemaForMatrixVis(val, interval, $cell, $scope.colorSchema, $scope.interval);
            } else if (visType === 'table') {
              dontAddContent = applyColorSchemaForTableVis(val, interval, $cell, configObj, $scope, $cellContent);
            }
            if (!dontAddContent) {
              $cellContent.prepend(contents);
            }
          }
        }

        $tr.append($cell);
      }

      function maxRowSize(max, row) {
        return Math.max(max, row.length);
      }

      function processRows(vals, min, rows, el, scope, timefilter, origRowCount) {
        // Let us calculate the starting serial number, using the current
        // page number and number of rows per page.
        // Current page number is given by vals[0].number
        let serialNumber = vals[0] ? ((vals[0].number - 1) * min) + 1 : 0;

        const columnResult = [];
        for (let i = 0; i < rows[0].length; i++) columnResult[i] = -1;
        const columnValueFormatter = [];

        let srAddConfig = false;
        let rowCount = 0;
        // This boolean is needed so that we can add a cumulative row
        // at the end of valid data rows and before the remaining empty rows
        let cumulativeRowAdded = false;
        let showCumulativeRow = false;
        let showCumulativeColumn = false;
        let cumulativeRowOperation = null;

        rows.forEach(function (row) {
          const $tr = $(document.createElement('tr')).appendTo(el);

          // Add style to this element for phantomjs for reports
          $tr[0].style['page-break-inside'] = 'avoid';
          $tr[0].style['page-break-after'] = 'auto';

          let srNumberAdded = false;
          let configObj = null;
          let rowResult = -1;
          let rowFormatter = null;
          let index = 0;

          row.forEach(function (cell) {
            // Percentage display
            let interval = 1;
            if (cell instanceof AggConfigResult) {
              // These are the operations supported only on Matrix and
              // Table visualizations.
              if ((['matrix', 'table'].indexOf(cell.aggConfig.vis.type.name) >= 0)) {
                // Check if we need to add a serial number value.
                // We need to do it only once per row
                if (!srNumberAdded) {
                  // Check if we need to add a serial number value.
                  if (cell.aggConfig.vis.params.addSrNumber) {
                    addCell($tr, serialNumber, 1, null);
                    srAddConfig = true;
                  }
                  serialNumber += 1;
                  srNumberAdded = true;
                }
                // Check if we need to show a column containing per-row
                // cumulative operation results
                if (cell.aggConfig.vis.params.showCumulativeRow) {
                  if (typeof (cell.value) === 'number' && cell.aggConfig._opts.schema === 'metric') {
                    columnResult[index] = doCumulativeOperation(cell.aggConfig.vis.params.cumulativeRowOperation,
                      columnResult[index],
                      cell.value,
                      serialNumber - 1);
                    columnValueFormatter[index] = cell.aggConfig.fieldFormatter();
                    cumulativeRowOperation = cell.aggConfig.vis.params.cumulativeRowOperation;
                    showCumulativeRow = true;
                  }
                }
              }

              // check if it is a matrix table
              if(cell.aggConfig.vis.type.name === 'matrix') {
                const configs = cell.aggConfig.vis.aggs;
                const valueConfig = configs[0];
                const bucketConfig = configs[1];
                if (valueConfig.type.title !== 'Average') {
                  // use the interval to fix the value;
                  // check if Time buckets are available.
                  // ( Check if Date histogram is selected at the top level)
                  if(_.has(bucketConfig, 'buckets'))
                  {
                    const valueInterval = bucketConfig.buckets.getInterval()._milliseconds / 1000;
                    interval = valueInterval;
                  } else {
                    // We are here means, we have NOT found any timestamp
                    // field bucket. Hence, we will use the global time
                    // picker value.
                    const input = timefilter.getActiveBounds();
                    const timeDiff = moment.duration(input.max - input.min);
                    interval = timeDiff._milliseconds / 1000;
                  }
                }
                // If we need to show a row containing cumulative
                // operation on each column
                if (cell.aggConfig.vis.params.showCumulativeColumn) {
                  if (typeof (cell.value) === 'number' && cell.aggConfig._opts.schema === 'metric') {
                    rowResult = doCumulativeOperation(cell.aggConfig.vis.params.cumulativeColumnOperation,
                      rowResult,
                      cell.value,
                      index);
                    rowFormatter = cell.aggConfig.fieldFormatter();
                    showCumulativeColumn = true;
                  }
                }
              } else if (cell.aggConfig.vis.type.name === 'table') {
                // Let us lookup the id in aggs object array which has
                // matching id
                configObj = cell.aggConfig.vis.aggs.find(obj => obj.id === cell.aggConfig.id);
                let firstDateTimeBucket = null;
                if (configObj && (configObj.type.title === 'Count' || configObj.type.title === 'Unique Count')) {
                  // We will search for the first timestamp field (date field) for the Date Histogram
                  // and use its interval duration configured to scale
                  // the current value to the same duration
                  cell.aggConfig.vis.aggs.forEach(function (agg) {
                    if(!firstDateTimeBucket
                      && agg.type.type === 'buckets'
                      && agg.params.field.type === 'date'
                      && cell.aggConfig.vis.indexPattern.timeFieldName === agg.params.field.name
                      && _.has(agg, 'buckets')) {

                      const valueInterval = agg.buckets.getInterval()._milliseconds / 1000;
                      interval =  valueInterval;
                      firstDateTimeBucket = agg;
                    }
                  });
                }
                if (!firstDateTimeBucket || !configObj) {
                  // We are here means, we have NOT found any timestamp
                  // field bucket. Hence, we will use the global time
                  // picker value.
                  const input = timefilter.getActiveBounds();
                  const timeDiff = moment.duration(input.max - input.min);
                  interval = timeDiff._milliseconds / 1000;
                }
              }
              index += 1;
            }
            addCell($tr, cell, interval, configObj);
          });

          // Print an additional cell if we are printing an additional serial
          // number column
          if (index === 0 && srAddConfig && (!showCumulativeRow || cumulativeRowAdded)) {
            addCell($tr, '', 1, null);
          }

          // If we are printing an additional column with
          // cumulative operation results, we display it here.
          if (showCumulativeColumn) {
            if (index > 0) {
              addCell($tr, rowFormatter(rowResult), 1, null);
            } else {
              addCell($tr, '', 1, null);
            }
          }

          rowCount += 1;

          // If we need to display an additional row containing cumulative
          // operation result on each column, do it here.
          if (showCumulativeRow && rowCount >= origRowCount && !cumulativeRowAdded) {
            // If we are printing an additional serial number, prepend
            // default entries onto columnResult and
            // columnValueFormatter arrays
            if (srAddConfig) {
              columnResult.unshift(-1);
              columnValueFormatter.unshift(null);
            }
            // If we are printing an additonal cumulative column, append
            // default entries onto columnResult and
            // columnValueFormatter arrays
            if (showCumulativeColumn) {
              columnResult.push(-1);
              columnValueFormatter.push(null);
            }
            addCumulativeResultRow(srAddConfig, cumulativeRowOperation, columnResult, columnValueFormatter, el);
            cumulativeRowAdded = true;
          }
        });
      }

      // This function adds a row which is the result of cumulative operation
      // on rest of the rows.
      function addCumulativeResultRow(addSrConfig, operation, resultArray, formatterArray, el) {
        const $tr = $(document.createElement('tr'));
        $tr.appendTo(el);
        // Add style to this element for phantomjs for reports
        $tr[0].style['page-break-inside'] = 'avoid';
        $tr[0].style['page-break-after'] = 'auto';
        let headerAdded = false;

        const rowHdr = 'Cumulative ( ' + _.startCase(operation) + ' )';

        // If there is only one value in the result, then
        // we display the header along with value separated by ':'
        if (resultArray.length === 1) {
          addCell($tr, rowHdr + ' : ' + String(resultArray[0]), 1, null);
          return;
        }

        // resultArray contains value '-1' at all indices where we do NOT
        // have cumulative data to display
        resultArray.forEach(function (column, i) {
          let columnValue = column;
          // Pickup the formatter function if any for this data at this
          // index i
          if (formatterArray[i] != null) {
            columnValue = formatterArray[i](column);
          }
          if (!headerAdded) {
            let hdr = rowHdr;
            // If the value in the result array at this index
            // is not -1, that means we have a valid value here to
            // display. Then we display it along the header string
            if (columnValue !== -1) {
              hdr += ' : ' + columnValue;
            }
            addCell($tr, hdr, 1, null);
            headerAdded = true;
          } else {
            if (column >= 0) {
              addCell($tr, columnValue, 1, null);
            } else {
              addCell($tr, '', 1, null);
            }
          }
        });
      }

      $scope.$watchMulti([
        attr.kbnRows,
        attr.kbnRowsMin
      ], function (vals) {
        let rows = vals[0];
        const min = vals[1];
        let origRowCount = 0;

        if (rows) {
          origRowCount = rows.length;
        }

        $el.empty();

        if (!Array.isArray(rows)) rows = [];
        const width = rows.reduce(maxRowSize, 0);

        if (isFinite(min) && rows.length < min) {
          // clone the rows so that we can add elements to it without upsetting the original
          rows = _.clone(rows);
          // crate the empty row which will be pushed into the row list over and over
          const emptyRow = new Array(width);
          // fill the empty row with values
          _.times(width, function (i) { emptyRow[i] = ''; });
          // push as many empty rows into the row array as needed
          _.times(min - rows.length, function () { rows.push(emptyRow); });
        }

        processRows(vals, min, rows, $el, $scope, timefilter, origRowCount);
      });
    }
  };
});
