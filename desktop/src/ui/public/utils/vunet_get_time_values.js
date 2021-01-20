
// This function takes time values in seconds as
// input and returns a list containing
// day, hour, min and seconds as output.
const getTimeUnits = function (sec) {
  let day = 0;
  let hr = 0;
  let min = 0;
  const SECONDS_IN_MIN = 60;
  const MINS_IN_HR = 60;
  const HRS_IN_DAY = 24;

  if (sec >= 0 && sec < SECONDS_IN_MIN) {
    sec = sec;
  } else {
    min = parseInt(sec / SECONDS_IN_MIN);
    sec = sec % SECONDS_IN_MIN;

    if (min >= 0 && min < MINS_IN_HR) {
      min = min;
    } else {
      hr = parseInt(min / MINS_IN_HR);
      min = min % MINS_IN_HR;

      if (hr >= 0 && hr < HRS_IN_DAY) {
        hr = hr;
      } else {
        day = parseInt(hr / HRS_IN_DAY);
        hr = hr % HRS_IN_DAY;
      }
    }
  }
  return [day, hr, min, sec];
};

// This function is takes the time values in seconds
// as input and converts them to a format as shown below:
// Input(in seconds)	Filter Output
//  320	               5m 20s
//  3666	             1h 1m
export function displayTwoTimeUnits(timeValue) {
  const timeUnits = getTimeUnits(timeValue);

  const day = String(parseInt(timeUnits[0]));
  const hr = String(parseInt(timeUnits[1]));
  const min = String(parseInt(timeUnits[2]));
  const sec = String(parseInt(timeUnits[3]));
  let result = '';
  if (day > 0) {
    result = day + (Number(day) === 1 ? 'day' : 'days') + ' ' + hr + (Number(hr) === 1 ? 'hour' : 'hours');
  } else if (hr > 0) {
    result = hr + (Number(hr) === 1 ? 'hour' : 'hours') + ' ' + min + (Number(day) === 1 ? 'min' : 'mins');
  } else if (min > 0) {
    result = min + (Number(min) === 1 ? 'min' : 'mins') + ' ' + sec + (Number(sec) === 1 ? 'sec' : 'secs');
  }
  else {
    result = sec + (Number(sec) === 1 ? 'sec' : 'secs');
  }
  return result;
}
