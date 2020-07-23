
class showMetricModalCtrl {  constructor($scope, metricData, metricDuration, metricDurationType) {
  $scope.savedObj = metricData;
  // We would receive the selected duration as month, day, week, hour
  // for the vumetric from the alerts page.
  // The time filter will accept only the following
  // values  m, h, d, w, M. So we are using the following json dict.
  const duration = { 'minute': 'm', 'day': 'd', 'week': 'w', 'month': 'M', 'hour': 'h' };
  // Update the from and to time with what we received from the alerts page
  // Please note that this API will update the time in the global time selector.
  // So once this modal is closed, we would update the global time selector to the previous time.
  $scope.savedObj.vis.API.timeFilter.time.from = 'now-' + metricDuration + duration[metricDurationType];
  $scope.savedObj.vis.API.timeFilter.time.to = 'now';
}
}
showMetricModalCtrl.$inject = ['$scope', 'metricData', 'metricDuration', 'metricDurationType'];
/*eslint-disable*/
export default showMetricModalCtrl;
/*eslint-enable*/