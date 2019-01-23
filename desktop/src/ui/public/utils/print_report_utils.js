export function fixTableHeightForPrintReport(scope, curElement) {
  // Calculate the height of table
  let val = scope.vis.params.perPage * 31 + 157;
  // Find element with id 'vis_visualize' and increase its height
  const visEl = curElement.closest('#vis_visualization');
  val = val.toString() + 'px';

  // There might be multple table vis
  visEl[0].style.height = val;
}

export function fixBMVHeightForPrintReport(scope, numRows, curElement) {
  // Calculate the height of table
  let val = numRows * 31 + 157;

  const visEl = curElement.closest('#vis_visualization');
  val = val.toString() + 'px';

  // There might be multple table vis
  visEl[0].style.height = val;
}
