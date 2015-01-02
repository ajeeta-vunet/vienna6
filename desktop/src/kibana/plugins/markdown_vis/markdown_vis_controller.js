define(function (require) {
  var marked = require('marked');
  marked.setOptions({sanitize: true}); // Sanitize HTML tags

  var module = require('modules').get('kibana/markdown_vis', ['kibana']);
  module.controller('KbnMarkdownVisController', function ($scope, $sce) {
    $scope.$watch('vis.params.markdown', function (html) {
      if (!html) return;
      $scope.html = $sce.trustAsHtml(marked(html));
    });
  });
});