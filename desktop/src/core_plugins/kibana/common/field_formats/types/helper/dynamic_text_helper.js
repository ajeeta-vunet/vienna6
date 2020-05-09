const dynamicTextHelper = module.exports = {

  //locales
  //Pattern ref: https://www.thefinancials.com/Default.aspx?SubSectionID=curformat
  INPUT_TYPE: [{
    id: 'IND',
    name: 'India',
    options: {
      pattern: '#,##,##0.00',
      thousandSeparator: ',',
      decimalSeparator: '.'
    },
    formats: ['comma', 'lakhs', 'crores', 'millions', 'billions', 'dynamic_IND', 'dynamic_US'],
    dynamic_format: [{
      value: 1E5,
      text: 'Lakhs'
    }, {
      value: 1E7,
      text: 'Crore'
    }]
  },
  {
    id: 'US',
    name: 'US',
    options: {
      pattern: '#,##0.00',
      thousandSeparator: ',',
      decimalSeparator: '.'
    },
    formats: ['comma', 'millions', 'billions', 'dynamic_IND', 'dynamic_USD'],
    dynamic_format: [{
      value: 1E6,
      text: 'Million'
    }, {
      value: 1E9,
      text: 'Billion'
    }]
  },
  ],
  //Dynamic text format type
  //show: will be show/hide as per the list of formats in locales
  FORMAT_TYPE: [{
    id: 'comma',
    name: 'Comma Separated',
    show: true
  },
  {
    id: 'lakhs',
    name: 'Lakhs',
    show: true
  },
  {
    id: 'crores',
    name: 'Crores',
    show: true
  },
  {
    id: 'millions',
    name: 'Millions',
    show: true
  },
  {
    id: 'billions',
    name: 'Billions',
    show: true
  },
  {
    id: 'dynamic_IND',
    name: 'Dynamic (India number format)',
    show: true
  },
  {
    id: 'dynamic_US',
    name: 'Dynamic (US number format)',
    show: true
  },
  ],

  // return val with fix number after decimal point
  toFixed: function (val, precision) {
    return (Math.round(Number(val) * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(precision);
  },

  //return a formater function
  getFormatter: function (locale) {

    const locales = dynamicTextHelper.INPUT_TYPE.find(function (_inputType) {
      return _inputType.id === locale;
    });

    const pattern = locales.options.pattern;
    const decimal = locales.options.decimalSeparator;
    const group = locales.options.thousandSeparator;

    // encode locale pattern
    const encodePattern = function (pattern) {
      const numberFormatPattern = pattern.trim().match(/[#0,\.]+/)[0];

      const split = numberFormatPattern.split('.');
      const decimalChar = split[0];
      const decimalMentissa = split[1];

      const groups = decimalChar.split(',');
      const groupLengths = groups.map(function (g) {
        return g.length;
      });
      const zeroLength = (groups[groups.length - 1].match(/0/g) || []).length;
      const decimalPlaces = typeof decimalMentissa === 'undefined' ? 0 : decimalMentissa.length;
      const paddingSplit = pattern.split(numberFormatPattern);

      const encodedPattern = {
        pattern: pattern,
        decimalPlaces: decimalPlaces,
        frontPadding: paddingSplit[0],
        backPadding: paddingSplit[1],
        groupLengths: groupLengths,
        zeroLength: zeroLength
      };

      return encodedPattern;
    };

    // Padding to add 0s if required
    const pad = function (number, width) {
      number = number + '';
      return number.length >= width ? number : new Array(width - number.length + 1).join('0') + number;
    };

    // Format function
    const format = function (number, format) {
      let formattedNumber = dynamicTextHelper.toFixed(Math.abs(number), format.decimalPlaces);
      const splitNumber = formattedNumber.split('.');
      let segment = '';
      let cursor = splitNumber[0].length;
      const maxGroupIndex = format.groupLengths.length - 1;
      let groupIndex = maxGroupIndex;

      if (maxGroupIndex > 0) {
        while (cursor > 0) {
          if (groupIndex < 1) {
            groupIndex = 1;
          } //if a big numbers
          const currentGroupLength = format.groupLengths[groupIndex];
          const start = cursor - currentGroupLength;
          segment = splitNumber[0].substring(start, cursor) + format.group + segment;
          cursor -= currentGroupLength;
          --groupIndex;
        }
        segment = segment.substring(0, segment.length - 1);
      } else {
        segment = splitNumber[0];
      }

      if (segment.length < format.zeroLength) {
        segment = pad(segment, format.zeroLength);
      }
      return formattedNumber;
    };

    // Use encode function for pattern
    const patternArray = pattern.split(';');
    const positiveFormat = encodePattern(patternArray[0]);

    positiveFormat.decimal = decimal;
    positiveFormat.group = group;

    const negativeFormat = typeof patternArray[1] === 'undefined' ? encodePattern('-' + patternArray[0]) : encodePattern(patternArray[1]);

    negativeFormat.decimal = decimal;
    negativeFormat.group = group;

    const zero = typeof patternArray[2] === 'undefined' ? format(0, positiveFormat) : patternArray[2];

    return function (number) {
      if (isNaN(number)) {
        return number;
      }
      let formattedNumber;
      number = Number(number);
      if (number > 0) {
        formattedNumber = format(number, positiveFormat);
      } else if (number === 0) {
        formattedNumber = zero;
      } else {
        formattedNumber = format(number, negativeFormat);
      }
      return formattedNumber;
    };

  }
};
