import { roundOffToTwoDigits } from '../../utils/round_of_two_digits';
export function createPercentFormat(FieldFormat) {
  return class PercentFormat extends FieldFormat {
    getParamDefaults() {
      return {
        transform: false
      };
    }

    zeroToOneRangeConverter = function (val) {
      val = roundOffToTwoDigits(val * 100);
      return String(val) + '%';
    }

    zeroToHundredRangeConverter = function (val) {
      val = roundOffToTwoDigits(val);
      return String(val) + '%';
    }

    _convert(val) {
      let result = '';
      switch (this.param('transform')) {
        case '0-1_range':
          result = this.zeroToOneRangeConverter(val);
          return result;
        case '0-100_range':
          result = this.zeroToHundredRangeConverter(val);
          return result;
        default:
          return val;
      }
    }

    static id = 'percentage';
    static title = 'Percentage';
    static fieldType = [
      'number'
    ];
  };
}
