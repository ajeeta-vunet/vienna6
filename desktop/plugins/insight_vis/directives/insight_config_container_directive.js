import { uiModules } from 'ui/modules';

require('../directives/insight_config_container_directive.js');

const module = uiModules.get('kibana');

// This directive can be used to switch between multiple insight templates
// This takes the following parameters:
// insight: object holding all the details of that perticualr insight.

module.directive('insightConfigContainer', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      visParams: '='
    },
    template: require('./insight_config_container_directive.html'),
    link: function (scope) {
      scope.visParams.type = 'evaluation';
      // When there is no cardType param, set it to default
      // Required for backward compatibility
      if(!scope.visParams.cardType) {
        scope.visParams.cardType = 'default';
      }

      // Function when card type is changed
      scope.changeCardType = function () {
        if(scope.visParams.cardType === 'proactive' || scope.visParams.cardType === 'predictive') {
          scope.visParams.insightType = 'text';
        }
      };
    }
  };
});