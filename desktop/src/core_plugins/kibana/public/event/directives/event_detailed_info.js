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
        if (key === 'Alert_Active_For' ||
          key === 'Alert_Frequency_for_Today' ||
          key === 'Alert_Frequency_in_Last_2_Days' ||
          key === 'Alert_Frequency_in_Last_7_Days' ||
          key === 'Downtime_for_Today' ||
          key === 'Downtime_in_Last_2_Days' ||
          key === 'Downtime_in_Last_7_Days') {
          return true;
        }
        else {
          return false;
        }
      };

      // This function checks if a value for a key needs to
      // be displayed as it has been received with out any processing
      scope.ifDisplayValue = function (key) {
        if (!(key === 'Alert_Active_For' ||
          key === 'Alert_Frequency_for_Today' ||
          key === 'Alert_Frequency_in_Last_2_Days' ||
          key === 'Alert_Frequency_in_Last_7_Days' ||
          key === 'Downtime_for_Today' ||
          key === 'Downtime_in_Last_2_Days' ||
          key === 'Downtime_in_Last_7_Days' ||
          key === 'Alert_Start_Time' ||
          key === 'timestamp')) {
          return true;
        }
        else {
          return false;
        }
      };
    }
  };
});