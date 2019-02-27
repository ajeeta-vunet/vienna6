import { uiModules } from 'ui/modules';
require('../directives/utm_metric_list_directive.js');
require('../directives/utm_subgraph_directive');
const module = uiModules.get('kibana');

// This directive is used to create graph.
module.directive('utmGraph', function () {
  return {
    restrict: 'E',
    scope: {
      visParams: '=',
      bmvList: '=',
    },
    template: require('./utm_graph_directive.html'),
    link: function () {
    }
  };
});
