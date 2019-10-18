require('../directives/insight_metric_list_directive.js');
require('ui/courier');

import { uiModules } from 'ui/modules';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { getBusinessMetricList } from 'ui/utils/business_metric_list.js';

const _ = require('lodash');
const module = uiModules.get('kibana');

// This directive is used to create configure a list of bmv.
// This takes the following parameters:
// bmv: List of bmv objects which the user can configure.

module.directive('insightMetricList', function (courier, $filter, Private, savedVisualizations) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      bmv: '='
    },
    template: require('./insight_metric_list_directive.html'),
    link: function (scope) {

      const savedObjectsClient = Private(SavedObjectsClientProvider);

      // Gets the list of all business metric visualization configured.
      getBusinessMetricList(savedObjectsClient).then(function (data) {
        scope.totalBmvList = data;
      });

      scope.opts = {
        name: '',
        metricList: []
      };

      // Initialize scope.editIndex
      scope.editIndex = -1;

      // To open the metric form
      scope.openMetricForm = function () {
        scope.addMetricFlag = true;
      };

      // Resets the values.
      scope.reset = function () {
        scope.opts.name = '';
        scope.opts.metricList = [];
        scope.editIndex = -1;
      };

      // This is to add the metric
      scope.addMetric = function () {

        const { name, metricList } = scope.opts;
        const bmv = { name, metricList };

        // When edit is updating
        if (scope.editIndex !== -1) {
          scope.bmv[scope.editIndex] = bmv;
        } else {
          scope.bmv.push(bmv);
        }

        scope.addMetricFlag = false;
        scope.reset();
      };

      //This used to set the metricList for a selected BMV
      scope.setMetricList = function (id) {
        const metricList = [];
        if (id !== '') {
          savedVisualizations.get(id).then(function (savedVisualization) {
            const savedMetrics = savedVisualization.visState.params.metrics;
            _.each(savedMetrics, (metric) => {
              metricList.push(metric.label);
            });
            scope.opts.metricList = metricList;
          });
        }
      };

      // This is called when an edit is cancelled.
      scope.cancelEdit = function () {
        scope.reset();
        scope.addMetricFlag = false;
        scope.editIndex = -1;
      };

      // Delete one of the metric configured.
      scope.deleteMetric = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          if (index !== -1) {
            scope.bmv.splice(index, 1);
          }
        }
      };

      // This function is called when a user
      // wants to edit an existing metric.
      scope.editMetric = function (index) {
        if (index !== -1) {
          const bmv = scope.bmv[index];
          scope.editIndex = index;
          scope.opts.name = bmv.name;
          scope.opts.metricList = bmv.metricList;
        }
      };

    }
  };
});
