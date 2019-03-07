import MarkdownIt from 'markdown-it';
import { uiModules } from 'ui/modules';
import 'angular-sanitize';
import angular from 'angular';

const markdownIt = new MarkdownIt({
  html: false,
  linkify: true
});

const module = uiModules.get('kibana/markdown_vis', ['kibana', 'ngSanitize']);
module.controller('KbnMarkdownVisController', function ($scope) {
  $scope.$watch('vis.params.markdown', function (html) {
    if (html) {
      $scope.html = markdownIt.render(html);
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
