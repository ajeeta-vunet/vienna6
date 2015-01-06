define(function (require) {
  var _ = require('lodash');
  var sinon = require('test_utils/auto_release_sinon');
  var globalStateStub = require('fixtures/global_state');
  var $rootScope, processGlobalFilters, filters;

  describe('processGlobalFilters', function () {

    beforeEach(function () {
      module('kibana', function ($provide) {
        $provide.service('globalState', function () { return globalStateStub; });
      });
    });

    beforeEach(function () {
      inject(function (_$rootScope_, Private) {
        $rootScope = _$rootScope_;
        $rootScope.state = {};

        processGlobalFilters = Private(require('components/filter_bar/lib/processGlobalFilters'));

        filters = [
          { meta: { index: 'logstash-*' }, query: { match: { '@tags': { query: 'foo' } } } },
          { meta: { index: 'logstash-*' }, query: { match: { '@tags': { query: 'bar' } } } },
          { meta: { pinned: true, index: 'logstash-*' }, query: { match: { '@tags': { query: 'fizz' } } } },
          { meta: { pinned: true, index: 'logstash-*' }, query: { match: { '@tags': { query: 'buzz' } } } },
        ];
      });
    });

    it('should remove pinned filters', function () {
      var processedFilters = processGlobalFilters(filters);
      expect(processedFilters).to.have.length(2);
    });

    it('should append pinned filters from globalState', function () {
      globalStateStub.filters = [
        { meta: { pinned: true, index: 'logstash-*' }, query: { match: { '@tags': { query: 'pinned' } } } },
        { meta: { index: 'logstash-*' }, query: { match: { '@tags': { query: 'not pinned' } } } },
      ];
      var processedFilters = processGlobalFilters(filters);
      expect(processedFilters).to.have.length(3);
    });

  });
});
