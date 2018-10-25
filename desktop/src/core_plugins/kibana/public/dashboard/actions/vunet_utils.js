// This function is used to decide whether to display
// visualisation title for a BM vis.
export const hideBmvTitle = function (hitVisState) {
  const visState = JSON.parse(hitVisState);
  if (visState.type === 'business_metric' &&
        visState.params.metrics.length === 1 &&
        visState.params.aggregations.length === 0 &&
        !visState.params.enableTableFormat
  ) {
    return true;
  } else {
    return false;
  }
};