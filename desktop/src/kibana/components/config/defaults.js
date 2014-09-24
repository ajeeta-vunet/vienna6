define(function (require) {
  var _ = require('lodash');

  return _.flattenWith('.', {
    dateFormat: 'MMMM Do YYYY, HH:mm:ss.SSS',
    defaultIndex: null,
    refreshInterval: 10000,
    metaFields: ['_source', '_id', '_type', '_index'],

    'discover:sampleSize': 500,
    'fields:popularLimit': 10,

    'truncate:maxHeight': 100,

    'histogram:barTarget': 50,
    'histogram:maxBars': 100,

    'csv:separator': ',',
    'csv:quoteValues': true,

    'history:limit': 10,

    'shortDots:enable': false
  });
});