import utils from '../../../core_plugins/console/public/src/utils';

define(function (require) {
  const module = require('ui/modules').get('kibana');


  // This directive is used to create link info configuration. This will
  // be used by all visualizations which provides facility to user
  // to configure navigation links to other dashboards
  module.directive('metricLinkInfo', function ($route, Private) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        linkInfoValues: '=',
        linkInfo: '=',
        indexPattern: '='
      },
      template: require('ui/partials/field_metric_link_info.html'),
      link: function (scope) {
        scope.selectedLinkColumns = [];
        scope.useFieldAsFilter = true;
        scope.retainFilters = false;
        scope.dashboard = '';
        scope.searchString = '';
        // Get all the dashboards
        Promise.resolve(utils.getSavedObject('dashboard', ['title', 'allowedRolesJSON'], 10000, Private))
          .then(function (response) {
            scope.dashboardList = response;
          });
        // This function is called to validate the user input. This validates the
        // ranges
        function validate(linkInfo) {
          // Validate Link
          scope.linkError = (linkInfo.dashboard && linkInfo.field) ? '' : 'Field and Dashboard are required.';
        }

        // This function is called when a user wants to edit an existing
        // linkInfo
        scope.editLink = function (index) {
          if (index !== -1) {
            const linkInfo = scope.linkInfo[index];
            scope.editIndex = index;
            scope.field = scope.indexPattern.fields.byName[linkInfo.field];
            // Show only the title of the dashboard to the user
            scope.dashboard = linkInfo.dashboard;
            scope.searchString = linkInfo.searchString;
            scope.retainFilters = linkInfo.retainFilters;
            scope.useFieldAsFilter = linkInfo.useFieldAsFilter;
          }
        };

        // This function is called when a user wants to add a linkInfo or
        // update an existing linkInfo.
        scope.addOrUpdateLink = function () {
          // Get the dashboard id for the corrosponding title
          const dashboard = scope.dashboard;
          const editIndex = scope.editIndex;
          const linkInfoEntry = {
            'field': scope.field ? scope.field.name : '',
            'dashboard': dashboard,
            'searchString': scope.searchString,
            'retainFilters': scope.retainFilters,
            'useFieldAsFilter': scope.useFieldAsFilter
          };

          validate(linkInfoEntry);

          if (!scope.linkError) {
            if(editIndex > -1) {
              scope.linkInfo[editIndex] = linkInfoEntry;
              scope.editIndex = -1;
            } else {
              scope.linkInfo.push(linkInfoEntry);
            }
          }
          scope.cancelEdit();
        };

        scope.cancelEdit = function () {
          scope.editIndex = -1;
          scope.field = '';
          scope.dashboard = '';
          scope.searchString = '';
          scope.retainFilters = false;
          scope.useFieldAsFilter = true;
        };

        // This is called when a linkInfo is deleted..
        scope.deleteLink = function (index) {
          const option = confirm('Are you sure you want to delete?');
          if (option) {
            if (index !== -1) {
              scope.linkInfo.splice(index, 1);
            }
          }
        };
      }
    };
  });
});
