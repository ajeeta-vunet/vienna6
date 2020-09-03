import './no_data_message.less';
import noDataMessageTemplate from './no_data_message.html';
import { uiModules } from 'ui/modules';

//The directive is used to display the message and tooltip that are shown when no results are found in a visualization
//if enableCustomErrorMessage is true, the custom message is shown, the same applies for enableCustomErrorTooltip

const app = uiModules.get('kibana');

app
  .directive('noDataMessage', function () {
    return {
      restrict: 'E',
      template: noDataMessageTemplate,
      scope: {
        enableCustomErrorMessage: '=?',
        errorMessage: '=?',
        enableCustomErrorTooltip: '=?',
        customErrorTooltip: '=?'
      }
    };
  });
