import template from './kbn_timepicker_recent_panel.html';
import { uiModules } from 'ui/modules';
import 'ui/timefilter';
import moment from 'moment';

const module = uiModules.get('ui/timepicker');

module.directive('kbnTimepickerRecentPanel', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      setRecent: '&'
    },
    template,
    controller: function ($scope) {

      // Initialize recentAbsoluteTimeList to empty list.
      $scope.recentAbsoluteTimeList = [];

      // Get localStorage list.
      const recentTimeList = JSON.parse(localStorage.getItem('recentTimeValues'));

      if (recentTimeList) {
        // Push timeObject from localStorage in to $scope.recentAbsoluteTimeList.
        recentTimeList && recentTimeList.map((time) => {
          $scope.recentAbsoluteTimeList.push({
            from: moment(time.from).format(
              'YYYY-MM-DD HH:mm:ss.SSS'),
            to: moment(time.to).format(
              'YYYY-MM-DD HH:mm:ss.SSS')
          });
        });
      }

      // Reverse the list to display recent time as first item.
      $scope.recentAbsoluteTimeList.reverse();
    }
  };
});
