import _ from 'lodash';
import 'ui/filters/short_dots';
import headerHtml from 'ui/doc_table/components/table_header.html';
import {
  uiModules
} from 'ui/modules';
const module = uiModules.get('app/discover');


module.directive('kbnTableHeader', function (shortDotsFilter) {
  return {
    restrict: 'A',
    scope: {
      columns: '=',
      customColumns: '=',
      sortOrder: '=',
      indexPattern: '=',
      onChangeSortOrder: '=?',
      onRemoveColumn: '=?',
      onMoveColumn: '=?',
    },
    template: headerHtml,
    controller: function ($scope) {

      //temp store edited column
      $scope.editField = {
        name: '',
        customName: ''
      };

      function getCustomColumn(name) {
        return $scope.customColumns.find(function (customColumn) {
          return Object.keys(customColumn)[0] === name;
        });
      }

      $scope.isSortableColumn = function isSortableColumn(columnName) {
        return (!!$scope.indexPattern &&
          _.isFunction($scope.onChangeSortOrder) &&
          _.get($scope, ['indexPattern', 'fields', 'byName', columnName, 'sortable'], false)
        );
      };

      $scope.tooltip = function (column) {
        if (!$scope.isSortableColumn(column)) return '';
        return 'Sort by ' + shortDotsFilter(column);
      };

      $scope.canMoveColumnLeft = function canMoveColumn(columnName) {
        return (
          _.isFunction($scope.onMoveColumn) &&
          $scope.columns.indexOf(columnName) > 0
        );
      };

      $scope.canMoveColumnRight = function canMoveColumn(columnName) {
        return (
          _.isFunction($scope.onMoveColumn) &&
          $scope.columns.indexOf(columnName) < $scope.columns.length - 1
        );
      };

      $scope.canRemoveColumn = function canRemoveColumn(columnName) {
        return (
          _.isFunction($scope.onRemoveColumn) &&
          (columnName !== '_source' || $scope.columns.length > 1)
        );
      };

      //return customName if present otherwise name
      $scope.getColumnName = function (name) {
        const customColumn = getCustomColumn(name);
        if (customColumn && customColumn[name] !== '') {
          return customColumn[name];
        }
        return name;
      };

      //show input box with original name for editing
      $scope.showEdit = function (name) {
        $scope.editField.name = name;
        $scope.editField.customName = name;
      };

      //add custom name object to custom column
      $scope.doneEditing = function () {

        if ($scope.editField.customName !== '' && $scope.editField.name !== $scope.editField.customName) {
          const customColumn = getCustomColumn($scope.editField.name);
          if (customColumn) {
            customColumn[$scope.editField.name] = $scope.editField.customName;
          } else {
            $scope.customColumns.push({
              [$scope.editField.name]: $scope.editField.customName
            });
          }
        }

        $scope.editField = {
          name: '',
          customName: ''
        };
      };


      $scope.headerClass = function (column) {
        if (!$scope.isSortableColumn(column)) return;

        const sortOrder = $scope.sortOrder;
        const defaultClass = ['fa', 'fa-sort-up', 'table-header-sortchange'];

        if (!sortOrder || column !== sortOrder[0]) return defaultClass;
        return ['fa', sortOrder[1] === 'asc' ? 'fa-sort-up' : 'fa-sort-down'];
      };

      $scope.moveColumnLeft = function moveLeft(columnName) {
        const newIndex = $scope.columns.indexOf(columnName) - 1;

        if (newIndex < 0) {
          return;
        }

        $scope.onMoveColumn(columnName, newIndex);
      };

      $scope.moveColumnRight = function moveRight(columnName) {
        const newIndex = $scope.columns.indexOf(columnName) + 1;

        if (newIndex >= $scope.columns.length) {
          return;
        }

        $scope.onMoveColumn(columnName, newIndex);
      };

      $scope.cycleSortOrder = function cycleSortOrder(columnName) {
        if (!$scope.isSortableColumn(columnName)) {
          return;
        }

        const [currentColumnName, currentDirection = 'asc'] = $scope.sortOrder;
        const newDirection = (
          (columnName === currentColumnName && currentDirection === 'asc') ?
            'desc' :
            'asc'
        );

        $scope.onChangeSortOrder(columnName, newDirection);
      };

      $scope.getAriaLabelForColumn = function getAriaLabelForColumn(name) {
        if (!$scope.isSortableColumn(name)) return null;

        const [currentColumnName, currentDirection = 'asc'] = $scope.sortOrder;
        if (name === currentColumnName && currentDirection === 'asc') {
          return `Sort ${name} descending`;
        }

        return `Sort ${name} ascending`;
      };
    }
  };
});
