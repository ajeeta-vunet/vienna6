define(function (require) {
  return function AggTypeMetricCountProvider(Private) {
    var MetricAggType = Private(require('components/agg_types/metrics/_metric_agg_type'));

    return new MetricAggType({
      name: 'count',
      title: 'Count',
      hasNoDsl: true,
      makeLabel: function (aggConfig) {
        return 'Count of documents';
      }
    });
  };
});