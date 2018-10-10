import numeralTemplate from './currency.html';
import { INPUT_TYPE } from '../../../../../core_plugins/kibana/common/field_formats/types/helper/currency_helper';
import _ from 'lodash';

export function currencyEditor() {
  return {
    formatId: 'currency',
    template: numeralTemplate,
    controllerAs: 'cntrl',
    controller: function ($scope) {
      // editor controller
      // hide/show format type based on locale
      $scope.$watch('editor.formatParams.locale', function (locale) {

        const formatesToShow = INPUT_TYPE.find(function (_inputType) { return _inputType.id === locale; }).formats;

        $scope.editor.field.format.type.inputs.forEach((formatType) => {
          if (_.includes(formatesToShow, formatType.id)) {
            formatType.show = true;
          } else {
            formatType.show = false;
          }
        });

      });

      $scope.editor.field.format.type.sampleInputs =  [
        0,
        12,
        12.34,
        1234.56,
        12345.67,
        123456.78,
        1234567.89,
        12345678.90,
        123456789,
        12345678923456
      ];
    }
  };
}
