import $ from 'jquery';
import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana');

module.directive('kbnInfiniteScroll', function () {
  return {
    restrict: 'E',
    scope: {
      more: '='
    },
    link: function ($scope, $element) {
      const $window = $(window);
      let checkTimer;

      function onScroll() {
        if (!$scope.more) return;

        const winHeight = $window.height();
        const winBottom = winHeight + $window.scrollTop();
        const elTop = $element.offset().top;
        const remaining = elTop - winBottom;

        if (remaining <= winHeight * 0.50) {
          $scope[$scope.$$phase ? '$eval' : '$apply'](function () {
            $scope.more();
          });
        }
      }

      function scheduleCheck() {
        if (checkTimer) return;
        checkTimer = setTimeout(function () {
          checkTimer = null;
          onScroll();
        }, 50);
      }

      // Register scroll event for the element having id discover-data
      $('#discover-data').on('scroll', scheduleCheck);

      // $window.on('scroll', scheduleCheck);
      $scope.$on('$destroy', function () {
        clearTimeout(checkTimer);

        // Unregister scroll event when destroy event fiered for
        // the element having id discover-data.
        $('#discover-data').off('scroll', scheduleCheck);
      });

      scheduleCheck();
    }
  };
});
