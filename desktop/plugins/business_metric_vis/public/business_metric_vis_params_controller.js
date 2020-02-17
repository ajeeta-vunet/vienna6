require('ui/courier');
require('plugins/business_metric_vis/directives/metric');
require('ui/directives/business_metric_threshold');
require('plugins/business_metric_vis/directives/historical_data.js');
require('plugins/business_metric_vis/directives/action_buttons_data.js');
require('plugins/business_metric_vis/directives/aggregations.js');

import { uiModules } from 'ui/modules';
import { getSavedObject } from 'ui/utils/kibana_object.js';

const _ = require('lodash');
const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
module.controller('BusinessMetricVisParamsController', function ($scope, $rootScope, courier, savedSearches, $filter, Private) {

  $scope.operMetricsList = [];
  $scope.historicalDataEnabled = false;
  $scope.actionButtonsEnabled = false;
  $scope.indexFields = [];
  $scope.savedSearchIds = [];
  $scope.indexPatternIds = [];
  $scope.intersectionList = [];
  // Initializing the options for interval
  // metric
  $scope.intervalOptions = [
    '',
    'Previous Window',
    'This Day',
    'This Week',
    'This Month',
    'This Year',
    'Previous Day',
    'Day Before Previous Day',
    'Previous Week',
    'Previous Month',
    'Previous Year',
    'Last 15 Minutes',
    'Last 30 Minutes',
    'Last 1 Hours',
    'Last 4 Hours',
    'Last 12 Hours',
    'Last 24 Hours',
    'Last 7 days',
    'Last 30 days',
    'Last 60 days',
    'Last 90 days',
    'Last 6 Months',
    'Last 1 Years',
    'Last 2 Years',
    'Last 5 Years',
    'Last 10 Years',
    'DTD',
    'WTD',
    'MTD',
    'YTD',
    'Next Window',
    'Next Day',
    'Day After Next Day',
    'Next Week',
    'Next Month',
    'Next Year',
    'Next 24 Hours',
    'Next 12 Hours',
    'Next 4 Hours',
    'Next 1 Hours',
    'Next 15 Minutes',
    'Next 30 Minutes',
    'Next 7 days',
    'Next 30 days',
    'Next 60 days',
    'Next 90 days',
    'Next 6 Months',
    'Next 1 Years',
    'Next 2 Years',
    'Next 5 Years',
    'Next 10 Years',
  ];

  // If the BMV is built based on the index then the saved search for that BMV should be empty
  const defaultSavedSearch = {
    id: '',
    title: '',
  };

  $scope.search = function () {
    $rootScope.$broadcast('courier:searchRefresh');
  };

  // To creating a list of metric labels when ever user creates a metric.
  $scope.$watch('vis.params.metrics', function () {
    $scope.metricLabelList = [];
    _.each($scope.vis.params.metrics, function (metric) {
      $scope.metricLabelList.push(metric.label);
    });
  }, true);

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
      // Tabulat format for the old BMVs would be undefined.
      // So make it horizontal format by default.
      if ($scope.vis.params.tabularFormat === undefined) {
        $scope.vis.params.tabularFormat = 'horizontal';
      }

      $scope.vis.params.enableTableFormat = true;
      return true;
    }
    else {
      return false;
    }
  };

  $scope.enableHorizontalViewFormat = function () {
    if ($scope.vis.params.enableTableFormat === true) {
      $scope.vis.params.tabularFormat = 'horizontal';
    }
    else {
      $scope.vis.params.tabularFormat = '';
    }
  };

  $scope.setTabularFormat = function (tabularFormat) {
    $scope.vis.params.tabularFormat = tabularFormat;
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

    // Adjust the threshold parameters so that they are converted into new
    // format. old format had match, max and min fields.
    _.each($scope.vis.params.metrics[bmIndex].threshold, function (threshold) {
      if (threshold.match !== '' && threshold.match !== undefined && threshold.match !== null) {
        // This is the old match case. We convert this to new equal case
        threshold.comparison = '==';
        threshold.valueStr = threshold.match;
        threshold.match = '';
      }
      if (threshold.max !== undefined && threshold.max !== '' && threshold.max !== null) {
        // This is the old range case. We convert this to new range case
        threshold.comparison = 'Range';
        threshold.value = threshold.max;
        threshold.valueMin = threshold.min;
        threshold.max = null;
        threshold.min = null;
      }
    });
  }

  // This will execute once. Get all the available saved search.
  // We are also passing "allowedRolesJSON" to get only the saved search the user is having access.
  Promise.resolve(getSavedObject('search', ['title', 'allowedRolesJSON'], 10000, Private))
    .then(function (response) {
      $scope.savedSearchIds = response;
    });

  // This will execute once get all the available index patterns
  Promise.resolve(getSavedObject('index-pattern', ['title'], 10000, Private))
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
