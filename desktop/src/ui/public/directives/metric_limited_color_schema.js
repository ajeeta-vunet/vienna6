const module = require('ui/modules').get('kibana');

// This directive is used to create a limited color schema configuration.
// This takes the following parameters:
// visObj:      Visualization object holding all the details of vis.
// metricList:  An optional parameter which contains metric names.
module.directive('metricLimitedColorSchema', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      visObj: '=',
      metricList: '=?'
    },
    template: require('ui/partials/metric_limited_color_schema.html'),
    link: function (scope) {

      // set the flag 'showInputFieldForMetric' based on
      // data in 'metricList' parameter received.
      scope.showInputFieldForMetric = false;
      if(scope.metricList === undefined) {
        scope.showInputFieldForMetric = true;
      }

      // Initializing colorSchema
      scope.editIndex = -1;
      scope.min = '';
      scope.max = '';
      scope.color = '';
      scope.metric = '';
      scope.minError = '';
      scope.maxError = '';
      scope.colorError = '';

      // This function is called to validate the user input. This validates the
      // ranges
      function validate(colorSchema) {
        const min = scope.min;
        const max = scope.max;
        const metric = scope.metric;
        scope.minError = min || (min === 0) ? '' :  'Min is required.';
        scope.maxError = max || (max === 0) ? '' : 'Max is required.';

        if (!scope.minError && !scope.maxError) {
          if (max < min) {
            scope.maxError = 'Max should be greater than min.';
          }
          const noOverlap = colorSchema.every(colorRange => {
            const lmetric = colorRange.metric;
            const lmin = colorRange.min;
            const lmax = colorRange.max;
            if (metric === lmetric) {
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

      // This function is called when a range is being added. It first invokes
      // validate function and if things are fine, push the colorSchema
      scope.addRange = function () {
        const params = scope.visObj.params;
        validate(params.colorSchema);
        if (!scope.minError && !scope.maxError && !scope.colorError) {
          const min = scope.min;
          const max = scope.max;
          const color = scope.color;
          const metric = scope.metric;
          params.colorSchema.push({
            min,
            max,
            color,
            metric
          });
        }
      };

      // This function is called when a user wants to edit an existing
      // colorSchema
      scope.editRange = function (colorRange, index) {
        scope.editIndex = index;
        scope.min = colorRange.min;
        scope.max = colorRange.max;
        scope.color = colorRange.color;
        scope.metric = colorRange.metric;
        scope.minError = '';
        scope.maxError = '';
        scope.colorError = '';
      };

      // This function is called when a user wants to update an existing
      // colorSchema.
      scope.updateRange = function () {
        // const { min, max, color, editIndex } = $scope;
        const min = scope.min;
        const max = scope.max;
        const color = scope.color;
        const metric = scope.metric;
        const editIndex = scope.editIndex;
        const params = scope.visObj.params;
        const colorSchema = params.colorSchema.slice();
        colorSchema.splice(editIndex, 1);
        validate(colorSchema);
        if (!scope.minError && !scope.maxError && !scope.colorError) {
          params.colorSchema[editIndex] = {
            min,
            max,
            color,
            metric
          };
          scope.editIndex = -1;
        }
      };

      // This is called when a colorSchema is deleted..
      scope.deleteRange = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          const params = scope.visObj.params;
          params.colorSchema.splice(index, 1);
        }
      };
    }
  };
});

