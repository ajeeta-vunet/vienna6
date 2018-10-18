import _ from 'lodash';
import { AggResponseBucketsProvider } from 'ui/agg_response/tabify/_buckets';
// This function is called when a flag MetricsInPercentage is enabled and
// it calculates the SUM of the numbers for each term which is later
// used to calculate percentage.
//
// A table with 1 term and 1 metric with percentage will look as follows:
//
// term-1      Metric (count)
// 1.1.1.1     20  (50%)
// 2.2.2.2     20  (50%)
//
// This function calculates the sum (20+20 = 40) and add it into sumDict
// with '.single-term' as the key which is later used when sum is
// populated in AggConfigResult
//
// A table with 2 Metrics (count, sum) and 2 terms will looks as follows:
//
// term-1      term-2      Metric-1 (count)   Metric-2 (sum)
// 1.1.1.1     eth0         5                 5000
// 1.1.1.1     eth1         5                 10000
// 1.1.1.1     eth2         5                 20000
// 1.1.1.1     eth3         5                 15000
// 2.2.2.2     eth0         10                1000
// 2.2.2.2     eth1         20                1000
//
// This function calculate sum for 1st metric as 20 and second metric as
// 50000 for 1.1.1.1 and 30 for 1st metric and 2000 for 2nd metric for
// 2.2.2.2. It is then populated in AggConfigResult and used to calculate
// the %age of each metric. This is how it will look like:
//
// term-1      term-2      Metric-1 (count)   Metric-2 (sum)
// 1.1.1.1     eth0         5 (25%)            5000  (10%)
// 1.1.1.1     eth1         5 (25%)            10000 (20%)
// 1.1.1.1     eth2         5 (25%)            20000 (40%)
// 1.1.1.1     eth3         5 (25%)            15000 (30%)
// 2.2.2.2     eth0         10 (33.33%)        1000 (50%)
// 2.2.2.2     eth1         20 (66.66%)        1000 (50%)

export function calculateSum(write, bucket, Private, key) {
  const Buckets = Private(AggResponseBucketsProvider);
  const agg = write.aggStack.shift();
  switch (agg.schema.group) {
    case 'buckets':
      const buckets = new Buckets(bucket[agg.id]);
      if (buckets.length) {
        const splitting = write.canSplit && agg.schema.name === 'split';
        // Currently we don't support splitting
        if (!splitting) {
          buckets.forEach(function (subBucket, key) {
            write.calcSum(agg, agg.getKey(subBucket, key), function () {
              calculateSum(write, subBucket, Private, agg.getKey(subBucket, key));
            });
          });
        }
      }
      break;
    case 'metrics':
      const value = agg.getValue(bucket);
      let sumValDict;
      if (write.calcSumRowBuffer.length > 1) {
        if (write.calcSumRowBuffer[0] in write.sumDict) {
          sumValDict = write.sumDict[write.calcSumRowBuffer[0]];
        } else {
          write.sumDict[write.calcSumRowBuffer[0]] = {};
          sumValDict = write.sumDict[write.calcSumRowBuffer[0]];
        }
      } else {
        if ('.single-term' in write.sumDict) {
          sumValDict = write.sumDict['.single-term'];
        } else {
          write.sumDict['.single-term'] = {};
          sumValDict = write.sumDict['.single-term'];
        }
      }

      let sum = 0;
      if (agg.id in sumValDict) {
        sum = sumValDict[agg.id];
      } else {
        sumValDict[agg.id] = 0;
      }
      sum += value;
      sumValDict[agg.id] = sum;
      if (write.aggStack.length) {
        // process the next agg at this same level
        calculateSum(write, bucket, key);
      }
  }
  write.aggStack.unshift(agg);
}

export function metricPercentage(vis) {
  // We will use the metricsInPercentage flag as True only if all the
  // metrics are count, sum or unique count. Also, the table is using
  // split line instead of split table. Metrics in percentage is
  // not support for Split table
  let metricsInPercentage = vis.params.metricsInPercentage;
  _.each(vis.aggs, function (agg) {
    if (agg.type.type === 'metrics' && agg.type.title !== 'Count' && agg.type.title !== 'Sum' && agg.type.title !== 'Unique Count') {
      metricsInPercentage = false;
    }

    if (agg.schema.title === 'Split Table') {
      metricsInPercentage = false;
    }

  });
  return metricsInPercentage;
}
