require('ui/courier');

const app = require('ui/modules').get('kibana', [
  'kibana/courier'
]);

app.directive('vudataMetricColorSchema', function () {
  return {
    restrict: 'E',
    scope: {
      metricType: '=',
      colorSchema: '=',
      indexFields: '=',
      field: '='
    },
    template: require('ui/partials/business_metric_color_schema.html'),
    link: function (scope) {

      // Initialize the flags to display
      // color schema configuration fields.
      scope.showMatch = false;
      scope.showMinMax = false;

      // This function gets called when user
      // enables or disables the interval option
      // in color schema config form.
      scope.toggleInterval = function () {
        scope.interval = '';
        scope.intervalUnit = '';
      };

      // This function is called when a user clicks to add a new colorSchema
      scope.addColorSchema = function () {
        scope.editIndex = -1;
        scope.min = '';
        scope.max = '';
        scope.match = '';
        scope.color = '';
        scope.metric = '';
        scope.minError = '';
        scope.maxError = '';
        scope.matchError = '';
        scope.colorError = '';
        scope.intervalEnabled = false;
        scope.interval = '';
        scope.intervalUnit = '';
        scope.addingColorSchema = true;
      };

      // This function is called to validate the user input. This validates the
      // ranges
      function validate(colorSchema) {
        const { interval, intervalUnit, match, min, max, color } = scope;
        // Display 'min' and 'max' if metric type selected is 'Unique count', 'count'
        // or if field type is 'number'.
        if (scope.isMetricValueNumber()) {
          scope.minError = min || (min === 0) ? '' :  'Min is required.';
          scope.maxError = max || (max === 0) ? '' : 'Max is required.';
          scope.matchError = '';
          if (!scope.minError && !scope.maxError) {
            if (max < min || max === min) {
              scope.maxError = 'Max should be greater than min.';
            }
          }
        }
        else {
          scope.matchError = match.length > 0 ? '' :  'Match is required.';
          scope.minError = '';
          scope.maxError = '';
        }

        scope.colorError = color ? '' : 'Color is required.';
        if (color) {
          if (!/(^#[0-9a-fA-F]{6}$)|(^#[0-9a-fA-F]{3}$)/i.test(color)) {
            scope.colorError = 'Color should be valid hexadecimal color representation.';
          }
        }

        // Display 'min' and 'max' if metric type selected is 'Unique count', 'count'
        // or if field type is 'number'.
        if (scope.isMetricValueNumber()) {
          if (!scope.minError && !scope.maxError) {
            const noOverlap = colorSchema.every(colorRange => {
              const linterval = colorRange.interval;
              const lintervalUnit = colorRange.intervalUnit;
              const lmin = colorRange.min;
              const lmax = colorRange.max;

              // We are here means, the field entries are same. Compare
              // the other values
              if ((interval === linterval) &&
                  (intervalUnit === lintervalUnit)) {
                if ((min >= lmin) && (min <= lmax)) {
                  return false;
                }
                if ((max >= lmin) && (max <= lmax)) {
                  return false;
                }
                if ((min < lmin) && (max > lmax)) {
                  return false;
                }
              }
              return true;
            });
            if (!noOverlap) {
              scope.maxError = 'The range specified overlaps with another range.';
            }
          }
        }
        else {
          if (!scope.matchError) {
            const noOverlap = colorSchema.every(colorRange => {
              const lmatch = colorRange.match;

              // Check if 'match' value is same as the current 'match'
              // value we are trying to insert
              if (match === lmatch) {
                return false;
              }
              return true;
            });
            if (!noOverlap) {
              scope.matchError = 'The match value is already specified.';
            }
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
            scope.isNumberField()) {
          return true;
        }
        return false;
      };

      // This function is called when a range is being added. It first invokes
      // validate function and if things are fine, push the colorSchema
      scope.addRange = function () {
        validate(scope.colorSchema);
        if (!scope.minError && !scope.maxError && !scope.colorError && !scope.matchError) {
          const { match, min, max, color } = scope;
          let { interval, intervalUnit } = scope;
          if (scope.intervalEnabled === false) {
            interval = '';
            intervalUnit = '';
          }
          scope.colorSchema.push({
            interval,
            intervalUnit,
            match,
            min,
            max,
            color
          });
          scope.addingColorSchema = false;
        }
      };

      // This function is called when a user wants to edit an existing
      // colorSchema
      scope.editRange = function (colorRange, index) {
        if (index !== -1) {

          // if intervalUnit is configured,
          // populate the interval and intervalUnit
          // with interval checkbox ticked
          if (colorRange.intervalUnit !== '') {
            scope.intervalEnabled = true;
          }
          else {
            scope.intervalEnabled = false;
          }
          scope.editIndex = index;
          scope.metric = colorRange.metric;
          scope.interval = colorRange.interval;
          scope.intervalUnit = colorRange.intervalUnit;
          scope.match = colorRange.match;
          scope.min = colorRange.min;
          scope.max = colorRange.max;
          scope.color = colorRange.color;
          scope.matchError = '';
          scope.minError = '';
          scope.maxError = '';
          scope.colorError = '';
        }
      };

      // This function is called when a user wants to update an existing
      // colorSchema.
      scope.updateRange = function () {
        const { interval, intervalUnit, match, min, max, color, editIndex } = scope;
        const colorSchema = scope.colorSchema.slice() || [];
        colorSchema.splice(editIndex, 1);
        validate(colorSchema);
        if (!scope.minError && !scope.maxError && !scope.colorError && !scope.matchError) {
          scope.colorSchema[editIndex] = {
            interval,
            intervalUnit,
            match,
            min,
            max,
            color
          };
          scope.editIndex = -1;
          scope.addingColorSchema = false;
        }
      };

      // This is called when a edit is cancelled.
      scope.cancelEdit = function () {
        scope.editIndex = -1;
        scope.match = '';
        scope.min = '';
        scope.max = '';
        scope.color = '';
        scope.matchError = '';
        scope.minError = '';
        scope.maxError = '';
        scope.colorError = '';
        scope.interval = '';
        scope.intervalUnit = '';
        scope.addingColorSchema = false;
      };

      // This is called when a colorSchema is deleted.
      scope.deleteRange = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          scope.colorSchema.splice(index, 1);
        }
      };

      // This function sets flags to display attributes for color schema.
      // when metric type selected is cardinality, count or any other with
      // field object of type number, It sets flag to display 'min' and 'max'
      // else the color schema configuration fields are shown based on field
      // type.
      scope.showAttrsBasedOnMetricType = function () {
        if (scope.isMetricValueNumber()) {
          scope.showMatch = false;
          scope.showMinMax = true;
        } else {
          scope.showMatch = true;
          scope.showMinMax = false;
        }
      };

      // Watch for changes in metric type or field type to
      // update the color schema configuration fields.
      scope.$watchMulti(['metricType', 'field'], function () {
        scope.showAttrsBasedOnMetricType();
      });
    }
  };
});
