
class showMetricModalCtrl {  constructor($scope, metricData) {
    $scope.savedObj = metricData;
  }
}
showMetricModalCtrl.$inject = ['$scope', 'metricData'];
export default showMetricModalCtrl;
