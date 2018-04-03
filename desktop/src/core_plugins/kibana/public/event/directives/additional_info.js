const app = require('ui/modules').get('app/event', []);

// This directive is used to prepare the additional information (information rules)
// on the right side which is displayed when any event is clicked.
app.directive('additionalInfo', function () {
  return {
    restrict: 'A',
    template: require('plugins/kibana/event/directives/additional_info.html'),
    scope: {
      section: '=section'
    }
  };
});
