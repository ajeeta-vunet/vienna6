import utils from '../../../../src/core_plugins/console/public/src/utils';
const _ = require('lodash');
require('ui/courier');
require('ui/directives/searchable_multiselect');
const app = require('ui/modules').get('kibana/business_metric_vis', ['kibana', 'kibana/courier']);

app.directive('vudataMetric', function () {
  return {
    restrict: 'E',
    scope: {
      metric: '=',
      metricLength: '=',
      indexFields: '=',
      allFields: '=',
      additionalFields: '=',
      addAdditionalFields: '&',
      removeAdditionalFields: '&'
    },
    template: require('plugins/business_metric_vis/directives/metric.html'),
    link: function (scope) {

      scope.selectedFields = [];

      // The selected fields in the "Additional Fields" should be in dict format like {"name" : "host"}
      // But we are storing the selected fields as "host" in saved object. So we need to build the dict format
      // using the value fetched from the saved object.
      if (scope.metric.additionalFields !== '' && scope.metric.additionalFields !== undefined) {
        const additionalFields = scope.metric.additionalFields.split(',');
        for (let index = 0; index < additionalFields.length; index++) {
          scope.selectedFields.push({ name: additionalFields[index] });
        }
      }
      // Add all the flags and functions required
      // to hide / show input components when user interacts
      // with the side bar for business metric visualization.
      scope.opts = {
        optionsEnabled: false,
        thresholdEnabled: false,
        showFields: false,
        showStringFields: false,

        // This will be called when the metric field
        // shown in the select box is changed.
        updateFieldName: function () {
          scope.opts.fieldObj = undefined;
          // Get the field object using the field name
          _.each(scope.indexFields, function (field) {
            if (scope.metric.field === field.name) {
              scope.opts.fieldObj = field;
              scope.metric.fieldType = field.type;
              return;
            }
          });

          // If the metric field of a particular field type is changed to
          // another field type, We reset the threshold. This is done to store
          // color configurations only for a particular field type.
          // A configuration for a 'number' field has (interval, min, max, color).
          // A configuration for a 'string' field has (match, color).
          if (scope.metric.threshold && scope.metric.threshold.length > 0) {
            if (scope.opts.fieldObj.type === 'string' &&
                  scope.metric.type !== 'cardinality' &&
                  scope.metric.threshold[0].max !== '') {
              scope.opts.thresholdEnabled = false;
            }
            if (scope.opts.fieldObj.type === 'number' &&
                  scope.metric.threshold[0].match !== '') {
              scope.opts.thresholdEnabled = false;
            }
          }
        },

        // This function is used to enable or
        // disable threshold configurations.
        toggleThreshold: function () {
          scope.metric.threshold = [];
        },

        // This function is used to hide or show field
        // and field types based on metric type selected.
        updateMetricType: function () {
          // display metric field when metric type is
          // not count.
          if ((scope.metric.type !== 'count') && (scope.metric.type !== 'expression')) {
            scope.opts.showFields = true;
          } else if (scope.metric.type === 'expression') {
            scope.opts.showFields = false;

            // In case of expression, we show the format as 'Number' by
            // default
            if (!scope.metric.format) {
              scope.metric.format = 'number';
            }
          } else {
            scope.opts.showFields = false;
            scope.metric.field = '';
          }

          // selectedFields : Only the selected fields in dict format from the add additional fields
          // additionalFields : Only the selected fields with comma separated values
          // like [system.memory.used,system.memory.total] from the add additional fields
          scope.addAdditionalFields = function (item) {
            scope.selectedFields.push({ name: item.name });
            scope.metric.additionalFields = utils.getValueToStoreInKibana(scope.selectedFields, 'name');
          };

          // Removes the selected field from selectedFields and additionalFields.
          scope.removeAdditionalFields = function (index) {
            scope.selectedFields.splice(index, 1);
            scope.metric.additionalFields = utils.getValueToStoreInKibana(scope.selectedFields, 'name');
          };

          // Reset the threshold fields if 'match'
          // property exists when metric type is changed
          // to cardinality or count.
          if (scope.metric.type === 'cardinality' ||
            scope.metric.type === 'count') {

            // reset the threshold if 'match' field is
            // configured. Unique count always needs 'min'
            // and 'max' fields.
            if (scope.metric.threshold &&
                scope.metric.threshold[0].match !== '') {
              scope.opts.thresholdEnabled = false;
            }
          }

          if ((scope.metric.filter && scope.metric.filter.length !== 0) ||
            (scope.metric.goalLabel && scope.metric.goalLabel.length !== 0)) {
            scope.opts.optionsEnabled = true;
          }

          // Display string fields and number fields for
          // unique count and latest value.
          if (scope.metric.type === 'cardinality' ||
            scope.metric.type === 'latest') {
            scope.opts.showStringFields = true;
          }
          else {
            scope.opts.showStringFields = false;
          }
        }
      };

      // If metric field name exists, get the field
      // object in scope.opts.
      if (scope.metric.field) {
        scope.$watch('indexFields', function () {
          _.each(scope.indexFields, function (field) {
            if (scope.metric.field === field.name) {
              scope.opts.fieldObj = field;
              return;
            }
          });
        });
      }

      // Watch the metric to hide / show the input box for field
      // when metric is moved up or down the order.
      scope.$watch('metric', function () {
        scope.opts.updateMetricType();
      });

      // If metric type selected is not count
      // always display the metric field component
      if (scope.metric.type !== 'count') {
        scope.opts.showFields = true;
      }

      // Check if any values under 'options' section is populated to
      // show the options checkbox checked and display all the input elements
      // under it.
      if ((scope.metric.filter && scope.metric.filter.length !== 0) ||
        (scope.metric.goalLabel && scope.metric.goalLabel.length !== 0)) {
        scope.opts.optionsEnabled = true;
      }

      // If threshold is configured, Enable the checkbox and show the
      // section.
      if (scope.metric.threshold && scope.metric.threshold.length !== 0) {
        scope.opts.thresholdEnabled = true;
        scope.opts.optionsEnabled = true;
      }
    }
  };
});

