export function updateColorCodeOnPercentage($scope) {
  const checkColorCodeOnPercentage = function (colorSchema) {
    return colorSchema.colorCodeOnPercentage;
  };
  $scope.colorCodeOnPercentageUsed = false;


  // It makes colorCodeOnPercentageUsed to false
  // when user deselects metricsInPercentage
  $scope.$watchMulti([
    'vis.params.metricsInPercentage'
  ], function () {
    if (!$scope.vis) return;

    const params = $scope.vis.params;
    if (!params.metricsInPercentage) {
      $scope.colorCodeOnPercentageUsed = params.colorSchema.some(checkColorCodeOnPercentage);
    } else {
      $scope.colorCodeOnPercentageUsed = false;
    }
  });

}
