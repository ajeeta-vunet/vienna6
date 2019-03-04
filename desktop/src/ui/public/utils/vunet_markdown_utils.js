// This function is used to decide whether to display
// visualisation title for a markdown vis.
export const hideMarkdownTitle = function (hitVisState) {
  if  (typeof (hitVisState) === 'object') {
    if (hitVisState && hitVisState.type === 'markdown' &&
    hitVisState.params.useForHeading) {
      return true;
    } else {
      return false;
    }
  }
};
