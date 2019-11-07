import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana');

// This directive is used to create graph.
module.directive('bulletGraph', function () {
  return {
    restrict: 'E',
    scope: {
      bullet: '=',
      bmvList: '=',
      metricList: '=',
      aggLength: '=',
    },
    template: require('./bullet_graph_directive.html'),
    link: function (scope) {
      scope.aggLength = 0;
      // Update the metricList when ever the metrics changes in BMV.
      scope.$watch('metricList', function () {
        scope.updateMetricsList();
      });

      // This function updates list in metrics and aggLength for selected BMV.
      scope.updateMetricsList = ()  => {
        scope.metrics = [];
        // Get the metrics and aggregation length using selected BMV.
        const selectedBMV = scope.metricList && scope.bullet.name &&
        scope.metricList.find(metric => metric[scope.bullet.name.title])[scope.bullet.name.title];
        // Get the metrics list for selected BMV.
        scope.metrics = selectedBMV && selectedBMV[scope.bullet.name.title];

        // Get the aggLength for selected BMV.
        scope.aggLength = selectedBMV && selectedBMV.aggregationLength;
      };
    }
  };
});
