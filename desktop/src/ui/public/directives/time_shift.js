require('ui/courier');

const app = require('ui/modules').get('kibana', [
  'kibana/courier'
]);

// This will handle the configuration for time shifts in business metric vis
app.directive('timeShiftMetric', function () {
  return {
    restrict: 'E',
    scope: {
      timeShift: '=',
    },
    template: require('ui/partials/time_shift.html'),
    link: function (scope) {

      // This function is called when a user wants to add a new
      // timeshift metric.
      scope.addtimeShift = function () {
        scope.editIndex = -1;
        scope.label = '';
        scope.value = '';
        scope.unit = '';
        scope.addingtimeShift = true;
      };

      // This function is called when a time shift config is being added.
      scope.addConfig = function () {
        const { label, value, unit } = scope;
        scope.timeShift.push({
          label,
          value,
          unit
        });
        scope.addingtimeShift = false;
      };

      // This function is called when a user wants to edit an existing
      // time shift config.
      scope.editConfig = function (config, index) {
        if (index !== -1) {
          scope.editIndex = index;
          scope.label = config.label;
          scope.value = config.value;
          scope.unit =  config.unit;
        }
      };

      // This function is called when a user wants to cancel adding an
      // timeshift config.
      scope.cancelEdit = function () {
        scope.editIndex = -1;
        scope.label = '';
        scope.value = '';
        scope.unit = '';
        scope.addingtimeShift = false;
      };

      // This function is called when a user wants to update an existing
      // time shift config.
      scope.updateConfig = function () {
        const { label, value, unit, editIndex } = scope;
        const config = scope.timeShift.slice() || [];
        config.splice(editIndex, 1);
        scope.timeShift[editIndex] = {
          label,
          value,
          unit
        };
        scope.editIndex = -1;
        scope.addingtimeShift = false;
      };

      // This is called when a time shift config is deleted.
      scope.deleteConfig = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          scope.timeShift.splice(index, 1);
        }
      };
    }
  };
});
