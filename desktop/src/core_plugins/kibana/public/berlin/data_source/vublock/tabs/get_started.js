import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');

// This directive takes care of displaying docs information
app.directive('vuBlockGetStarted', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockGetStarted',
    controller: vuBlockGetStarted,
  };
});

function vuBlockGetStarted($scope,
  StateService
) {
  return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'getstarted').then(function (data) {
    $scope.getStartedTemplate = data;
  });
}
