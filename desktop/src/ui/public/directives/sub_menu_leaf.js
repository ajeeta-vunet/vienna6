const _ = require('lodash');
const app = require('ui/modules').get('app/dashboard');

// This directive is used in creating the multi level dropdown to display
// categories and their dashboards.
app.directive('subMenuLeaf', function ($compile) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      leaf: '='
    },
    templateUrl: '/ui/vienna_data/template_li.html',
    link: function (scope, element) {
      if (_.has(scope.leaf, 'subtree')) {

        // calling the tree directive again to display the
        // sub menu and adding the css class for sub menu
        element.append('<sub-menu-tree tree="leaf.subtree"></sub-menu-tree>');
        element.addClass('dropdown-submenu');
        $compile(element.contents())(scope);
      }
    }
  };
});
