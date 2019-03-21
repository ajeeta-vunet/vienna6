import angular from 'angular';
const module = require('ui/modules').get('kibana');

module.directive('searchableMultiselect', function () {
  return {
    template: require('ui/partials/searchable_mutliselect_directive.html'),
    restrict: 'AE',
    scope: {
      displayAttr: '@',
      itemIndex: '=',
      valueAttr: '@',
      selectedItems: '=',
      allItems: '=',
      readOnly: '=',
      addItem: '=',
      removeItem: '='
    },

    link: function (scope, element) {
      element.bind('click', function (e) {
        e.stopPropagation();
      });

      //check/uncheck item for selection
      scope.updateSelectedItems = function (obj) {
        let selectedObj;
        let selectedIndex;
        for (let iter = 0; iter < scope.selectedItems.length; iter++) {
          if (scope.selectedItems[iter][scope.valueAttr].toUpperCase() === obj[scope.valueAttr].toUpperCase()) {
            selectedObj = scope.selectedItems[iter];
            selectedIndex = iter;
            break;
          }
        }
        if (typeof selectedObj === 'undefined') {
          scope.addItem(obj, scope.itemIndex);
        } else {
          scope.removeItem(selectedIndex, scope.itemIndex);
        }
      };

      //Check if item is selected , used to apply styles
      scope.isItemSelected = function (item) {
        if (scope.selectedItems.findIndex(obj => obj.name.toUpperCase() === item.toUpperCase()) !== -1) {
          return true;
        }
        return false;
      };

      //Create a comma delimited list of selected item to display
      scope.commaDelimitedSelected = function () {
        let list = '';
        angular.forEach(scope.selectedItems, function (item, index) {
          list += item[scope.valueAttr];
          if (index < scope.selectedItems.length - 1) {
            list += ', ';
          }
        });
        return list.length ? list : '';
      };
    }
  };
});
