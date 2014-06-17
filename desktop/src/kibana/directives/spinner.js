define(function (require) {
  var html = '<div class="kbn-spinner"><div class="bounce1"></div> <div class="bounce2"></div> <div class="bounce3"></div></div>';
  var module = require('modules').get('kibana/directives');

  module.directive('spinner', function () {
    return {
      restrict: 'C',
      scope: {
        from: '=',
        to: '=',
        mode: '='
      },
      template: html
    };
  });

});