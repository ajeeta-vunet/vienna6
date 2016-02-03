import toUser from 'ui/parse_query/lib/to_user';
define(function (require) {
  require('ui/modules')
    .get('kibana')
    .directive('parseQuery', function (Private) {
      var fromUser = Private(require('ui/parse_query/lib/from_user'));

      return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
          'ngModel': '='
        },
        link: function ($scope, elem, attr, ngModel) {
          var init = function () {
            $scope.ngModel = fromUser($scope.ngModel);
          };

          ngModel.$parsers.push(fromUser);
          ngModel.$formatters.push(toUser);

          init();
        }
      };
    });
});
