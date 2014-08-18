define(function (require) {
  var _ = require('lodash');

  require('apps/visualize/saved_visualizations/saved_visualizations');
  require('directives/saved_object_finder');
  require('apps/discover/saved_searches/saved_searches');

  var templateStep = function (num, txt) {
    return '<div ng-controller="VisualizeWizardStep' + num + '" class="container vis-wizard">' + txt + '</div>';
  };

  var module = require('modules').get('apps/visualize', ['kibana/courier']);
  var routes = require('routes');

  /********
  /** Wizard Step 1
  /********/
  routes.when('/new_visualize/step/1', {
    template: templateStep(1, require('text!apps/visualize/wizard/step_1.html')),
    resolve: {
      indexPatternIds: function (courier) {
        return courier.indexPatterns.getIds();
      }
    }
  });

  module.controller('VisualizeWizardStep1', function ($route, $scope, $location, timefilter) {
    $scope.step2WithSearchUrl = function (hit) {
      return '#/new_visualize/step/2?savedSearchId=' + encodeURIComponent(hit.id);
    };

    timefilter.enabled = false;

    $scope.indexPattern = {
      selection: null,
      list: $route.current.locals.indexPatternIds
    };

    $scope.$watch('indexPattern.selection', function (pattern) {
      if (!pattern) return;
      $location.url('/new_visualize/step/2?indexPattern=' + encodeURIComponent(pattern));
    });
  });

  /********
  /** Wizard Step 2
  /********/
  routes.when('/new_visualize/step/2', {
    template: templateStep(2, require('text!apps/visualize/wizard/step_2.html'))
  });

  module.controller('VisualizeWizardStep2', function ($scope, $route, $location, timefilter, Private) {
    var existing = _.pick($route.current.params, 'indexPattern', 'savedSearchId');

    timefilter.enabled = false;

    $scope.visTypes = Private(require('components/vis_types/index'));
    $scope.visTypeUrl = function (visType) {
      var query = _.defaults({
        type: visType.name
      }, existing);

      return '#/new_visualize/create?' + _.map(query, function (val, key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
      }).join('&');
    };
  });
});