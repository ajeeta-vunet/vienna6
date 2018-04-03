const app = require('ui/modules').get('app/event', []);

// This directive is used to prepare the alert information blocks on the
// right side which is displayed when any event is clicked.
app.directive('eventDetailedInfo', function () {
  return {
    restrict: 'A',
    template: require('plugins/kibana/event/directives/event_detailed_info.html'),
    scope: {
      section: '=section'
    }
  };
});