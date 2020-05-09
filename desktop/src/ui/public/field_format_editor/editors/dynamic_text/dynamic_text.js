import dynamicTextTemplate from '../dynamic_text/dynamic_text.html';
import _ from 'lodash';

export function dynamicTextEditor() {
  return {
    formatId: 'dynamictext',
    template: dynamicTextTemplate,
    controllerAs: 'cntrl',
    controller: function ($scope) {
      // editor controller
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
