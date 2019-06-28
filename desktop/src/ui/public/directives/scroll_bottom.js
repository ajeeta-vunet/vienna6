import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana');

module.directive('kbnScrollBottom', function () {
  return {
    restrict: 'A',
    link: function ($scope, $element, attr) {
      let checkTimer;

      function onScroll() {
        const position = $element.scrollTop() + $element.outerHeight();
        const height = $element[0].scrollHeight;
        const remaining = height - position;
        const margin = 50;

        if (!height || !position) return;
        if (remaining <= margin) {
          // $evalAsync is used to evaluate something which needs to occur before the browser's view render.
          // It will evaluate attr.kbnScrollBottom as then either update the value in current digest cycle
          // or a new digest cycle ($apply) will be triggered.
          $scope.$evalAsync(attr.kbnScrollBottom);
        }
      }

      function scheduleCheck() {
        if (checkTimer) return;
        checkTimer = setTimeout(function () {
          checkTimer = null;
          onScroll();
        }, 50);
      }

      $element.on('scroll', scheduleCheck);
      $scope.$on('$destroy', function () {
        clearTimeout(checkTimer);
        $element.off('scroll', scheduleCheck);
      });
      scheduleCheck();
    }
  };
});
