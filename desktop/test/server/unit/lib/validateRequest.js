var _ = require('lodash');
var root = require('requirefrom')('');
var validateRequest = root('src/server/lib/validateRequest');
var expect = require('expect.js');

describe('lib/isValid', function () {

  function del(path, body, valid) {
    run('delEte', path, body, valid);
    run('delete', path, body, valid);
  }

  function send(path, body, valid) {
    run('POST', path, body, valid);
    run('post', path, body, valid);
    run('PUT', path, body, valid);
    run('put', path, body, valid);
  }

  function run(method, path, body, valid) {
    if (typeof body === 'boolean') {
      valid = body;
      body = null;
    }

    if (_.isArray(body)) body = body.map(JSON.stringify).join('\n') + '\n';
    if (_.isObject(body)) body = JSON.stringify(body);

    var pass = validateRequest({
      method: method,
      url: path,
      rawBody: body
    });

    if (pass !== Boolean(valid)) {
      var msg = 'Expected ' + method + ' ' +
        path + ' ' + (body ? 'with body ' : '') +
        'to ' + (!valid ? 'not ' : '') + 'validate';

      if (body) {
        msg += ' – ' + body;
      }

      throw new Error(msg);
    }
  }

  describe('index management', function () {
    it('allows creating kibana index', function () {
      send('/.kibana', true);
    });

    it('allows deleting the kibana index', function () {
      del('/.kibana', true);
    });

    it('blocks creating a non-kibana index', function () {
      send('/app-index', false);
    });

    it('blocks deleting a non-kibana indices', function () {
      del('/app-data', false);
    });
  });

  describe('doc management', function () {
    it('allows indexing to the kibana index', function () {
      send('/.kibana', true);
      send('/.kibana/index-patterns', true);
      send('/.kibana/index-patterns/pattern-id', true);
    });

    it('allows deleting kibana documents', function () {
      del('/.kibana/index-patterns', true);
      del('/.kibana/index-patterns/pattern-id', true);
    });
  });

  describe('allows any destructive non-bulk requests against kibana index', function () {
    it('refresh', function () {
      send('/.kibana/_refresh', true);
    });

    it('delete', function () {
      del('/.kibana/pasta/lasagna', true);
    });
  });

  describe('assorted methods that are non-destructive', function () {
    it('validate', function () {
      run('GET', '/_search?search_type=count', true);
      run('GET', '/index/type/id', true);
      run('GET', '/index/type/_mapping/field/field1', true);
      run('GET', '/_aliases', true);
      run('GET', '/_nodes/', true);
      run('HEAD', '/', true);
      run('HEAD', '/.kibana', true);
      run('HEAD', '/other-index', true);
      run('GET', '/_cluster/health', true);
      run('GET', '/.kibana/__notRealIndex__/_validate/query?q=foo:bar', true);
    });
  });

  describe('bulk indexing', function () {
    it('valid', function () {
      send('/_bulk', [
        { create: { index: '.kibana', type: 'index-pattern' } },
        { fields: [] },
        { create: { index: '.kibana', type: 'vis' } },
        { aggs: [] }
      ], true);

      send('/.kibana/_bulk', [
        // implicit index
        { create: { type: 'index-pattern' } },
        { fields: [] },

        // explicit index
        { create: { index: '.kibana', type: 'vis' } },
        { aggs: [] }

      ], true);
    });

    it('rejects bulks including even one other index', function () {
      send('/.kibana/_bulk', [
        // implicit index
        { create: { type: 'index-pattern' } },
        { fields: [] },
        // explicit index
        { create: { index: 'app-data', type: 'vis' } },
        { aggs: [] }
      ], false);
    });

    it('rejects malformed bulk bodies', function () {
      send('/_bulk', '{}\n{ "index": "john" }\n', false);
      send('/_bulk', '{}\n{}\n', false);
      send('/_bulk', '{ "field": "value" }', false);
      send('/_bulk', '{ "field": "v', false);
    });
  });

  describe('msearch', function () {
    it('requires a bulk-formatted body', function () {
      send('/_msearch', false);
      send('/_msearch', '{}', false);
      send('/_msearch', '{}\n{}\n', true);
      send('/_msearch', '{}\n{}\n{}\n', false);
    });

    it('allows searching any index', function () {
      send('/app-index/_msearch', [
        {},
        { query: { match_all: {} } }
      ], true);

      send('/app-index/data-type/_msearch', [
        {},
        { query: { match_all: {} } }
      ], true);

      send('/_msearch', [
        { index: 'app-index', type: 'data-type' },
        { query: { match_all: {} } },
        { index: 'IT-index', type: 'logs' },
        { query: { match_all: {} } },
        { index: 'L33t', type: '?' },
        { query: { match_all: {} } },
      ], true);
    });
  });

  describe('mget', function () {
    it('requires a valid json body', function () {
      send('/_mget', false);
      send('/_mget', '{}', true);
      send('/_mget', '{}\n{}\n', false);
    });

    it('allows reading from any index', function () {
      send('/app-index/_mget', { docs: { match_all: {} } }, true);
      send('/app-index/data-type/_mget', { docs: [ {} ] }, true);
    });
  });
});
