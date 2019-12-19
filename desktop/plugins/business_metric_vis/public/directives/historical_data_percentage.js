import angular from 'angular';
const app = require('ui/modules').get('kibana/business_metric_vis', ['kibana', 'kibana/courier']);

// This directive is used to display the percentage change in the
// historical data.
app.directive('historicalDataPercentage', function () {
  return {
    restrict: 'EA',
    scope: {
      obj: '=',
      vis: '='
    },
    template: require('plugins/business_metric_vis/directives/historical_data_percentage.html'),
    link: function (scope) {

      // Initialize the display value.
      scope.displayValue = '';

      // Initialize the display icon.
      scope.displayIcon = false;

      scope.setPercentageChange = function() {

        if (scope.obj.hasOwnProperty('percentageChange')) {

          // When percentage change is -1
          if (scope.obj.percentageChange === -1) {
            // When both value and percentage are to be displayed
            // hide the percentage if value is 'N.A.'. This is done to
            // avoid showing "N.A. (N.A.)"
            if (scope.vis &&
              scope.vis.params.enableHistDataValueWithPercentage &&
              scope.obj.formattedValue === 'N.A.') {
              scope.displayValue = '';
            } else {
              scope.displayValue = 'N.A.';
            }
            scope.displayIcon = false;

            // This is the case when a table header is received.
            // We set the display value to formattedValue which
            // holds the table 'header'
          } else if (scope.obj.percentageChange === 'header') {

            // When both percentage and value is enabled, We do not
            // show the display value to avoid duplicates as shown below:
            // 'Previous Window (Previous Window)'
            if (scope.vis && scope.vis.params.enableHistDataValueWithPercentage) {
              scope.displayValue = '';
            } else {
              scope.displayValue = scope.obj.formattedValue;
            }
            scope.displayIcon = false;

            // This is the case when there is no data for a
            // particular metric and we set prepare an empty row
            // with all values as 'N.A.'.
          } else if (scope.obj.percentageChange === 'N.A.') {
            scope.displayValue = '';
            scope.displayIcon = false;

          } else {
            scope.displayValue = scope.obj.percentageChange;
            scope.displayIcon = true;
          }
        }
      }
    }
  };
});