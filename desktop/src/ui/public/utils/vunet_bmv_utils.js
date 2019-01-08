// This function is used to decide whether to display
// visualisation title for a BM vis.
export const hideBmvTitle = function (hitVisState) {
  if  (typeof (hitVisState) === 'object') {
    if (hitVisState && hitVisState.type === 'business_metric' &&
    hitVisState.params.metrics.length === 1 &&
    hitVisState.params.aggregations && hitVisState.params.aggregations.length === 0 &&
          !hitVisState.params.enableTableFormat
    ) {
      return true;
    } else {
      return false;
    }
  }
};
