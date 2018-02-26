import _ from 'lodash';
import moment from 'moment';

/*
 * Returns the interval in seconds for 24 hours (1 Day)
 */
export function getOneDayInterval() {
  return '1d';
}

/*
 * Returns the interval in seconds for the given time range and no of columns
 *
 * @param timefilter - Timefilter has the start time and end time.
 * @param noOfColumns - The no of colums to be split into
 */
export function getIntervalByNoOfColumns(timefilter, noOfColumns) {

  // get the time selected from global time filter
  // calculate the start time and end time
  // convert them to moment objects
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
  const interval = duration._milliseconds / noOfColumns;

  // set the interval value in seconds
  return interval / 1000 + 's';
}

/*
 * Convert the given time unit to seconds.
 */
export function convertToSeconds(interval, customInterval) {
  switch (interval) {
    case 's':
      return 1;
    case 'm':
      return 60;
    case 'h':
      return 3600;
    case 'd':
      return 86400;
    case 'w':
      return 86400 * 7;
    case 'M':
      return 86400 * 30;
    case 'y':
      return 86400 * 365;
    case 'auto':
      return 3600;
    case 'custom':
      let customSize = customInterval.slice(0, -1);
      customSize = parseInt(customSize);
      const newInterval = customInterval[customInterval.length - 1];
      return customSize * convertToSeconds(newInterval);
    default:
      return 3600;
  }
}
