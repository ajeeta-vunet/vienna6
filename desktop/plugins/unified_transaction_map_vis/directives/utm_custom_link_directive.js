import { uiModules } from 'ui/modules';
import { validateLabel } from 'ui/utils/validate_label.js';
require('../directives/utm_metric_list_directive.js');

const module = uiModules.get('kibana');

// This directive is used to create link.
// This takes the following parameters:
// visParams: Link object holding all the details of link.

module.directive('customLink', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      visParams: '=',
      nodeLabelList: '=',
      linkLabelList: '=',
      bmvList: '=',
    },
    template: require('./utm_custom_link_directive.html'),
    link: function (scope) {

      // removing undefined entry in scope.linkList.
      scope.linkLabelList = scope.linkLabelList.filter(function (element) {
        return element !== undefined;
      });

      // If node is not configured then show empty string
      // in the dropdown of from and to node fields.
      if(scope.nodeLabelList[0] === undefined) {
        scope.nodeLabelList = '';
      }

      // Function to invalidate form if more than
      // 1 link configured with same name.
      scope.validateLinkLabel = function (modelVal) {
        scope.duplicateLink = false;

        // Set form to invalid if return value of validateLabel function is true.
        scope.duplicateLink  = scope.addLinkForm.link.$invalid = validateLabel(scope.linkLabelList, modelVal);

      };
    }
  };
});
