
import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana');


// This directive is used to create a sub graph.
module.directive('subGraphList', function () {
  return {
    restrict: 'E',
    scope: {
      visParams: '=',
      bmvList: '=',
    },
    template: require('./utm_subgraph_directive.html'),
    link: function (scope) {

      scope.opts = {
        subgraphName: '',
        editIndex: -1
      };

      // When Add Subgraph clicked.
      scope.addSubgraph = function () {
        scope.addSubGraphFlag = true;
      };

      // Reset the fields.
      scope.reset = function () {
        scope.opts.subgraphName = '';
        scope.opts.editIndex = -1;
      };

      // Initialize empty list if subgraph has not configured.
      if (scope.visParams.subGraphVisList === undefined) {
        scope.visParams.subGraphVisList = [];
      }

      scope.addSubgraphToGraph = function () {

        if (scope.opts.editIndex !== -1) {
          // When edit is updating
          scope.visParams.subGraphVisList[scope.opts.editIndex] = scope.opts.subgraphName;
        } else {
          // When adding a subgraph.
          scope.visParams.subGraphVisList.push(scope.opts.subgraphName);
        }
        scope.reset();
        scope.addSubGraphFlag = false;
      };

      // This function is called when a user
      //  wants to edit an existing subgraph.
      scope.editSubGraph = function (index) {

        const params = scope.visParams;

        if (index !== -1) {
          const subgraph = params.subGraphVisList[index];
          scope.opts.editIndex = index;
          scope.opts.subgraphName = subgraph;
        }
      };

      // Delete one of the subgraph configured.
      scope.deleteSubGraph = function (index) {
        const option = confirm('Are you sure you want to delete?');
        if (option) {
          const params = scope.visParams;
          if (index !== -1) {
            params.subGraphVisList.splice(index, 1);
          }
        }
      };

      // This is called when an edit is cancelled.
      scope.cancelEdit = function () {
        scope.reset();
        scope.addSubGraphFlag = false;
      };

    }
  };
});