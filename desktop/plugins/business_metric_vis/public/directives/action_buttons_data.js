require('ui/courier');
const app = require('ui/modules').get('kibana/business_metric_vis', ['kibana', 'kibana/courier']);

// This will handle the configuration of action buttons if configured in business metric visualizations
app.directive('actionButtonsData', function (StateService) {
  return {
    restrict: 'E',
    scope: {
      actionButtonsData: '=',
    },
    template: require('plugins/business_metric_vis/directives/action_buttons_data.html'),
    link: function (scope) {

      // Calling the get api for getting the set of actions to be populated in action buttons dropdown
      StateService.getActionButtonsDataForBusinessMetric().then(function (actionButtons) {
        scope.actionButtons = actionButtons.actions;
      });

      // Initializing the options for action button data type.
      // This function is called when a user wants to add a new Action Button
      scope.addActionButton = function () {
        scope.editIndex = -1;
        scope.actionName = '';
        scope.actionColor = '#000000';
        scope.addingActionButton = true;
      };

      // This function is called when a action button data
      // config is being added.
      scope.addConfig = function () {
        const { actionName, actionColor } = scope;
        scope.actionButtonsData.push({
          actionName,
          actionColor
        });
        scope.addingActionButton = false;
      };

      // This function is called when a user wants to edit an existing action button data config.
      scope.editConfig = function (config, index) {
        if (index !== -1) {
          scope.editIndex = index;
          scope.actionName = config.actionName;
          scope.actionColor = config.actionColor;
        }
      };

      // This function is called when a user wants to cancel adding an action button data config.
      scope.cancelEdit = function () {
        scope.editIndex = -1;
        scope.actionName = '';
        scope.actionColor = '#000000';
        scope.addingActionButton = false;
      };

      // This function is called when a user wants to update an existing action button data config.
      scope.updateConfig = function () {
        const { actionName, actionColor, editIndex } = scope;
        const config = scope.actionButtonsData.slice() || [];
        config.splice(editIndex, 1);
        scope.actionButtonsData[editIndex] = {
          actionName,
          actionColor
        };
        scope.editIndex = -1;
        scope.addingActionButton = false;
      };

      // This is called when a action button data config is deleted.
      scope.deleteConfig = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          scope.actionButtonsData.splice(index, 1);
        }
      };

    }
  };
});