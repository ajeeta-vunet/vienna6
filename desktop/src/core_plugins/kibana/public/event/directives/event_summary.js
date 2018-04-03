const app = require('ui/modules').get('app/event', []);

// This directive is used to create each event in the list of events section
app.directive('eventSummary', function () {
  return {
    restrict: 'A',
    template: require('plugins/kibana/event/directives/event_summary.html'),
    scope: {
      event: '=event',
      // Enables two way binding and invoke the showEventInformation
      // function in the controller from this directive.
      showEventInformation: '&'
    },
    link: function (scope) {

      // This function is used to set the font awesome icons
      // based on severity type.
      scope.setIconsForAlertItems = function (severity) {
        if (severity === 'critical') {
          return 'fa-minus-circle';
        }
        else if (severity === 'error') {
          return 'fa-exclamation-circle';
        }
        else if (severity === 'warning') {
          return 'fa-warning';
        }
        // Since we are using the same icon for error
        // and information we are adding this class
        // just to change the icon color for information
        else if (severity === 'information') {
          return 'fa-exclamation-circle information';
        }
      };
    }
  };
});