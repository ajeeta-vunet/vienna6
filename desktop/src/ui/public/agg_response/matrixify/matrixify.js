import _ from 'lodash';
import moment from 'moment';
import AggConfigResult from 'ui/vis/agg_config_result';
import { MatrixedAggResponseWriterProvider } from 'ui/agg_response/matrixify/_response_writer';

export function matrixifyAggResponseProvider(Private, Notifier, timefilter) {
  const MatrixedAggResponseWriter = Private(MatrixedAggResponseWriterProvider);
  const notify = new Notifier({ location: 'agg_response/matrixify' });

  const HRS_IN_DAY = 24;
  const MINS_IN_HR = 60;
  const SECONDS_IN_MIN = 60;
  const MILLISECONDS_IN_SECOND = 1000;
  const monthNames =  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // This function will round of a given number to 1 point after decimal
  const roundOffToOneDigit = function (newVal) {
    return Math.round(newVal * 10) / 10;
  };

  // This function will take input values in any units of time
  // and convert the input values to milli seconds
  const convertToMilliseconds = function (inputTimeFormat, value) {
    switch (inputTimeFormat) {
      case 'millisecond': return value;
      case 'second':  return value * MILLISECONDS_IN_SECOND;
      case 'minute':  return value * MILLISECONDS_IN_SECOND * SECONDS_IN_MIN;
      case 'hour':  return value * MILLISECONDS_IN_SECOND * SECONDS_IN_MIN * MINS_IN_HR;
      case 'day':  return value * MILLISECONDS_IN_SECOND * SECONDS_IN_MIN * MINS_IN_HR * HRS_IN_DAY;
      default:   return value;
    }
  };

  // This function will take time values in one unit and convert it to another
  // unit.
  // inputTimeFormat: input unit of time( it can be in ms, sec, min, hour, day)
  // outputTimeFormat: output unit of time ( it can be in ms, sec, min, hour, day)
  // value: can positive integers of time values
  const changeOutputTimeFormat = function (inputTimeFormat, outputTimeFormat, value) {
    let newVal = convertToMilliseconds(inputTimeFormat, value);
    switch (outputTimeFormat) {
      case 'millisecond': return newVal;
      case 'second':     newVal = newVal / MILLISECONDS_IN_SECOND;
        return roundOffToOneDigit(newVal);
      case 'minute':     newVal = newVal / MILLISECONDS_IN_SECOND / SECONDS_IN_MIN;
        return roundOffToOneDigit(newVal);
      case 'hour':     newVal = newVal / MILLISECONDS_IN_SECOND / SECONDS_IN_MIN / MINS_IN_HR;
        return roundOffToOneDigit(newVal);
      case 'day':     newVal = newVal / MILLISECONDS_IN_SECOND / SECONDS_IN_MIN / MINS_IN_HR / HRS_IN_DAY;
        return roundOffToOneDigit(newVal);
      default:        return newVal;
    }
  };

  /*
  * function to add empty cell
  */
  function addEmptyCells(agg, row, count) {
    while(count > 0) {
      row.push(new AggConfigResult(agg, 'undefined', '', ''));
      count = count - 1;
    }
  }

  function matrixifyAggResponse(vis, esResponse, respOpts) {
    const write = new MatrixedAggResponseWriter(vis, esResponse, respOpts);
    if(esResponse.aggregations) {
      processAggregations(vis, write, esResponse.aggregations);
    }
    return write.response();
  }

  function processAggregations(vis, write, aggregations) {

    const input = timefilter.getActiveBounds();
    let bounds = [];
    if (_.isPlainObject(input)) {
      bounds = [input.min, input.max];
    } else {
      bounds = _.isArray(input) ? input : [];
    }
    const moments = _(bounds).map(_.ary(moment, 1)).sortBy(Number);

    // moments.pop() gives the end time
    // moments.shift() gives the start time
    // calculate the time duration using them.
    const duration = moment.duration(moments.pop() - moments.shift(), 'ms');
    const startDate = moments.shift()._d;
    const noOfDays = duration._data.days;
    // Get the configured aggregations from the stack..
    const firstAgg = write.aggStack[0];
    const keyAgg = write.aggStack[1];
    let  valueAgg;
    // If sub-aggrgation is not configured, don't populate value-agg
    if (write.aggStack.length > 2) {
      valueAgg = write.aggStack[2];
    }

    // Columns are based on first level of aggregations.. we need to get the
    // key of the first level and that will make the columns

    // We are interested in buckets alone, iterate on aggStack from Vis
    // First level is based on aggregation configuration
    const buckets = aggregations[firstAgg.id].buckets;
    let key;
    const rows = [];
    const rowDict = {};
    const columns = [];
    let column;

    // We add the first column only if we have a sub-aggregation
    if (write.aggStack.length > 2) {
      // First column is the name of the aggregation
      column = { title: keyAgg.makeLabel(),
        aggConfig: firstAgg
      };
      columns.push(column);
    }

    // Iterate on buckets to populate the columns.. Columns are populated
    // using the first aggregation configured under bucket.. Usually it will
    // be Date-Histogram but it can be a term as well

    // dCount is used to display dates in D1,D2... format
    let dCount = 1;
    let dateString;
    let timeString;

    // dayOffsetDataList is a list which will hold the index of all the dates
    // for which there are values
    const dayOffsetDataList = [];
    buckets.map(function (bucket) {
      // Get the key_as_string or key
      // prepare and display the date time string in the format:
      // YYYY MM DD HH:MM:SS
      if (_.has(bucket, 'key_as_string')) {
        // Only Date Histogram buckets have key_as_string
        // Terms do not have these.
        const dateObj = new Date(bucket.key_as_string);

        if (isNaN(dateObj.getTime())) {
          // This is the case where 'Date()' doesn't understand the
          // format. We currently know one of the format which Date()
          // doesn't understand.. try to check for that.. we check it
          // based on the length of the words separated by space.
          const keyArray = bucket.key_as_string.split(' ');

          // If key_as_string have 2016-12-03 19:12:00, we can parse it
          // to create similar key

          if (keyArray.length === 2) {
            const dateArray = keyArray[0].split('-');
            const month = monthNames[parseInt(dateArray[1]) - 1];
            dateString = dateArray[2] + ' ' + month + ' ' + dateArray[0];
            timeString = keyArray[1];

            // if collapseTimeHeaders checkbox is enabled then
            // prepare the date headers  in D1, D2... format
            if(vis.params.collapseTimeHeaders === true) {

              const curDay = moment(dateObj);
              const stDate =  moment(startDate);
              const dayDiff = curDay.diff(stDate, 'days', true);
              const dayOffset = dayDiff + 1;

              // Add the missing column headers / date headers
              if(dCount < dayOffset)
              {
                const diff = dayOffset - dCount;
                for(let item = 0; item < diff; item = item + 1)
                {
                  key = 'D' + dCount;

                  // Populate the title and aggConfigResult... aggConfigResult is used
                  // by Filtering to allow drill-down
                  column = { title: key,
                    aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
                    aggConfig: firstAgg
                  };
                  columns.push(column);
                  dCount = dCount + 1;
                }
              }

              // If date header exists add it to dayOffsetDataList
              dayOffsetDataList.push(dCount);
              key = 'D' + dCount;
              column = { title: key,
                aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
                aggConfig: firstAgg
              };
              columns.push(column);
              dCount = dCount + 1;
            }
            else {
              dayOffsetDataList.push(dCount);
              key = dateString + ' ' + timeString;
              // Populate the title and aggConfigResult... aggConfigResult is used
              // by Filtering to allow drill-down
              column = { title: key,
                aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
                aggConfig: firstAgg
              };
              columns.push(column);
              dCount = dCount + 1;
            }
          } else {
            // We really don't understand this date format so let us
            // use the same as what we have received
            key = bucket.key_as_string;
          }
        } else {
          // Looks like Date() understand the date, lets parse it and
          // create the proper one
          const month = monthNames[dateObj.getMonth()];
          const day = dateObj.getDate();
          const year = dateObj.getFullYear();
          const hour = dateObj.getHours();
          const minute = dateObj.getMinutes();
          const second = dateObj.getSeconds();
          const dateString = day + ' ' + month + ' ' + year;
          const timeString = hour + ':' + minute + ':' + second;

          // if collapseTimeHeaders checkbox is enabled then
          // prepare the date headers  in D1, D2... format
          if(vis.params.collapseTimeHeaders === true) {

            const curDay = moment(dateObj);
            const stDate =  moment(startDate);

            // find the duration in no of days by finding the
            // difference between start time(stDate) and current
            // time(curDay) in days
            const dayDiff = curDay.diff(stDate, 'days', true);
            const dayOffset = dayDiff + 1;

            // Add the missing column headers / date headers
            if(dCount < dayOffset)
            {
              const diff = dayOffset - dCount;
              for(let item = 0; item < diff; item = item + 1)
              {

                key = 'D' + dCount;
                // Populate the title and aggConfigResult... aggConfigResult is used
                // by Filtering to allow drill-down
                column = { title: key,
                  aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
                  aggConfig: firstAgg
                };
                columns.push(column);
                dCount = dCount + 1;
              }
            }

            // If date header exists add it to dayOffsetDataList
            dayOffsetDataList.push(dCount);
            key = 'D' + dCount;
            column = { title: key,
              aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
              aggConfig: firstAgg
            };
            columns.push(column);
            dCount = dCount + 1;

          }
          else {
            dayOffsetDataList.push(dCount);
            key = dateString + ' ' + timeString;
            // Populate the title and aggConfigResult... aggConfigResult is used
            // by Filtering to allow drill-down
            column = { title: key,
              aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
              aggConfig: firstAgg
            };
            columns.push(column);
            dCount = dCount + 1;
          }
        }
      } else {
        dayOffsetDataList.push(dCount);
        key = bucket.key;
        // Populate the title and aggConfigResult... aggConfigResult is used
        // by Filtering to allow drill-down
        column = { title: key,
          aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
          aggConfig: firstAgg
        };
        columns.push(column);
        dCount = dCount + 1;
      }
    });

    if(vis.params.collapseTimeHeaders === true) {
      while(dCount <= noOfDays) {
        key = 'D' + dCount;
        // Populate the title and aggConfigResult... aggConfigResult is used
        // by Filtering to allow drill-down
        column = { title: key,
          aggConfigResult: new AggConfigResult(firstAgg, 'undefined', key, key),
          aggConfig: firstAgg
        };
        columns.push(column);
        dCount += 1;
      }
    }

    // To create rows, iterate on the buckets and then iterate on internal
    // buckets
    let count = 0;

    // offsetCount is used as an index to dayOffsetDataList
    let offsetCount = 0;

    // These variables will be used to show the dates from D1 to D30
    // always. When last 30 days is selected from current date, If
    // current date is 9th May and April 9th is the start date, With the
    // help of these variables we normalize the dates such that 9th April
    // becomes D1, 10th April becomes D2 and so on.
    dCount = 1;
    let intDCount;
    let row = [];
    let intCount;
    buckets.map(function (bucket) {

      // If buckets are available, there may be multiple rows..
      if (_.has(bucket, keyAgg.id) && _.has(bucket[keyAgg.id], 'buckets')) {

        // Get buckets using id of the key aggregation
        const intBuckets = bucket[keyAgg.id].buckets;

        intBuckets.map(function (intBuckets) {

          // Get the key and the value
          key = intBuckets.key;
          let value = valueAgg.getValue(intBuckets);

          // Find the row in which we need to push this value
          if (key in rowDict) {
            row = rowDict[key];

          } else {

            row = [];

            // This key does not exist, let us create a new row for this
            // and add it in dict as well for future lookup
            const keyRow = new AggConfigResult(keyAgg, 'undefined', key, key);
            // Always push the key row into this newly created row
            row.push(keyRow);

            // Also add it in the dictionay and global rows
            rowDict[key] = row;
            rows.push(row);

          }

          // Get the current length of the row
          const rowLength = row.length;

          // Count is the number of buckets available.. and rowLength
          // is the number of items we have received in a row + the
          // first column that has the key name.. so if we are seeing a
          // key first time, row.lenth here will be 1 (key name in the

          // If the rowLength is not same as count, it means there
          // was one bucket which did not respond with this key in the
          // earlier buckets..
          if (count >= rowLength) {
            addEmptyCells(valueAgg, row, (count - rowLength + 1));
          }

          intCount = dayOffsetDataList[offsetCount];
          intDCount = dCount;
          while (intDCount < intCount) {
            addEmptyCells(valueAgg, row, 1);
            intDCount += 1;
          }

          // If enable checkbox under collapse time headers is checked
          // then values in matrix vis can be converted to any units of time
          // through select box provided. the conversion is handled in
          // changeOutputTimeFormat() function
          if(vis.params.enableTimeFormatter === true) {
            value = changeOutputTimeFormat(vis.params.inputTimeFormat,
              vis.params.outputTimeFormat,
              value);
          }
          // Push this value into the row
          const valueRow = new AggConfigResult(valueAgg, 'undefined', value, value);
          row.push(valueRow);

        });
      } else {

        // If there is no sub-aggregation, the response won't have
        // buckets and in such case, there will be only one row possible,
        // we create that row here..

        // If this is the first time, we are coming in, let us push the
        // row to the global rows array
        if (count === 0) {
          rows.push(row);
        }

        // Get the value from the key-aggregation
        const value = keyAgg.getValue(bucket);
        const valueRow = new AggConfigResult(keyAgg, 'undefined', value, value);
        row.push(valueRow);
      }

      // Increment the counter
      count = intCount;
      offsetCount += 1;
      dCount = intCount + 1;

    });

    // Iterate on rows and see if we have values for each column. There is a
    // case where we may not have values in row for each column
    rows.map(function (row) {
      // If length of this is less than length of columns, we need to add
      // more entries into row
      if (columns.length > row.length) {
        count = columns.length - row.length;
        if (write.aggStack.length > 2) {
          addEmptyCells(valueAgg, row, count);
        } else {
          addEmptyCells(keyAgg, row, count);
        }
      }
    });

    //stick to default
    if(!vis.params.collapseManageColumn) {
      vis.params.selectedColumnsActionType = 'exclude';
      vis.params.selectedColumns = [];
    }

    // If matrix is configured to include/exclude some specific columns
    if(vis.params.selectedColumnsActionType && vis.params.selectedColumnsActionType !== '') {
      //map include to true and exclude to false
      const action = vis.params.selectedColumnsActionType === 'include' ? true : false;
      //store all the column with action for rows mapping
      const columnIndex = [];
      //map column
      columns.map(function (column, index) {
        if(index === 0) {
          //always show first column
          column.show = true;
        } else if(vis.params.selectedColumns.includes(column.title)) {
          //if column is in selected list for action
          column.show = action;
          //push index , later will be used for column in rows
          columnIndex.push(index);
        } else {
          //if column is not in selected list for action
          column.show = !action;
        }
      });
      //map each column inside row
      rows.map(function (row) {
        row.map(function (column, index) {
          if(index === 0) {
            //always show first column
            column.show = true;
          } else if(columnIndex.includes(index)) {
            //if index of column in row is in selected list for action
            column.show = action;
          } else {
            //if index of column in row is not in selected list for action
            column.show = !action;
          }
        });
      });
    }
    // Update the rows and columns in root
    write.root.tables[0].rows = rows;
    write.root.tables[0].columns = columns;

  }

  return notify.timed('matrixify agg response', matrixifyAggResponse);
}
