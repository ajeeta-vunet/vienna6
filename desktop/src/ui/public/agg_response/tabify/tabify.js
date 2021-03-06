import _ from 'lodash';
import { TabbedAggResponseWriterProvider } from 'ui/agg_response/tabify/_response_writer';
import { AggResponseBucketsProvider } from 'ui/agg_response/tabify/_buckets';
import { calculateSum } from 'ui/utils/vunet_calculate_sum_tabel';

export function AggResponseTabifyProvider(Private, Notifier) {
  const TabbedAggResponseWriter = Private(TabbedAggResponseWriterProvider);
  const Buckets = Private(AggResponseBucketsProvider);
  const notify = new Notifier({ location: 'agg_response/tabify' });

  function tabifyAggResponse(vis, esResponse, respOpts) {
    const write = new TabbedAggResponseWriter(vis, respOpts);

    const topLevelBucket = _.assign({}, esResponse.aggregations, {
      doc_count: esResponse.hits.total
    });

    // If metricsInPercentage is true, it means we need to show the metric
    // along with percentage in brackets.

    if (vis.params && vis.params.metricsInPercentage) {
      calculateSum(write, topLevelBucket, Private);
    }

    // metricList is used to keep track of metrics for a given row in the
    // table. It is used to create an expression metric
    const metricList = [];
    collectBucket(write, topLevelBucket, metricList, '', 1);

    return write.response();
  }

  /**
   * read an aggregation from a bucket, which is *might* be found at key (if
   * the response came in object form), and will recurse down the aggregation
   * tree and will pass the read values to the ResponseWriter.
   *
   * @param {object} bucket - a bucket from the aggResponse
   * @param {undefined|string} key - the key where the bucket was found
   * @returns {undefined}
   */
  function collectBucket(write, bucket, metricList, key, aggScale) {
    const agg = write.aggStack.shift();
    const aggInfo = agg.write();
    aggScale *= aggInfo.metricScale || 1;

    switch (agg.schema.group) {
      case 'buckets':
        const buckets = new Buckets(bucket[agg.id], agg.params);
        if (buckets.length) {
          const splitting = write.canSplit && agg.schema.name === 'split';
          if (splitting) {
            write.split(agg, buckets, function forEachBucket(subBucket, key) {
              collectBucket(write, subBucket, metricList, agg.getKey(subBucket, key), aggScale);
            });
          } else {
            metricList = [];
            buckets.forEach(function (subBucket, key) {
              write.cell(agg, agg.getKey(subBucket, key), function () {
                collectBucket(write, subBucket, metricList, agg.getKey(subBucket, key), aggScale);
              });
            });
          }
        } else if (write.partialRows && write.metricsForAllBuckets && write.minimalColumns) {
          // we don't have any buckets, but we do have metrics at this
          // level, then pass all the empty buckets and jump back in for
          // the metrics.
          write.aggStack.unshift(agg);
          passEmptyBuckets(write, bucket, key, aggScale);
          write.aggStack.shift();
        } else {
          // we don't have any buckets, and we don't have isHierarchical
          // data, so no metrics, just try to write the row
          write.row();
        }
        break;
      case 'metrics':
        let value;
        if (agg.type.name === 'expression') {
          let expression = agg.params.Expression;

          // Let us prepare the expression using the values we have got so
          // far for the metrics. For example: Replace M1 with 1st Metric
          // value, M2 with 2nd metric value and so on.
          // We iterate from the end of the metricList so that we encounter '<Mdd>'
          // before '<Md>' Example 'M10' before 'M1'
          for(let index = metricList.length; index >= 1; index = index - 1) {
            const replaceString = new RegExp('(M' + index.toString() + ')', 'g');
            expression = expression.replace(replaceString, metricList[index - 1]);
          }

          // Evaluate the expression now
          try {
            // Don't use eval to evaluate
            // Alternative to use of eval.
            const expr = new Function ('return ' + expression);
            value = expr();
          } catch (error) {
            value = '';
          }
        } else {
          value = agg.getValue(bucket);
        }

        // We push the value in metricList to make sure that any subsequent
        // expression metric can use earlier configured expression metrics
        // For example 5th metric can use another expression metric at third
        // place.
        metricList.push(value);

        // since the aggregation could be a non integer (such as a max date)
        // only do the scaling calculation if it is needed.
        if (aggScale !== 1) {
          value *= aggScale;
        }
        write.cell(agg, value, function () {
          if (!write.aggStack.length) {
            // row complete
            write.row();
          } else {
            // process the next agg at this same level
            collectBucket(write, bucket, metricList, key, aggScale);
          }
          metricList.pop(value);
        });
        break;
    }

    write.aggStack.unshift(agg);
  }

  // write empty values for each bucket agg, then write
  // the metrics from the initial bucket using collectBucket()
  function passEmptyBuckets(write, bucket, key, aggScale) {
    const agg = write.aggStack.shift();

    switch (agg.schema.group) {
      case 'metrics':
        // pass control back to collectBucket()
        write.aggStack.unshift(agg);
        collectBucket(write, bucket, key, aggScale);
        return;

      case 'buckets':
        write.cell(agg, '', function () {
          passEmptyBuckets(write, bucket, key, aggScale);
        });
    }

    write.aggStack.unshift(agg);
  }

  return notify.timed('tabify agg response', tabifyAggResponse);
}
