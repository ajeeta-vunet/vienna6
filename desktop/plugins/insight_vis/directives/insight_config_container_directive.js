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
    }
  };
});
