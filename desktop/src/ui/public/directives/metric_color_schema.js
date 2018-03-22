import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana');
import metricColorSchemaTemplate from 'ui/partials/metric_color_schema.html';
import fieldMetricColorSchemaTemplate from 'ui/partials/field_metric_color_schema.html';

// This directive is used to create schema configuration.
// This takes the following parameters:
// visObj:      Visualization object holding all the details of vis.
module.directive('metricColorSchema', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      visObj: '=',
      metricList: '=?',
      fieldSpecified: '='
    },
    template: function (tElement, attrs) {
      if(attrs.fieldSpecified === 'true') {
        return fieldMetricColorSchemaTemplate;
      } else {
        return metricColorSchemaTemplate;
      }
    },
    link: function (scope) {

      // This function is called to validate the user input. This validates the
      // ranges
      function validate(colorSchema) {
        const { field, match, min, max, color } = scope;

        // For the non-string fields
        if (!scope.isStringField(field)) {

          // Validate Min
          scope.minError = min || (min === 0) ? '' : 'Min is required.';

          //Validate Max
          scope.maxError = max || (max === 0) ? '' : 'Max is required.';

          // No Match field for non-string fields. So make matchError empty.
          scope.matchError = '';

          if (!scope.minError && !scope.maxError) {

            // Validate Min is less than Max
            if (max < min || max === min) {
              scope.maxError = 'Max should be greater than min.';
            }

            // Validate the range overlap
            if (!noOverlap(scope, colorSchema)) {
              scope.maxError = 'The range specified overlaps with another range.';
            }
          }
        } else {

          // For the String fields validate the match
          scope.matchError = match.length > 0 ? '' :  'Match is required.';

          // No Min for String field. So make minError empty.
          scope.minError = '';

          // No Max for String field. So make maxError empty.
          scope.maxError = '';

          // Validate existing Match
          if (!scope.matchError) {
            if (!noOverlap(scope, colorSchema)) {
              scope.matchError = 'The match value is already specified.';
            }
          }
        }

        // Validate Color
        scope.colorError = color ? '' : 'Color is required.';
        if (color) {
          if (!/(^#[0-9a-fA-F]{6}$)|(^#[0-9a-fA-F]{3}$)/i.test(color)) {
            scope.colorError = 'Color should be valid hexadecimal color representation.';
          }
        }
      }

      // This function is used to validate the range overlaps. For the non-string
      // fields, the min / max range should not overlap with the other color schema.
      // For the string fields the match of a colorSchema should not overlap with
      // the other colorSchema.
      function noOverlap(scope, colorSchema) {
        const { interval, customInterval, customIntervalType, field, match, min, max, fieldSpecified } = scope;
        return colorSchema.every(colorRange => {
          const linterval = colorRange.interval;
          const lcustInterval = colorRange.customInterval;
          const lcustIntervalType = colorRange.customIntervalType;
          const lfield = colorRange.field;
          const lmin = colorRange.min;
          const lmax = colorRange.max;
          const lmatch = colorRange.match;

          // When the field is specified then check the both fields.
          if (fieldSpecified && (lfield && !field) || (!lfield && field)) {
            return true;
          }

          // We are here means, fields are non-empty and can be compared
          if (fieldSpecified && (field && lfield) && field.name !== lfield.name) {
            return true;
          }

          // For the non-string fields check the min / max range.
          if (!scope.isStringField(field)) {
            // We are here means, the field entries are same. Compare
            // the other values
            if (!fieldSpecified || ((interval === linterval) && (customInterval === lcustInterval) &&
            (customIntervalType === lcustIntervalType))) {
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
          } else {
            // For the staring fields, check the match field
            if ((field.name === lfield.name) && (match === lmatch)) {
              return false;
            }
          }

          return true;
        });
      }
      // This function is called when a user wants to edit an existing
      // colorSchema
      scope.editRange = function (index) {

        const params = scope.visObj.params;

        if (index !== -1) {
          const colorRange = params.colorSchema[index];
          scope.editIndex = index;
          if (colorRange.field) {
            scope.field = scope.visObj.indexPattern.fields.byName[colorRange.field.name];
          } else {
            scope.field = '';
          }
          scope.interval = colorRange.interval;
          scope.customInterval = colorRange.customInterval;
          scope.customIntervalType = colorRange.customIntervalType;
          scope.match = colorRange.match;
          scope.min = colorRange.min;
          scope.max = colorRange.max;
          scope.color = colorRange.color;
          scope.minError = '';
          scope.maxError = '';
          scope.colorError = '';
        }
      };

      // This function is called when a user wants to add a colorSchema or
      // update an existing colorSchema.
      scope.addOrUpdateRange = function () {
        const editIndex = scope.editIndex;
        const params = scope.visObj.params;
        let colorSchema;
        if(editIndex > -1) {
          colorSchema = params.colorSchema.slice();
          colorSchema.splice(editIndex, 1);
        } else {
          colorSchema = params.colorSchema;
        }
        validate(colorSchema);
        if(scope.fieldSpecified) {
          if (!scope.minError && !scope.maxError && !scope.colorError && !scope.matchError) {
            const { interval, customInterval, customIntervalType, field, match, min, max, color } = scope;
            const colorSchemaEntry = {
              interval,
              customInterval,
              customIntervalType,
              field,
              match,
              min,
              max,
              color
            };
            if(editIndex > -1) {
              params.colorSchema[editIndex] = colorSchemaEntry;
              scope.editIndex = -1;
            } else {
              params.colorSchema.push(colorSchemaEntry);
            }
          }
        } else {
          if (!scope.minError && !scope.maxError && !scope.colorError) {
            const { min, max, color } = scope;
            const colorSchemaEntry = {
              min,
              max,
              color
            };
            if(editIndex > -1) {
              params.colorSchema[editIndex] = colorSchemaEntry;
              scope.editIndex = -1;
            } else {
              params.colorSchema.push(colorSchemaEntry);
            }
          }
        }
      };

      scope.cancelEdit = function () {
        scope.editIndex = -1;
        scope.field = '';
        scope.match = '';
        scope.min = '';
        scope.max = '';
        scope.color = '';
        scope.matchError = '';
        scope.minError = '';
        scope.maxError = '';
        scope.colorError = '';
        scope.interval = '';
        scope.customInterval = '';
        scope.customIntervalType = '';
      };

      // This is called when a colorSchema is deleted..
      scope.deleteRange = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          const params = scope.visObj.params;
          if (index !== -1) {
            params.colorSchema.splice(index, 1);
          }
        }
      };

      scope.isStringField = function (field) {
        if (field && field.type === 'string') {
          return true;
        }
        return false;
      };

      scope.isNumberField = function (field) {
        if (field && field.type === 'number') {
          return true;
        }
        return false;
      };

      scope.getIntervalStr = function (colorRange) {
        if (colorRange.interval === 'custom') {
          return colorRange.customInterval.toString() + colorRange.customIntervalType;
        } else {
          return colorRange.interval;
        }
      };

      scope.isIntervalRequired = function () {
        let countOrUniqueCountMetricFound = false;
        scope.visObj.aggs.forEach(function (agg) {
          // When table visualization is just created and aggregation is
          // yet to be added, agg.type is still 'undefined'. Hence the
          // check for agg.type
          if (agg.type && (agg.type.title === 'Count' || agg.type.title === 'Unique Count')) {
            countOrUniqueCountMetricFound = true;
          }
        });
        return countOrUniqueCountMetricFound;
      };

      scope.fieldChanged = function (field) {
        if (field && field !== '') {
          // If we are setting a string field,
          // reset the min and max
          if (scope.isStringField(field)) {
            scope.min = '';
            scope.max = '';
          } else if (scope.isNumberField(field)) {
            // If we are setting a number field,
            // reset the match
            scope.match = '';
          }
        } else {
          scope.match = '';
        }
      };

    }
  };
});
