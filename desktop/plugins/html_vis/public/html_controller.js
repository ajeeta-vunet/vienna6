import { uiModules } from 'ui/modules';
import 'angular-sanitize';
import angular from 'angular';

const module = uiModules.get('kibana/kibana-html-plugin', ['kibana', 'ngSanitize']);
module.controller('KbnHtmlEditController', function ($scope, $sce) {
  $scope.$watch('vis.params.html', function (html) {
    if (html) {
      //$scope.html = markdownIt.render(html);
      $scope.html = $sce.trustAsHtml(html);
    }
    if ($scope.vis.params.useForHeading) {
      let result;
      // set the css for dashboard-panel to remove box-shadows
      result = angular.element('dashboard-panel');
      result.css('box-shadow', 'none');

      // set the css for vis-container to fix the backgound color
      result = angular.element('vis-container');
      result.css('background', '#e7ebee');
    }
    $scope.renderComplete();
  });
});
