require('ui/courier');
const app = require('ui/modules').get('kibana/business_metric_vis', ['kibana', 'kibana/courier']);

// This will handle the configuration for time shifts in business metric vis
app.directive('historicalData', function () {
  return {
    restrict: 'E',
    scope: {
      historicalData: '=',
      intervalOptions: '=',
    },
    template: require('plugins/business_metric_vis/directives/historical_data.html'),
    link: function (scope) {

      // Initializing the options for historical data type.
      scope.historicalDataTypeOptions = ['Time shift',
        'Interval'];

      // Initializing the options for timeshift metric
      scope.timeshiftOptions = ['Previous Window',
        'Same Time Previous Day',
        'Same Time Day Before Previous Day',
        'Same Time Previous Week',
        'Same Time Previous Month',
        'Same Time Previous Year',
        'Custom configuration'
      ];

      // This function will be called when the
      // historical data type is changed.
      scope.resetHistoricalDataType = function () {
        scope.label = '';
        scope.timeshiftMetric = '';
        scope.intervalMetric = '';
        scope.shiftUnit = '';
        scope.shiftValue = '';
      };

      // This function is called when a user wants to add a new
      // historical data metric
      scope.addhistoricalDataMetric = function () {
        scope.editIndex = -1;
        scope.type = '';
        scope.label = '';
        scope.timeshiftMetric = '';
        scope.intervalMetric = '';
        scope.shiftUnit = '';
        scope.shiftValue = '';
        scope.addingHistoricalData = true;
      };

      // This function is called when a historical data
      // config is being added.
      scope.addConfig = function () {
        const { type, label, timeshiftMetric, intervalMetric,
          shiftUnit, shiftValue } = scope;
        scope.historicalData.push({
          type,
          label,
          timeshiftMetric,
          intervalMetric,
          shiftUnit,
          shiftValue
        });
        scope.addingHistoricalData = false;
      };

      // This function is called when a user wants to edit an existing
      // historical data config.
      scope.editConfig = function (config, index) {
        if (index !== -1) {
          scope.editIndex = index;
          scope.type = config.type;
          scope.label = config.label;
          scope.timeshiftMetric = config.timeshiftMetric;
          scope.intervalMetric = config.intervalMetric;
          scope.shiftUnit = config.shiftUnit;
          scope.shiftValue = config.shiftValue;
        }
      };

      // This function is called when a user wants to cancel adding an
      // historical data config.
      scope.cancelEdit = function () {
        scope.editIndex = -1;
        scope.type = '';
        scope.label = '';
        scope.timeshiftMetric = '';
        scope.intervalMetric = '';
        scope.shiftUnit = '';
        scope.shiftValue = '';
        scope.addingHistoricalData = false;
      };

      // This function is called when a user wants to update an existing
      // historical data config.
      scope.updateConfig = function () {
        const { type, label, timeshiftMetric, intervalMetric,
          shiftUnit, shiftValue, editIndex } = scope;
        const config = scope.historicalData.slice() || [];
        config.splice(editIndex, 1);
        scope.historicalData[editIndex] = {
          type,
          label,
          timeshiftMetric,
          intervalMetric,
          shiftUnit,
          shiftValue
        };
        scope.editIndex = -1;
        scope.addingHistoricalData = false;
      };

      // This is called when a historical data config is deleted.
      scope.deleteConfig = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          scope.historicalData.splice(index, 1);
        }
      };
    }
  };
});