import noDataMessageOptionsTemplate from './no_data_message_options.html';
import { uiModules } from 'ui/modules';

//This directive is used in the options template of visualizations.
//it is used to handle the enabling/disabling of custom messages (and tooltip info) and show textboxes for the same

const app = uiModules.get('kibana');

app
  .directive('noDataMessageOptions', function () {
    return {
      restrict: 'E',
      template: noDataMessageOptionsTemplate
    };
  });
