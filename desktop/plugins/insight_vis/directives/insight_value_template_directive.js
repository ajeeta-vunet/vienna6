import { uiModules } from 'ui/modules';
require('../directives/insight_value_template_directive.js');

const module = uiModules.get('kibana');

// This directive defines a template
// In the future we can add multiple templates the user the can choose from
// This takes the following parameters:
// insight: object holding all the details of that perticualr insight.

module.directive('insightValueTemplate', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      visParams: '='
    },
    template: require('./insight_value_template_directive.html'),
    link: function (scope) {
      scope.iconList = [
        'Action Required',
        'Archival Cost',
        'Archival Volume',
        'Calender',
        'Information',
        'Network',
        'Operational Perormance',
        'Server',
        'Service',
        'Time'
      ];
    }
  };
});
