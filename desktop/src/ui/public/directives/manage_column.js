import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana');

module.directive('manageColumn', function () {
  return {
    restrict: 'E',
    scope: {
      managed: '=', // for enable disable panel
      action: '=', // either include or exclude
      selected: '=' // selected column array
    },
    template: require('ui/directives/partials/manage_column.html'),
    link: function (scope) {
      scope.column = '';

      //add the column to selected list
      scope.add = function () {
        if (scope.column && scope.column !== '' && !scope.selected.includes(scope.column)) {
          scope.selected.push(scope.column);
        }
        scope.column = '';
      };

      //remove column from selected list
      scope.remove =  function (index) {
        scope.selected.splice(index, 1);
      };

    }
  };
});

