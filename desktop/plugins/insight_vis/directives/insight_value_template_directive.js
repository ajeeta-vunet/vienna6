import _ from 'lodash';
import { uiModules } from 'ui/modules';
require('../directives/insight_value_template_directive.js');
import { getImages } from 'ui/utils/vunet_image_utils.js';

const module = uiModules.get('kibana');

// This directive defines a template
// In the future we can add multiple templates the user the can choose from
// This takes the following parameters:
// insight: object holding all the details of that perticualr insight.

module.directive('insightValueTemplate', function (StateService) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      visParams: '='
    },
    template: require('./insight_value_template_directive.html'),
    link: function (scope) {
      // For existing visualizations, where insightType is not defined,
      // set it to 'text'
      if (!(_.has(scope.visParams, 'insightType'))) {
        scope.visParams.insightType = 'text';
      }
      // Get the updated iconList with uploaded images.
      getImages(StateService).then(function (iconDict) {
        scope.iconList =  Object.keys(iconDict);
      });
    }
  };
});
