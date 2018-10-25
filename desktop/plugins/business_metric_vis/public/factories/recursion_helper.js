const app = require('ui/modules').get('kibana/business_metric_vis', ['kibana', 'kibana/courier']);
const angular = require('angular');

app.factory('RecursionHelper', ['$compile', function ($compile) {
  return {
  // Manually compiles the element, fixing the recursion loop.
    compile: function (element, link) {

      if (angular.isFunction(link)) {
        link = { post: link };
      }

      // remove the contents
      const contents = element.contents().remove();
      let compiledContents;
      return {
        pre: (link && link.pre) ? link.pre : null,
        post: function (scope, element) {
          // Compile the contents
          if (!compiledContents) {
            compiledContents = $compile(contents);
          }
          // now add the compiled contents to the element
          compiledContents(scope, function (clone) {
            element.append(clone);
          });
          if (link && link.post) {
            link.post.apply(null, arguments);
          }
        }
      };
    }
  };
}]);