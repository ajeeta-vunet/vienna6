import {
  INPUT_TYPE,
  FORMAT_TYPE,
  getFormatter
} from './helper/dynamic_text_helper';

export function createDynamicText(FieldFormat) {
  return class DynamicTextFormat extends FieldFormat {
    //default selected format
    getParamDefaults() {
      return {
        input: 'comma',
        locale: 'IND'
      };
    }

    //comma separated format
    commaFormat = function (num, locale) {
      const formatterFunction = getFormatter(locale);
      return formatterFunction(num);
    }

    // Dynamic formatter
    // Format number as per their value
    dynamicFormatter = function (num, precision, locale) {
      //get locales
      const locales = INPUT_TYPE.find(function (_inputType) {
        return _inputType.id === locale;
      });

      let dynamicFormat = [{
        value: 1,
        text: ''
      },
      {
        value: 1E3,
        text: ''
      }];
      //concat with locales format
      dynamicFormat = dynamicFormat.concat(locales.dynamic_format);

      let dynamicIndex;
      //let's check the input with format values
      //starting from greater value that's why backwards
      //asap we get that number is greatter than the format value
      //we break the loop and the current format value will be used to devide the number.
      for (dynamicIndex = dynamicFormat.length - 1; dynamicIndex > 0; dynamicIndex--) {
        if (num >= dynamicFormat[dynamicIndex].value) {
          break;
        }
      }

      return dynamicIndex > 1 ? (num / dynamicFormat[dynamicIndex].value).toFixed(precision) +
            ' ' +
            dynamicFormat[dynamicIndex].text : this.commaFormat(num, locale);
    }

    // Format number
    // If num is greatter then 99999 then format otherwise return comma separate value
    numberFormatter = function (num, precision, locale, format) {
      const locales = INPUT_TYPE.find(function (_inputType) {
        return _inputType.id === locale;
      });

      let formatDesc = [];

      INPUT_TYPE.forEach(function (inputType) {
        formatDesc = formatDesc.concat(inputType.dynamic_format.filter(function (dynamicFormat) {
          return (dynamicFormat.text === format);
        }));
      });

      return num > 99999 ? (num / formatDesc[0].value).toFixed(precision) +
        ' ' + formatDesc[0].text : this.commaFormat(num, locale);
    }

    _convert(val) {
      let result = '';
      if (val === undefined || isNaN(val)) {
        return val;
      }
      switch (this.param('input')) {
        case 'comma':
          result = this.commaFormat(val, this.param('locale'));
          return result;
        case 'lakhs':
          result = this.numberFormatter(val, this.precision, this.param('locale'), 'Lakhs');
          return result;
        case 'crores':
          result = this.numberFormatter(val, this.precision, this.param('locale'), 'Crore');
          return result;
        case 'millions':
          result = this.numberFormatter(val, this.precision, this.param('locale'), 'Million');
          return result;
        case 'billions':
          result = this.numberFormatter(val, this.precision, this.param('locale'), 'Billion');
          return result;
        case 'dynamic_IND':
          result = this.dynamicFormatter(val, this.precision, this.param('locale'));
          return result;
        case 'dynamic_US':
          result = this.dynamicFormatter(val, this.precision, 'US');
          return result;
        default:
          return val;
      }
    }

    // Dynamic text formater object properties
    // id
    static id = 'dynamictext';
    // title to show
    static title = 'Dynamic Text';
    // applied only to number
    static fieldType = [
      'number'
    ];
    // input and locale values for edito dropdown
    static inputs = FORMAT_TYPE;
    static locales =  INPUT_TYPE;

  };
}
