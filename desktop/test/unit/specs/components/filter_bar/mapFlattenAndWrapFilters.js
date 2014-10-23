/* global sinon */
define(function (require) {
  var _ = require('lodash');
  describe('Filter Bar Directive', function () {
    describe('mapFlattenAndWrapFilters()', function () {

			var mapFlattenAndWrapFilters, $rootScope, indexPattern, getIndexPatternStub;
			beforeEach(module('kibana'));

      beforeEach(function () {
        getIndexPatternStub = sinon.stub();
        module('kibana/courier', function ($provide) {
          $provide.service('courier', function () {
            var courier = { indexPatterns: { get: getIndexPatternStub } };
            return courier;
          });
        });
      });

			beforeEach(inject(function (Private, _$rootScope_, Promise) {
				mapFlattenAndWrapFilters = Private(require('components/filter_bar/lib/mapFlattenAndWrapFilters'));
        $rootScope = _$rootScope_;
        indexPattern = Private(require('fixtures/stubbed_logstash_index_pattern'));
        getIndexPatternStub.returns(Promise.resolve(indexPattern));
			}));

      var filters = [
        null,
        [
          { exists: { field: '_type' } },
          { missing: { field: '_type' } }
        ],
        { query: { query_string: { query: 'foo:bar' } } },
        { range: { bytes: { lt: 2048, gt: 1024 } } },
        { query: { match: { _type: { query: 'apache', type: 'phrase' } } } }
      ];

      it('should map, flatten and wrap filters', function (done) {
				mapFlattenAndWrapFilters(filters).then(function (results) {
					expect(results).to.have.length(5);
					_.each(results, function (filter) {
            expect(filter).to.have.property('$$meta');
						expect(filter.$$meta).to.have.property('apply', true);
					});
          done();
        });
        $rootScope.$apply();
      });

    });
  });
});

