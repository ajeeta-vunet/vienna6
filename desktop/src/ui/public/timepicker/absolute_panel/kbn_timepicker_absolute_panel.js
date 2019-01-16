import template from './kbn_timepicker_absolute_panel.html';
import { uiModules } from 'ui/modules';
const module = uiModules.get('ui/timepicker');
import { setRecentAbsoluteTimeList } from 'ui/utils/vunet_set_recent_absolute_list';

module.directive('kbnTimepickerAbsolutePanel', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      absolute: '=',
      applyAbsolute: '&',
      format: '=',
      pickFromDate: '=',
      pickToDate: '=',
      setToNow: '&'
    },
    template,
    controller: function ($scope) {

      // This function stores all recently accessed absolute
      // time in global timepicker in to browser's localStorage
      // with recentTimeValues name.
      $scope.storeRecentAbsoluteTimeList = function (from, to) {

        // Set Recently selected Absolute time.
        setRecentAbsoluteTimeList(from, to);
      };
    }
  };
});
