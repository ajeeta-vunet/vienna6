define(function (require) {
  describe('Filter Bar Directive', function () {
    describe('filterOutTimeBasedFilter()', function () {

      var sinon = require('test_utils/auto_release_sinon');
      var filterOutTimeBasedFilter,
          $rootScope;

      beforeEach(module('kibana'));

      beforeEach(function () {
        module('kibana/courier', function ($provide) {
          $provide.service('courier', require('fixtures/mock_courier'));
        });
      });

      beforeEach(inject(function (Private, _$rootScope_, Promise) {
        filterOutTimeBasedFilter = Private(require('components/filter_bar/lib/filterOutTimeBasedFilter'));
        $rootScope = _$rootScope_;
      }));

      it('should return the matching filter for the defualt time field', function (done) {
        var filters = [
          { meta: { index: 'logstash-*' }, query: { match: { _type:  { query: 'apache', type: 'phrase' } } } },
          { meta: { index: 'logstash-*' }, range: { 'time': { gt: 1388559600000, lt: 1388646000000 } } }
        ];
        filterOutTimeBasedFilter(filters).then(function (results) {
          expect(results).to.have.length(1);
          expect(results).to.not.contain(filters[1]);
          done();
        });
        $rootScope.$apply();
      });

    });
  });
});
