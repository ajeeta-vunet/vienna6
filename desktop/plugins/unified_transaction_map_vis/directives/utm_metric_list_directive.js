import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana');

// This directive is used to perform operation
// on metric list: add, edit and delete.
// We are passing metric placement value as Down to the back end always.
// As of now we are not supporting this option in the front end.
// This option will support in next phase to display metric below
// or above of the node or link.
module.directive('utmMetricList', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      visParams: '=',
      bmvList: '=',
    },
    template: require('./utm_metric_list_directive.html'),
    link: function (scope) {

      scope.opts = {
        name: '',
        placement: 'Down',
        onHover: ''
      };

      // Initialize scope.editIndex
      scope.editIndex = -1;

      // To open the metric form
      scope.openMetricForm = function () {
        scope.addMetricFlag = true;
      };

      // Delete one of the metric configured.
      scope.deleteMetric = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          const params = scope.visParams;
          if (index !== -1) {
            params.metrics.splice(index, 1);
          }
        }
      };

      // This function is called when a user
      //  wants to edit an existing metric.
      scope.editMetric = function (index) {

        const params = scope.visParams;

        if (index !== -1) {
          const metric = params.metrics[index];
          scope.editIndex = index;
          scope.opts.name = metric.name;
          scope.opts.onHover = metric.onHover;
        }
      };

      // Resets the values.
      scope.reset = function () {
        scope.opts.name = '';
        scope.opts.onHover = '';
        scope.editIndex = -1;
      };


      // This is to add the metric
      scope.addMetric = function () {

        // Initialize scope.visParams.metrics to empty list.
        // when metrics has not configured.
        if (scope.visParams.metrics === undefined) {
          scope.visParams.metrics = [];
        }

        const { name, placement, onHover } = scope.opts;
        const metricList = { name, placement, onHover };

        // When edit is updating
        if (scope.editIndex !== -1) {
          scope.visParams.metrics[scope.editIndex] = metricList;
        } else {
          scope.visParams.metrics.push(metricList);
        }

        scope.addMetricFlag = false;
        scope.reset();
      };

      // This is called when an edit is cancelled.
      scope.cancelEdit = function () {
        scope.reset();
        scope.addMetricFlag = false;
        scope.editIndex = -1;
      };
    }
  };
});
