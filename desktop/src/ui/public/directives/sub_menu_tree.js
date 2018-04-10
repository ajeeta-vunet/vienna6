const app = require('ui/modules').get('app/dashboard');

// This directive is used in creating the multi level dropdown to display
// categories and their dashboards.
app.directive('subMenuTree', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      tree: '='
    },
    templateUrl: '/ui/vienna_data/template_ul.html'
  };
});
