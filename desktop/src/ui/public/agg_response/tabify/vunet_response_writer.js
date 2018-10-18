import _ from 'lodash';
import AggConfigResult from 'ui/vis/agg_config_result';

// Update sum to calculate percentage
export function updateSumForPercentage(thisForPercentage, agg, value) {
// We update the sum here which is used to calculate %age when
// populating data table
  if (thisForPercentage.opts.metricsInPercentage && value.type === 'metric') {
    // If '.single-term' exist in the Dict, it means we have single
    // bucketing and so get the sum from the corresponding dict
    if ('.single-term' in thisForPercentage.sumDict) {
      value.sum = thisForPercentage.sumDict['.single-term'][agg.id];
    } else {
      value.sum = thisForPercentage.sumDict[thisForPercentage.rowBuffer[0]][agg.id];
    }
  }
}

//Calculate sum for each bucket.
export function calcSumForPercentage(thisForPercentage, agg, value, block) {
  if (thisForPercentage.asAggConfigResults) {
    value = new AggConfigResult(agg, thisForPercentage.acrStack[0], value, value);
  }

  // We push only buckets into the buffer.. This is to figure out if
  // we have 1 bucket or not while processing 'metrics' in calculateSum
  // function
  if (value.type === 'bucket') {
    thisForPercentage.calcSumRowBuffer.push(value);
  }

  if (_.isFunction(block)) {
    block.call(thisForPercentage);
  }
  if (value.type === 'bucket') {
    thisForPercentage.calcSumRowBuffer.pop(value);
  }
  return value;
}