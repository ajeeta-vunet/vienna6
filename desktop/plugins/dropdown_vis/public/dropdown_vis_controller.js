require('ui/courier');
import { uiModules } from 'ui/modules';

import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { FilterManagerProvider } from 'ui/filter_manager';

//var module = require('ui/modules').get('kibana/dropdown_vis',['ui.select']);
const module = uiModules.get('kibana/dropdown_vis', ['kibana']);
module.controller('KbnDropdownVisController', function ($scope, $rootScope, Private) {


  const queryFilter = Private(FilterBarQueryFilterProvider);
  const filterManager = Private(FilterManagerProvider);
  //var filterManager = Private(require('ui/filter_manager'));
  //var queryFilter = Private(require('ui/filter_bar/query_filter'));

  $rootScope.plugin = {
    dropdownPlugin: {}
  };

  $scope.dropdownValues = [];
  $scope.dropdown = { selected: null };
  $scope.disabled = false;
  $scope.config = {
    title: 'Dropdown'
  };
  // This function is called to find the Filter from the dropDownFields
  const findFilter = function () {
    const filters = queryFilter.getFilters();
    // I am not fully sure what we are doing.. But it seems we are getting
    // the fieldParam and then comparing it with the filters to find the
    // matchingFilter
    const fieldParam = $scope.vis.aggs.bySchemaName.dropdownfield[0].params.field;
    const matchingFilter = filters.find(function (f) {
      return f.meta.key === fieldParam.$$spec.name;
    });
    return matchingFilter;
  };

  $scope.onOpenClose = function (isOpenClose) {
    if (isOpenClose) {
      // The drop-down has been opened.. We remove the
      // filter to make sure that we get all the possible values
      const matchingFilter = findFilter();
      if (matchingFilter) {
        queryFilter.removeFilter(matchingFilter);
      }
    } else if (this.$select.selected) {
      // We have selected one of the keys, let us add it as a filter
      $scope.filter(this.$select.selected.key || this.$select.selected);
    }
  };

  // Filter function to update the param..
  $scope.filter = function (val) {
    if (val) {
      // get the field param..
      const fieldParam = $scope.vis.aggs.bySchemaName.dropdownfield[0].params.field;
      // Add it as a filter
      filterManager.add(
        fieldParam,
        val,
        null,
        $scope.vis.indexPattern.id
      );
    }
  };

  // To update the title
  $scope.$watch('vis.params.title', function (title) {
    $scope.config.title = title;
  });

  // If the key currently selected or not
  const findInDropdown = function (d) {
    return d.key === $scope.dropdown.selected;
  };

  // We watch for the ESResponse to get the return value
  $scope.$watch('esResponse', function (resp) {
    if (resp && resp.aggregations) {
      // Create a list of currently available values in dropdownValues
      $scope.dropdownValues = Object.values(resp.aggregations[1].buckets).map(function (a) {
        return a;
      });
      // Is something already selected, get the same..
      const matchingFilter = findFilter();
      // if there is no matching filter, clear the dropdown selection
      if ($scope.vis.params.allowBlank && !matchingFilter) {
        $scope.dropdown.selected = null;
      }

      // if there is a matching filter make sure it matches the selection
      if (matchingFilter) {
        $scope.dropdown.selected = matchingFilter.meta.value;
      }

      // the selected thing might not be in the dropdownValues anymore
      // select the first thing in the list if nothing else is selected
      const found = $scope.dropdownValues.find(findInDropdown);
      if (!$scope.vis.params.allowBlank && !found) {
        if ($scope.dropdownValues[0]) {
          $scope.dropdown.selected = $scope.dropdownValues[0].key;
          $scope.filter($scope.dropdownValues[0].key);
        }
      }
    }
  });
});
