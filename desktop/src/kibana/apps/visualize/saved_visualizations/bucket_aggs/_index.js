define(function (require) {
  return function AggsService(Private) {
    return [
      Private(require('apps/visualize/saved_visualizations/bucket_aggs/date_histogram')),
      Private(require('apps/visualize/saved_visualizations/bucket_aggs/histogram')),
      Private(require('apps/visualize/saved_visualizations/bucket_aggs/range')),
      Private(require('apps/visualize/saved_visualizations/bucket_aggs/terms'))
    ];
  };
});