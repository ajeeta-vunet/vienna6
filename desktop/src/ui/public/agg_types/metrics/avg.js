import AggTypesMetricsMetricAggTypeProvider from 'ui/agg_types/metrics/MetricAggType';

define(function (require) {
  return function AggTypeMetricAvgProvider(Private) {
    var MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);

    return new MetricAggType({
      name: 'avg',
      title: 'Average',
      makeLabel: function (aggConfig) {
        return 'Average ' + aggConfig.params.field.displayName;
      },
      params: [
        {
          name: 'field',
          filterFieldTypes: 'number'
        }
      ]
    });
  };
});
