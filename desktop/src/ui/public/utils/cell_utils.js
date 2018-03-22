import _ from 'lodash';
import { doCumulativeOperation } from 'ui/utils/cumulative_ops.js';
import { convertToSeconds } from 'ui/utils/interval_utils.js';

// This function takes the background color of a cell in
// hexadecimal format and then calculates a value bgDelta
// using the RGB components in the background color and
// decides whether the text color needs to be black or white
// based on intensity of background color
function idealTextColor(bgColor) {
  const nThreshold = 105;
  const components = getRGBComponents(bgColor);
  const bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
  return ((255 - bgDelta) < nThreshold) ? '#000000' : '#ffffff';
}

// This function receives color in hexadecimal format
// converts and returns color in RGB format
function getRGBComponents(color) {
  const r = color.substring(1, 3);
  const g = color.substring(3, 5);
  const b = color.substring(5, 7);
  return {
    R: parseInt(r, 16),
    G: parseInt(g, 16),
    B: parseInt(b, 16)
  };
}

// This function changes the color of the given cell to the
// given background color
function changeBackgroundColor(cell, backgroundColor) {
  cell.each(function () {
    this.style.setProperty('background-color', backgroundColor, 'important');
  });
  const textColor = idealTextColor(backgroundColor);
  cell.css('color', textColor);
}

// This function is used to find the content to be displayed in the cells.
// For the "show metrics in %", this calculates the percentage value based on
// the value and sum of the row / column. Otherwise, the value is returned.
export function createCellContents(contents, multiplier) {
  const visType = contents.aggConfig.vis.type.name;
  let val = contents.value;
  if (typeof (val) === 'number') {
    if (visType === 'matrix') {
      val = val * multiplier;
    }
  }

  if (contents.sum !== -1) {
    if (contents.sum === 0) {
      contents = contents.toString('html') + '  (0%)';
    } else {
      const percetangeVal = Math.abs(val * 100 / contents.sum);
      contents = contents.toString('html') + '  (' + percetangeVal.toFixed(2) + '%)';
    }
  } else {
    contents = contents.toString('html');
  }

  return contents;
}

// This function is used to apply background colour for the cells based on the
// value and the color range configuration.
export function applyColorSchemaForMatrixVis(val, cell, colorSchema) {
  if (typeof (val) === 'number') {
    colorSchema.forEach(colorRange => {
      if ((val >= colorRange.min) && (val <= colorRange.max)) {
        changeBackgroundColor(cell, colorRange.color);
      }
    });
  }
}

// This function is used to set the background color of the cell for the table
// visualization based on the value and colour range confiuration.
export function applyColorSchemaForTableVis(val, multiplier, cell, configObj, scope) {
  const colorSchema =  scope.colorSchema || [];
  // Let us look for a colorSchema entry which matches the
  // value. If we find one, we will use it as the background
  // color
  colorSchema.forEach(colorRange => {
    let scaledValue = val;
    // If the value is numeric and a time interval is specified
    // we need scale the value suitably.
    if (colorRange.interval && typeof (val) === 'number') {
      const customInterval = colorRange.customInterval + colorRange.customIntervalType;
      const targetInterval = convertToSeconds(colorRange.interval, customInterval);
      const newMultiplier = targetInterval / multiplier;
      scaledValue = (scaledValue * newMultiplier);
    }
    let bkColor = null;
    let matchColorRange = false;
    // If a field is specified in the colorRange
    if (colorRange.field) {
      if (configObj) {
        if (configObj.params.field) {
          // If the color range field matches the field
          // for which this cell is being filled
          if (configObj.params.field.name === colorRange.field.name) {
            // If the color range 'match' value matches
            // the 'val' string, use this color range
            // color as background
            if (colorRange.field.type === 'string' && typeof (val) === 'string' && val === colorRange.match) {
              bkColor = colorRange.color;
            } else if (colorRange.field.type !== 'string' && typeof (val) !== 'string') {
              matchColorRange = true;
            }
          }
        } else {
          matchColorRange = true;
        }
      }
    } else {
      // We are here means, the colorRange is NOT configured
      // with any field value. Then we should compare ONLY
      // with those aggs which do NOT need field (like Count)
      if (configObj) {
        if (!configObj.params.field) {
          matchColorRange = true;
        }
      } else {
        matchColorRange = true;
      }
    }

    // If we need to match the val to the colorRange min and
    // max.
    if (matchColorRange) {
      if ((scaledValue >= colorRange.min) && (scaledValue <= colorRange.max)) {
        bkColor = colorRange.color;
      }
    }
    if (bkColor) {
      changeBackgroundColor(cell, colorRange.color);
    }
  });
}

// This function is used to add the row / column cumulative result based on the
// configuration. This also add serial number column.
export function addSrNumberAndTotalsRow(row, rowNumber, csvRows, cumulativeRowOperation,
  cumulativeColumnOperation, addSrNumber, srNumber, csv, results) {
  results.rowResult = -1;

  let rowAsCsv = row.join(csv.separator);
  if(rowNumber === 0) {
    results.columnResult = [];
  }

  if (rowNumber > 0) {
    executeCumulativeOperation(cumulativeColumnOperation, row, cumulativeRowOperation, rowNumber, results);

    if (cumulativeColumnOperation) {
      rowAsCsv += csv.separator + results.rowResult;
      results.rowResult = -1;
    }

    if (cumulativeRowOperation) {
      if (rowNumber === (csvRows.length - 1)) {
        rowAsCsv += '\r\n' + 'Cumulative ( ' + _.startCase(cumulativeRowOperation) + ' )' + csv.separator;
        if (addSrNumber) {
          rowAsCsv += csv.separator;
        }
        rowAsCsv += results.columnResult.slice(1).join(csv.separator);
      }
    }
  }
  // If we are supposed to add a serial number column
  if (addSrNumber && rowNumber > 0) {
    // If the srNumber is -1, means this is the row
    // with only column names. Nothing special to be done.
    if (srNumber === -1) {
      return rowAsCsv + '\r\n';
    }
    // We are now handling rows with values, then append the serial
    // number to it
    return srNumber + csv.separator + rowAsCsv + '\r\n';
  } else {
    return rowAsCsv + '\r\n';
  }
}

// This function prepares the data for cumulative operation. Based on the
// cumulative operation, it caluculates the row cumulative result or column
// cumulative result
function executeCumulativeOperation(rowOperation, rowValue, columnOperation, rowIndex, results) {
  if (rowOperation || columnOperation) {
    rowValue.forEach(function (value, i) {
      const numValue = Number(value.replace(/,/g, '').replace(/"/g, ''));
      // We continue only if the value is a number
      if (!isNaN(numValue)) {
        if (rowOperation) {
          results.rowResult = doCumulativeOperation(rowOperation, results.rowResult, numValue, rowIndex);
        }
        if (columnOperation) {
          results.columnResult[i] = doCumulativeOperation(columnOperation, results.columnResult[i], numValue, rowIndex);
        }
      }
    });
  }
}
