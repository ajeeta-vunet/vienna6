export function fixTableHeightForPrintReport(scope, curElement) {
  // Calculate the height of table
  let val = scope.vis.params.perPage * 31 + 157;
  // Find element with id 'vis_visualize' and increase its height
  const visEl = curElement.closest('#vis_visualization');
  val = val.toString() + 'px';

  // There might be multple table vis
  visEl[0].style.height = val;
}
