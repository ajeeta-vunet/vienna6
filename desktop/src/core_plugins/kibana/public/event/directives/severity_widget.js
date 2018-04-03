const app = require('ui/modules').get('app/event', []);

// This directive is used to create the severity widget
app.directive('severityWidget', function () {
  return {
    restrict: 'A',
    template: require('plugins/kibana/event/directives/severity_widget.html'),
    scope: {
      widget: '=widget'
    }
  };
});