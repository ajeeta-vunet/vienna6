import _ from 'lodash';
import { uiModules } from 'ui/modules';
import { SavedObjectsClientProvider } from 'ui/saved_objects';

const module = uiModules.get('kibana/heartbeat_vis', ['kibana', 'kibana/courier']);
module.controller('HeartbeatVisParamsController', function ($scope, $rootScope, courier, Private) {
  $scope.vis.params.colorSchema = $scope.vis.params.colorSchema || [];

  // Initializing a list to store metric values
  // for heartbeat.

  $scope.metricList = function () {
    const typeVal = $scope.vis.params.type;
    const heartbeat = [
      'rtt'
    ];
    const urlbeat = [
      'downloadtime'
    ];
    const tracepathbeat = [
      'rtt',
      'jitter',
      'loss'
    ];

    if (typeVal === 'device_heartbeat' || typeVal === 'service_heartbeat') {
      $scope.metricList = heartbeat;
    } else if (typeVal === 'url_heartbeat') {
      $scope.metricList = urlbeat;
    } else {
      $scope.metricList = tracepathbeat;
    }
  };

  // When Type Value updates
  $scope.$watch('vis.params.type', $scope.metricList);

  // This function gets called first when the controller runs
  function init() {
    $scope.indexPatternIds = [];
    const savedObjectsClient = Private(SavedObjectsClientProvider);
    return savedObjectsClient.find({
      type: 'index-pattern',
      fields: ['title'],
      perPage: 10000
    }).then(response => {
      _.each(response.savedObjects, function (obj) {
        $scope.indexPatternIds.push(obj.attributes.title);
      });
    });
  }
  init();
});
