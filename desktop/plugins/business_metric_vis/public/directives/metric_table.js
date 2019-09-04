const app = require('ui/modules').get('kibana/business_metric_vis', ['kibana', 'kibana/courier']);

app.directive('tableDirective', function (RecursionHelper) {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      metr: '=',
      vis: '=',
      columnWidth: '=',
      setTrendColorForTabularBm: '=',
      idealTextColor: '=',
      confirmationToStartActionForTableDirective: '='
    },
    template: require('plugins/business_metric_vis/directives/metric_table.html'),
    compile: function (element) {
      return RecursionHelper.compile(element, function () {
      });
    }
  };
});
