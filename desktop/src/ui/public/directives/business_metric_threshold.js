require('ui/courier');

const app = require('ui/modules').get('kibana', [
  'kibana/courier'
]);

app.directive('vudataMetricThreshold', function () {
  return {
    restrict: 'E',
    scope: {
      metricType: '=',
      threshold: '=',
      indexFields: '=',
      field: '='
    },
    template: require('ui/partials/business_metric_threshold.html'),
    link: function (scope) {

      // Initialize the flags to display
      // threshold configuration fields.
      scope.showStr = false;
      scope.showNum = false;

      // This function gets called when user
      // enables or disables the interval option
      // in threshold config form.
      scope.toggleInterval = function () {
        scope.interval = '';
        scope.intervalUnit = '';
      };

      // This function is called when a user clicks to add a new threshold
      scope.addThreshold = function () {
        scope.editIndex = -1;
        scope.comparison = '';
        scope.value = '';
        scope.valueMin = '';
        scope.valueStr = '';
        scope.color = '';
        scope.insights = '';
        scope.metric = '';
        scope.valueMinError = '';
        scope.valueMaxError = '';
        scope.valueError = '';
        scope.valueStrError = '';
        scope.colorError = '';
        scope.intervalEnabled = false;
        scope.interval = '';
        scope.intervalUnit = '';
        scope.addingThreshold = true;
        scope.severity = 'None';
      };

      // This function is called to validate the user input. This validates the
      // ranges
      function validate() {
        const { comparison, valueStr, valueMin, value, color } = scope;
        // Display 'min' and 'max' if metric type selected is 'Unique count', 'count'
        // or if field type is 'number'.
        if (scope.isMetricValueNumber()) {
          if (comparison === 'Range') {
            scope.valueMinError = valueMin || (valueMin === 0) ? '' :  'Min Value is required.';
            scope.valueMaxError = value || (value === 0) ? '' :  'Max Value is required.';
            if (!scope.valueMinError && !scope.valueMaxError) {
              if (value < valueMin || value === valueMin) {
                scope.valueMaxError = 'Max value should be greater than min.';
              }
	    }
            scope.valueError = '';
          }
          else {
            scope.valueError = value || (value === 0) ? '' : 'Value is required.';
            scope.valueMinError = '';
            scope.valueMaxError = '';
          }
          scope.valueStrError = '';
        }
        else {
          scope.valueStrError = valueStr.length > 0 ? '' :  'String value is required.';
          scope.valueMinError = '';
          scope.valueMaxError = '';
          scope.valueError = '';
        }

        scope.colorError = color ? '' : 'Color is required.';
        if (color) {
          if (!/(^#[0-9a-fA-F]{6}$)|(^#[0-9a-fA-F]{3}$)/i.test(color)) {
            scope.colorError = 'Color should be valid hexadecimal color representation.';
          }
        }
      }

      // This function checks if field type is string.
      scope.isStringField = function () {
        if (scope.field && scope.field.type === 'string') {
          return true;
        }
        return false;
      };

      // This function checks if field type is number.
      scope.isNumberField = function () {
        if (scope.field && scope.field.type === 'number') {
          return true;
        }
        return false;
      };

      // This function returns true if field type is number
      // and metric type is 'cardinality' or 'count'.
      scope.isMetricValueNumber = function () {
        if (scope.metricType === 'cardinality' ||
            scope.metricType === 'count' ||
            scope.metricType === 'expression' ||
            scope.isNumberField()) {
          return true;
        }
        return false;
      };

      // This function is called when a range is being added. It first invokes
      // validate function and if things are fine, push the threshold
      scope.addEntry = function () {
        validate();
        if (!scope.valueMinError && !scope.valueMaxError && !scope.valueError && !scope.colorError && !scope.valueStrError) {
          const { comparison, valueStr, valueMin, value, color, severity, insights } = scope;
          let { interval, intervalUnit } = scope;
          if (scope.intervalEnabled === false) {
            interval = '';
            intervalUnit = '';
          }
          scope.threshold.push({
            interval,
            intervalUnit,
            comparison,
            valueStr,
            valueMin,
            value,
            color,
            severity,
            insights
          });
          scope.addingThreshold = false;
        }
      };

      // This function is called when a user wants to edit an existing
      // threshold
      scope.editEntry = function (thresholdRange, index) {
        if (index !== -1) {

          // if intervalUnit is configured,
          // populate the interval and intervalUnit
          // with interval checkbox ticked
          if (thresholdRange.intervalUnit !== '') {
            scope.intervalEnabled = true;
          }
          else {
            scope.intervalEnabled = false;
          }
          scope.editIndex = index;
          scope.metric = thresholdRange.metric;
          scope.interval = thresholdRange.interval;
          scope.intervalUnit = thresholdRange.intervalUnit;
          scope.valueStr = thresholdRange.valueStr;
          scope.valueMin = thresholdRange.valueMin;
          scope.value = thresholdRange.value;
          scope.color = thresholdRange.color;
          scope.severity = thresholdRange.severity;
          scope.insights  = thresholdRange.insights;
          scope.comparison = thresholdRange.comparison;
          scope.valueStrError = '';
          scope.valueMinError = '';
          scope.valueMaxError = '';
          scope.valueError = '';
          scope.colorError = '';
        }
      };

      // This function is called when a user wants to update an existing
      // threshold.
      scope.updateEntry = function () {
        const { interval, intervalUnit, comparison, valueStr, valueMin, value, color, severity, insights, editIndex } = scope;
        const threshold = scope.threshold.slice() || [];
        threshold.splice(editIndex, 1);
        validate();
        if (!scope.valueMinError && !scope.valueMaxError && !scope.valueError && !scope.colorError && !scope.valueStrError) {
          scope.threshold[editIndex] = {
            interval,
            intervalUnit,
            comparison,
            valueStr,
            valueMin,
            value,
            color,
            severity,
            insights
          };
          scope.editIndex = -1;
          scope.addingThreshold = false;
        }
      };

      // This is called when a edit is cancelled.
      scope.cancelEdit = function () {
        scope.comparison = '';
        scope.editIndex = -1;
        scope.valueStr = '';
        scope.valueMin = '';
        scope.value = '';
        scope.color = '';
        scope.valueStrError = '';
        scope.valueMinError = '';
        scope.valueMaxError = '';
        scope.valueError = '';
        scope.colorError = '';
        scope.interval = '';
        scope.intervalUnit = '';
        scope.addingThreshold = false;
      };

      // This is called when a threshold is deleted.
      scope.deleteEntry = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          scope.threshold.splice(index, 1);
        }
      };

      // This function sets flags to display attributes for threshold.
      // when metric type selected is cardinality, count or any other with
      // field object of type number, It sets flag to display 'min' and 'max'
      // else the threshold configuration fields are shown based on field
      // type.
      scope.showAttrsBasedOnMetricType = function () {
        if (scope.isMetricValueNumber()) {
          scope.showStr = false;
          scope.showNum = true;
        } else {
          scope.showStr = true;
          scope.showNum = false;
        }
      };

      // Watch for changes in metric type or field type to
      // update the threshold configuration fields.
      scope.$watchMulti(['metricType', 'field'], function () {
        scope.showAttrsBasedOnMetricType();
      });
    }
  };
});
