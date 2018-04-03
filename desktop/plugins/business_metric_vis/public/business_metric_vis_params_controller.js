require('ui/courier');
require('ui/directives/metric');
require('ui/directives/business_metric_color_schema');
require('ui/directives/time_shift.js');
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana/business_metric_vis', ['kibana']);
module.controller('BusinessMetricVisParamsController', function ($scope, $rootScope, courier, $filter, Private) {

  $scope.search = function () {
    $rootScope.$broadcast('courier:searchRefresh');
  };

  // This will set the indexFields with the fields according to the data
  // source selected. It also takes care of grouping the fields
  // according to their types.
  $scope.setIndexPattern = function () {

    $scope.vis.params.index = $scope.index;

    courier.indexPatterns.get($scope.vis.params.index.id).then(function (currentIndex) {
      let fields = currentIndex.fields.raw;
      fields = $filter('filter')(fields, { aggregatable: true });
      $scope.indexFields = fields.slice(0);
    });

  };

  // This function gets called first when the controller runs
  function init() {

    if (!$scope.vis.params.metric) {
      $scope.vis.params.metric = {};
      $scope.vis.params.referenceLink = {};
    }

    $scope.indexPatternIds = [];
    const savedObjectsClient = Private(SavedObjectsClientProvider);
    return savedObjectsClient.find({
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

        // If this is an old one, populate the index so that user can see the
        // same in the front-end
        if ($scope.vis.params.index && $scope.vis.params.index.id === id) {
          $scope.index = indexPattern;
        }

        return indexPattern;
      });

      // If we are having a new visualization, let us set the index field to
      // 1st index
      if (!$scope.vis.params.index) {
        $scope.index = $scope.indexPatternIds[0];
      }

      $scope.setIndexPattern();
    });

  }
  init();
});
