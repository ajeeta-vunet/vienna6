require('ui/courier');
require('plugins/business_metric_vis/directives/metric');
require('ui/directives/business_metric_color_schema');
require('plugins/business_metric_vis/directives/historical_data.js');
require('plugins/business_metric_vis/directives/aggregations.js');

import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
module.controller('BusinessMetricVisParamsController', function ($scope, $rootScope, courier, $filter, Private) {

  $scope.operMetricsList = [];
  $scope.historicalDataEnabled = false;
  $scope.indexFields = [];

  $scope.search = function () {
    $rootScope.$broadcast('courier:searchRefresh');
  };

  // Delete one of the metric configured.
  $scope.removeMetric = function (index) {
    $scope.vis.params.metrics.splice(index, 1);
    $scope.operMetricsList.splice(index, 1);
  };

  // Add a new metric configuration.
  $scope.addMetric = function () {
    $scope.vis.params.metrics.splice($scope.vis.params.metrics.length, 0, {});
    initMetric($scope.vis.params.metrics.length - 1);
    $scope.operMetricsList.push({ expanded: false });
  };

  // This will move element inside array
  // from old position to new position
  function move(arr, oldIndex, newIndex) {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    $scope.operMetricsList.splice(newIndex, 0, $scope.operMetricsList.splice(oldIndex, 1)[0]);
  }

  // Move a metric one position above the
  // current position.
  $scope.moveUp = function (index) {
    move($scope.vis.params.metrics, index, index - 1);
  };

  // Move a metric one position below the
  // current position.
  $scope.moveDown = function (index) {
    move($scope.vis.params.metrics, index, index + 1);
  };

  // Enable tabular view when aggregations are
  // configured and disable the button to toggle
  // to inline metric view.
  $scope.displayOnlyTabularFormat = function () {
    if ($scope.vis.params &&
      $scope.vis.params.aggregations &&
      $scope.vis.params.aggregations.length > 0) {
      $scope.vis.params.enableTableFormat = true;
      return true;
    }
    else {
      return false;
    }
  };

  // This will set the indexFields with the fields according to the data
  // source selected. It also takes care of grouping the fields
  // according to their types.
  $scope.setIndexPattern = function (curIndex) {
    courier.indexPatterns.get($scope.vis.params.metrics[curIndex].index.id).then(function (data) {
      let fields = data.fields.raw;
      fields = $filter('filter')(fields, { aggregatable: true });
      if (!$scope.operMetricsList[curIndex]) {
        $scope.operMetricsList[curIndex] = {};
      }
      $scope.operMetricsList[curIndex].indexFields = fields.slice(0);
    });

    // set the default trend color for the metric.
    if (!($scope.vis.params.metrics[curIndex] &&
      $scope.vis.params.metrics[curIndex].upTrendColor)) {
      $scope.vis.params.metrics[curIndex].upTrendColor = 'green';
    }
  };

  $scope.togglehistoricalData = function () {
    $scope.vis.params.historicalData = [];
  };

  // This function gets called for each metric
  function initMetric(bmIndex) {
    if (!($scope.vis.params.metrics[bmIndex] && $scope.vis.params.metrics[bmIndex].index)) {
      $scope.vis.params.metrics[bmIndex].index = $scope.indexPatternIds[0];
    }
    $scope.setIndexPattern(bmIndex);
  }

  // This will execute once
  // get all the available index patterns
  $scope.indexPatternIds = [];
  const savedObjectsClient = Private(SavedObjectsClientProvider);
  savedObjectsClient.find({
    type: 'index-pattern',
    fields: ['title'],
    perPage: 10000
  }).then(response => {
    // Create a list of indexPatternIds
    $scope.indexPatternIds = response.savedObjects.map(pattern => {
      const id = pattern.id;
      const indexPattern = {
        id: id,
        title: pattern.get('title'),
      };
      return indexPattern;
    });

    // for edit
    // check if metrics exists loop through to populate
    if ($scope.vis.params.metrics) {
      const bmLength = $scope.vis.params.metrics.length;

      //if historicalData has values
      if ($scope.vis.params.historicalData && $scope. vis.params.historicalData.length) {
        $scope.historicalDataEnabled = true;
      }

      if (!$scope.vis.params.textFontSize) {
        if ($scope.vis.params.fontSize <= 24) {
          $scope.vis.params.textFontSize = $scope.vis.params.fontSize * 70 / 100;
        } else {
          $scope.vis.params.textFontSize = 16;
        }
      }

      for (let metricLength = 0; metricLength < bmLength; metricLength++) {
        initMetric(metricLength);
      }
    } else {
      $scope.operMetricsList.push({ expanded: false, indexFields: undefined });
      $scope.vis.params = {
        metrics: [{}],
        aggregations: []
      };
      //set default font size
      $scope.vis.params.fontSize = 40;
      $scope.vis.params.textFontSize = 16;
      initMetric(0);
    }
  });
});
