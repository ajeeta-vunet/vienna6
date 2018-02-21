import { AggTypesMetricsMetricAggTypeProvider } from 'ui/agg_types/metrics/metric_agg_type';
export function AggTypeMetricExpressionProvider(Private) {
  const MetricAggType = Private(AggTypesMetricsMetricAggTypeProvider);

  return new MetricAggType({
    name: 'expression',
    title: 'Expression',
    makeLabel: function () {
      return 'Expression';
    },
    hasNoDsl: true,
    params: [
      {
        name: 'Expression',
        type: 'string'
      }
    ]
  });
}
