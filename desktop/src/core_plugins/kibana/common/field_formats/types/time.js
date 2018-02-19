export function createTimeFormat(FieldFormat) {
  return class TimeFormat extends FieldFormat {
    getParamDefaults() {
      return {
        transform: false
      };
    }

    // Defining the constants that will be used for
    // interconversion between different units of time
    static HRS_IN_DAY = 24;
    static MINS_IN_HR = 60;
    static SECONDS_IN_MIN = 60;
    static MILLISECONDS_IN_SECOND = 1000;
    static ROUND_OFF_CONSTANT = 1000;

    // This function will convert the hour, minutes, seconds, to 2 digit format : HH, MM, SS
    //Example
    //8 hours to 08
    //6 minutes to 06
    //12 seconds to 12
    formatTwoDigits = function (unitOfTime) {
      unitOfTime = unitOfTime < 10 ? '0' + unitOfTime : unitOfTime;
      return String(unitOfTime);
    }

    // This function will set the milliseconds to this format - "mmm"
    //Example
    //2 ms to 002
    //22 ms to 022
    //433 ms to 433
    formatThreeDigits = function (unitOfTime) {
      if(unitOfTime < 10) {
        unitOfTime = '00' + unitOfTime;
      } else if(unitOfTime >= 10 && unitOfTime < 100) {
        unitOfTime = '0' + unitOfTime;
      } else {
        unitOfTime = unitOfTime;
      }
      return String(unitOfTime);
    }

    // This function will take the hr ,min and sec as input and
    // prepares the output in time format( DD HH:MM:SS.MS )
    displayInDateTimeFormat = function (day, hr, min, sec, ms) {
      if(day > 0) {
        TimeFormat.result = String(day) + 'd' + ' '
                      + String(this.formatTwoDigits(hr)) + ':'
                      + String(this.formatTwoDigits(min)) + ':'
                      + String(this.formatTwoDigits(sec));
      } else if(day === 0 && hr === 0 && min === 0 && sec === 0) {
        TimeFormat.result = String(ms) + 'ms';
      } else {
        TimeFormat.result = String(this.formatTwoDigits(hr)) + ':'
                      + String(this.formatTwoDigits(min)) + ':'
                      + String(this.formatTwoDigits(sec)) + '.'
                      + String(this.formatTwoDigits(ms));
      }
      return TimeFormat.result;
    }

    // This function will convert the given input to
    // time format( DD HH:MM:SS.MS ). This will always
    // take input in milliseconds
    convertToTimeFormat = function (val) {
      let day = 0;
      let hr = 0;
      let min = 0;
      let sec = 0;
      let ms = 0;
      if(val < TimeFormat.MILLISECONDS_IN_SECOND) {
        // In order to display the floating point numbers rounded
        // off to 3 digit after the decimal point, we multiply the val
        // by 1000 and divide the result by 1000.
        //Here ROUND_OFF_CONSTANT =1000
        ms = Math.round(val * TimeFormat.ROUND_OFF_CONSTANT) / TimeFormat.ROUND_OFF_CONSTANT;
      } else {
        ms = parseInt(val % TimeFormat.MILLISECONDS_IN_SECOND);
        sec = parseInt(val / TimeFormat.MILLISECONDS_IN_SECOND);

        if(sec >= 0 && sec < TimeFormat.SECONDS_IN_MIN) {
          sec = sec;
        } else {
          min = parseInt(sec / TimeFormat.SECONDS_IN_MIN);
          sec = sec % TimeFormat.SECONDS_IN_MIN;

          if(min >= 0 && min < TimeFormat.SECONDS_IN_MIN) {
            min = min;
          } else {
            hr = parseInt(min / TimeFormat.MINS_IN_HR);
            min = min % TimeFormat.SECONDS_IN_MIN;

            if(hr >= 0 && hr < TimeFormat.HRS_IN_DAY) {
              hr = hr;
            } else {
              day = parseInt(hr / TimeFormat.HRS_IN_DAY);
              hr = hr % TimeFormat.HRS_IN_DAY;
            }
          }
        }
      }
      TimeFormat.result = this.displayInDateTimeFormat(day, hr, min, sec, ms);
      return TimeFormat.result;
    }

    // This function is called when the input is in milliseconds
    // This will call the "convertToTimeFormat" to get the output in
    //  DD HH:MM:SS.MS format.
    millisecToTimeFormatConverter = function (val) {
      TimeFormat.result = this.convertToTimeFormat(val);
      return TimeFormat.result;
    }

    // This function is called when the input is in seconds.
    // The input is converted to milliseconds and then
    // the "millisecToTimeFormatConverter" is called to get the output in
    // DD HH:MM:SS.MS format.
    secondsToTimeFormatConverter = function (val) {
      const newVal = val * TimeFormat.MILLISECONDS_IN_SECOND;
      TimeFormat.result = this.millisecToTimeFormatConverter(newVal);
      return TimeFormat.result;
    }

    // This function is called when the input is in minutes.
    // The input is converted to milliseconds and then
    // the "secondsToTimeFormatConverter" is called to get the output in
    // DD HH:MM:SS.MS format.
    minutesToTimeFormatConverter = function (val) {
      const newVal = val * TimeFormat.SECONDS_IN_MIN;
      TimeFormat.result = this.secondsToTimeFormatConverter(newVal);
      return TimeFormat.result;
    }

    // This function is called when the input is in hours.
    // The input is converted to milliseconds and then
    // the "minutesToTimeFormatConverter" is called to get the output in
    // DD HH:MM:SS.MS format.
    hourToTimeFormatConverter = function (val) {
      const newVal = val * TimeFormat.MINS_IN_HR;
      TimeFormat.result = this.minutesToTimeFormatConverter(newVal);
      return TimeFormat.result;
    }

    // This function is called when the input is in days.
    // The input is converted to milliseconds and then
    // the "hourToTimeFormatConverter" is called to get the output in
    // DD HH:MM:SS.MS format.
    dayToTimeFormatConverter = function (val) {
      const newVal = val * TimeFormat.HRS_IN_DAY;
      TimeFormat.result = this.hourToTimeFormatConverter(newVal);
      return TimeFormat.result;
    }

    _convert(val) {
      let result = '';
      if(val === undefined || isNaN(val)) {
        return val;
      }

      switch (this.param('transform')) {

        case 'millisecond':
          result = this.millisecToTimeFormatConverter(val);
          return result;
        case 'second':
          result = this.secondsToTimeFormatConverter(val);
          return result;
        case 'minute':
          result = this.minutesToTimeFormatConverter(val);
          return result;
        case 'hour':
          result = this.hourToTimeFormatConverter(val);
          return result;
        case 'day':
          result = this.dayToTimeFormatConverter(val);
          return result;
        default:
          return val;
      }
    }

    static id = 'time';
    static title = 'Time';
    static fieldType = [
      'number'
    ];
  };
}
