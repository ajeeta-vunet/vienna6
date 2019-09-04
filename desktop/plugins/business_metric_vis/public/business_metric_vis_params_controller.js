import utils from '../../../src/core_plugins/console/public/src/utils';
require('ui/courier');
require('plugins/business_metric_vis/directives/metric');
require('ui/directives/business_metric_threshold');
require('plugins/business_metric_vis/directives/historical_data.js');
require('plugins/business_metric_vis/directives/action_buttons_data.js');
require('plugins/business_metric_vis/directives/aggregations.js');

import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
module.controller('BusinessMetricVisParamsController', function ($scope, $rootScope, courier, savedSearches, $filter, Private) {

  $scope.operMetricsList = [];
  $scope.historicalDataEnabled = false;
  $scope.actionButtonsEnabled = false;
  $scope.indexFields = [];
  $scope.savedSearchIds = [];
  $scope.indexPatternIds = [];

  // If the BMV is built based on the index then the saved search for that BMV should be empty
  const defaultSavedSearch = {
    id: '',
    title: '',
  };

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
      // The data we load into the multiselect dropdown should be in dict format.
      // The allFields will have all the fields for the selected index/saved search
      // like [{name: system.memory.used.pct}, {name: system.mmory.total}...]
      $scope.operMetricsList[curIndex].allFields = [];
      // Populate the addtional field also with the same list
      const additionalFields = fields.slice(0);
      for (let index = 0; index < additionalFields.length; index++) {
        $scope.operMetricsList[curIndex].allFields.push({ name: additionalFields[index].name });
      }
    });

    // set the default trend color for the metric.
    if (!($scope.vis.params.metrics[curIndex] &&
      $scope.vis.params.metrics[curIndex].upTrendColor)) {
      $scope.vis.params.metrics[curIndex].upTrendColor = 'green';
    }
  };

  // When we select a saved search we set the correponding index for the
  // saved search as selected in the index field in the background.
  // Get the id for the selected saved search
  // curIndex - Index position of the selected metric
  $scope.setSavedSearch = function (curIndex) {
    const savedSearchID = $scope.vis.params.metrics[curIndex].savedSearch.id;
    // Get the saved search details by passing the id
    savedSearches.get(savedSearchID).then(function (savedSearchobj) {
      // Get the saved search source
      $scope.searchSource = savedSearchobj.searchSource;
      // Get the underlying index, title
      const id = $scope.searchSource.get('index').id;
      // Get the correspoding index for the selected saved search
      // and set it to the index dropdown list
      const indexPattern = {
        id: id,
        title: $scope.searchSource.get('index').title,
      };
      $scope.vis.params.metrics[curIndex].index = indexPattern;
      $scope.setIndexPattern(curIndex);
    });
  };

  // Set the default item in the index and saved search
  // based on selection of saved search checkbox.
  // curIndex - Index position of the selected metric
  $scope.setDefaultSavedSearch  = function (curIndex) {
    // When the user unchecks the "saved search" option
    // set the first item again as selected.
    if ($scope.vis.params.metrics[curIndex].showSavedSearch === false) {
      $scope.vis.params.metrics[curIndex].index = $scope.indexPatternIds[0];
      $scope.setIndexPattern(curIndex);
      $scope.vis.params.metrics[curIndex].savedSearch = defaultSavedSearch;
    }
    else {
      $scope.vis.params.metrics[curIndex].savedSearch = $scope.savedSearchIds[0];
      $scope.setSavedSearch(curIndex);
    }
  };

  $scope.togglehistoricalData = function () {
    $scope.vis.params.historicalData = [];
  };
  $scope.toggleActionButtonsData = function () {
    $scope.vis.params.actionButtonsData = [];
  };


  // This function gets called for each metric
  function initMetric(bmIndex) {
    if (!($scope.vis.params.metrics[bmIndex] && $scope.vis.params.metrics[bmIndex].index)) {
      $scope.vis.params.metrics[bmIndex].index = $scope.indexPatternIds[0];
      $scope.vis.params.metrics[bmIndex].savedSearch = defaultSavedSearch;
    }
    $scope.setIndexPattern(bmIndex);
  }

  // This will execute once. Get all the available saved search.
  // We are also passing "allowedRolesJSON" to get only the saved search the user is having access.
  Promise.resolve(utils.getSavedObject('search', ['title', 'allowedRolesJSON'], 10000, Private))
    .then(function (response) {
      $scope.savedSearchIds = response;
    });

  // This will execute once get all the available index patterns
  Promise.resolve(utils.getSavedObject('index-pattern', ['title'], 10000, Private))
    .then(function (response) {
      $scope.indexPatternIds = response;

      // for edit
      // check if metrics exists loop through to populate
      if ($scope.vis.params.metrics) {
        const bmLength = $scope.vis.params.metrics.length;

        //if action buttons have data
        if ($scope.vis.params.actionButtonsData && $scope.vis.params.actionButtonsData.length) {
          $scope.actionButtonsEnabled = true;
        }

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
