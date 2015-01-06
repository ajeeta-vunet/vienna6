define(function (require) {
  var _ = require('lodash');
  var filterActions;
  var $rootScope;

  describe.only('Filter Bar Actions', function () {

    beforeEach(module('kibana'));

    beforeEach(function () {
      inject(function (_$rootScope_, Private) {
        $rootScope = _$rootScope_;
        filterActions = Private(require('components/filter_bar/lib/filterActions'));
      });
    });

    describe('apply', function () {
      it('should apply methods to scope', function () {
        var actions = filterActions($rootScope);

        var methods = _.filter(_.keys(actions), function (method) {
          return method !== 'apply';
        });

        filterActions($rootScope).apply();

        _.each(methods, function (method) {
          expect($rootScope).to.have.property(method);
        });
      });
    });
  });

  describe('Filter Bar Actions', function () {
    var childSuites = [
      require('specs/components/filter_bar/_filterToggle'),
      require('specs/components/filter_bar/_filterInvert'),
      require('specs/components/filter_bar/_filterPin'),
      require('specs/components/filter_bar/_filterAdd'),
      require('specs/components/filter_bar/_filterRemove'),
    ].forEach(function (s) {
      describe(s[0], s[1]);
    });
  });
});
