import { roundOffToTwoDigits } from '../../utils/round_of_two_digits';
export function createBitsFormat(FieldFormat) {
  return class BitsFormat extends FieldFormat {
    getParamDefaults() {
      return {
        transform: false
      };
    }

    // This function takes the value in bits and converts to higher order
    convertToHigherOrderBits = function (valInBits, exponent, bitUnit) {
      let bitValue = valInBits / Math.pow(10, exponent);
      bitValue = roundOffToTwoDigits(bitValue);
      bitValue = String(bitValue) + bitUnit;
      return  bitValue;
    }

    // This function displays to b/kb/mb/gb based on the range of value
    formatInputToOutput = function (valInBits) {
      if(valInBits < 1000) {
        valInBits = roundOffToTwoDigits(valInBits);
        return String(valInBits) + 'b';
      } else if(valInBits >= Math.pow(10, 3) && valInBits < Math.pow(10, 6)) {
        return this.convertToHigherOrderBits(valInBits, 3, 'kb');
      } else if(valInBits >= Math.pow(10, 6) && valInBits < Math.pow(10, 9)) {
        return this.convertToHigherOrderBits(valInBits, 6, 'mb');
      } else if(valInBits >= Math.pow(10, 9) && valInBits < Math.pow(10, 12)) {
        return this.convertToHigherOrderBits(valInBits, 9, 'gb');
      } else {
        return this.convertToHigherOrderBits(valInBits, 12, 'tb');
      }
    }

    _convert(val) {
      if(val === undefined || isNaN(val)) {
        return val;
      }

      switch (this.param('transform')) {
        case 'bit':
          val;
          break;
        case 'kilobit':
          val = val * Math.pow(2, 10);
          break;
        case 'megabit':
          val = val * Math.pow(2, 20);
          break;
        case 'gigabit':
          val = val * Math.pow(2, 30);
          break;
        case 'byte':
          val = val * 8;
          break;
        case 'kilobyte':
          val = val * 8 * Math.pow(2, 10);
          break;
        case 'megabyte':
          val = val * 8 * Math.pow(2, 20);
          break;
        case 'gigabyte':
          val = val * 8 * Math.pow(2, 30);
          break;
        default:
          return val;
      }
      return this.formatInputToOutput(val);
    }

    static id = 'bits';
    static title = 'Bits';
    static fieldType = [
      'number'
    ];
  };
}
