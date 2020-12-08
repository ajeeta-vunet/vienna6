import _ from 'lodash';
import moment from 'moment';

// This function is used to export the rows and columns in to a cs
export function searchExportAsCsv(fileName, config, rows, columns, indexPattern) {

  const saveAs = require('@elastic/filesaver').saveAs;
  const filename = fileName;
  const csv1 = new Blob([_toCsv(config, rows, columns, indexPattern)], { type: 'text/plain' });

  saveAs(csv1, filename);
}

//This function converts rows and columns in to csv format.
function _toCsv(config, rows, columns, indexPattern) {
  const csv = {
    separator: config.get('csv:separator'),
    quoteValues: config.get('csv:quoteValues')
  };

  const csvRows = rows.map(function (row) {
    return columns.map(function (column) {
      return _escape(csv, row, column, indexPattern);
    });
  });

  // add the columns to the rows
  csvRows.unshift(columns.map(function (col) {
    return col;
  }));

  return csvRows.map(function (row) {
    return row.join(csv.separator) + '\r\n';
  }).join('');
}

// escape each cell in each row
function _escape(csv, row, column, indexPattern) {
  let val;
  const nonAlphaNumRE = /[^a-zA-Z0-9]/;
  const allDoubleQuoteRE = /"/g;
  const startSearchTag = /[<mark>]/;
  const startSearchTagStr = '<mark>';
  const endSearchTagStr = '</mark>';

  // Get the value... and check if its an object or a list of objects
  // If yes, we don't format the field. This is because formatField tries
  // to format it for html and because of that '"' is put as :quote&
  // in the string
  let isObject = false;
  if (column in row._source) {
    val = String(row._source[column]);
    if (val.startsWith('{') || val.startsWith('[')) {
      isObject = true;
    }
  }
  // Checks field name is formatted with other
  // than the default formatter
  // If its not an object, we will format the field..
  if (!isObject) {
    if (column in indexPattern.fieldFormatMap) {
      const value = indexPattern.formatField(row, column);
      val = value.split(/[<>]/g);
      val = String(val[2]);
      if (typeof (val) === 'undefined') {
        val = '-';
      }
    }
    // If field formatter is of default.
    else {
      val = column === '_source' ? row._source : indexPattern.flattenHit(row)[column];
      if (_.isObject(val)) {
        val = val.valueOf();
        val = JSON.stringify(val);
      }

      if (typeof (val) === 'undefined') {
        val = '-';
      }

      if(column === '@timestamp') {
        val = moment.utc(val).local().format('MMMM Do YYYY, h:mm:ss.mm.SSS');
      }
      val = String(val);
    }

    if (startSearchTag.test(val)) {
      val = val.replace(startSearchTagStr, '');
      val = val.replace(endSearchTagStr, '');
    }

    if (csv.quoteValues && nonAlphaNumRE.test(val)) {
      val = '"' + val.replace(allDoubleQuoteRE, '""') + '"';
    }
  }

  return val;
}
