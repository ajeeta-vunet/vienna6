const app = require('ui/modules').get('app/event', []);

// This directive is used to prepare the alert information blocks on the
// right side which is displayed when any event is clicked.
app.directive('eventDetailedInfo', function () {
  return {
    restrict: 'A',
    template: require('plugins/kibana/event/directives/event_detailed_info.html'),
    scope: {
      section: '=section'
    },
    link: function (scope) {

      // This function checks if a value for a key needs to
      // be displayed in custom time format.
      scope.ifDisplayCustomTimeFormat = function (key) {
        if (key === 'Today Active For' ||
          key === 'Last 7 Days Active For' ||
          key === 'Last 1 Month Active For' ||
          key === 'Active For' ||
          key === 'Duration') {
          return true;
        }
        else {
          return false;
        }
      };

      // This function checks if a value for a key needs to
      // be displayed as it has been received with out any processing
      scope.ifDisplayValue = function (key) {
        if (!(key === 'Today Active For' ||
          key === 'Last 7 Days Active For' ||
          key === 'Last 1 Month Active For' ||
          key === 'Active For' ||
          key === 'Duration' ||
          key === 'Start Time' ||
          key === 'Time')) {
          return true;
        }
        else {
          return false;
        }
      };
    }
  };
});
