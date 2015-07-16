var _ = require('lodash');
var glob = require('glob');


var parseDateMath = require('../utils/date_math.js');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
});

var time = {
  min: parseDateMath('now-18M'),
  max: parseDateMath('now'),
  field: '@timestamp',
  interval: '1w'
};

// Load function plugins
var operators  = _.chain(glob.sync('server/request_functions/*.js')).map(function (file) {
  var fnName = file.substring(file.lastIndexOf('/')+1, file.lastIndexOf('.'));
  return [fnName, require('../request_functions/' + fnName + '.js')];
}).zipObject().value();


function buildRequest (config) {
  var filter = {range:{}};
  filter.range[time.field] = {gte: time.min, lte: time.max};

  var searchRequest = {
    filterPath: 'aggregations.series.buckets.key,aggregations.series.buckets.doc_count,aggregations.series.buckets.metric.value',
    searchType: 'count',
    body: {
      query: {
        filtered: {
          query: {
            query_string: {
              query: config.query
            }
          },
          filter: filter
        }
      },
      aggs: {
        series: {
          date_histogram: {
            field: time.field,
            interval: time.interval,
            extended_bounds: {
              min: time.min,
              max: time.max
            },
            min_doc_count: 0
          }
        }
      }
    }
  };

  _.each(config.operators, function (operatorObj) {
    var fn = operators[operatorObj.operator].request;
    if (fn) {
      searchRequest = fn(searchRequest, operatorObj.arguments);
    }
  });

  return searchRequest;
}

module.exports = function (config, cacheKey) {
  return client.search(buildRequest(config)).then(function (resp) {
    var values;
    var keys = _.pluck(resp.aggregations.series.buckets, 'key');
    if (resp.aggregations.series.buckets[0].metric) {
      values = _.chain(resp.aggregations.series.buckets).pluck('metric').pluck('value').value();
    } else {
      values = _.pluck(resp.aggregations.series.buckets, 'doc_count');
    }
    var data = _.zipObject(keys, values);

    _.each(config.operators, function (operatorObj) {
      var fn = operators[operatorObj.operator].result;
      if (fn) {
        data = fn(data, operatorObj.arguments);
      }
    });

    return { data:  data, cacheKey: cacheKey};
  }).catch(function (e) {
    throw new Error(e.message.root_cause[0].reason);
  });
};