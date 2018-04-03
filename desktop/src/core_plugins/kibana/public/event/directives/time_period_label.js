const app = require('ui/modules').get('app/event', []);

// This directive is used to display labels for the time based
// event widgets
app.directive('timePeriodLabel', function () {
  return {
    restrict: 'A',
    template: '<span>{{ timePeriodLabel }}</span>',
    scope: {
      timePeriodLabel: '='
    },
    link: function (scope) {
      if (scope.timePeriodLabel === 'last_1_hour') {
        scope.timePeriodLabel = '1 hour';
      }
      else if (scope.timePeriodLabel === 'last_1_day') {
        scope.timePeriodLabel = '1 day';
      }
      else if (scope.timePeriodLabel === 'last_7_days') {
        scope.timePeriodLabel = '1 week';
      }
      else if (scope.timePeriodLabel === 'selected_period') {
        scope.timePeriodLabel = 'Current';
      }
    }
  };
});