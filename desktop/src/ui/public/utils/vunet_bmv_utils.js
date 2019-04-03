import _ from 'lodash';

// This function is used to decide whether to display
// visualisation title for a BM vis.
export const hideBmvTitle = function (hitVisState) {
  if  (typeof (hitVisState) === 'object') {

    if (hitVisState && hitVisState.type !== 'business_metric' ||
      hitVisState.params.aggregations &&  hitVisState.params.aggregations.length !== 0 ||
      hitVisState.params.enableTableFormat
    ) {
      return false;
    }

    // Count the number of metrics to display.
    let displayedMetrics = 0;
    _.each(hitVisState.params.metrics, function (metric) {
      if (!metric.hideMetric) {
        displayedMetrics += 1;
      }
    });

    // Returns true if count is 1.
    if (displayedMetrics === 1) {
      return true;
    }
    return false;
  }
};
