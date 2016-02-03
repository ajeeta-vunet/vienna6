import d3 from 'd3';
define(function (require) {
  /**
   * Creates a string based on the hex color passed in
   *
   * @method dataLabel
   * @param d {Object} object to wrap in d3.select
   * @returns {string} label value
   */
  function dataLabel(selection, label) {
    d3.select(selection).attr('data-label', label);
  }

  return dataLabel;
});
