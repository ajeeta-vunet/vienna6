define(function (require) {
  return function YAxisDrawUtilService(d3, Private) {
    var drawYAxis = Private(require('components/vislib/components/YAxis/_y_axis'));
    var split = Private(require('components/vislib/components/YAxis/_split'));

    return function (that) {
      // split
      // drawing axis
      return d3.selectAll('.y-axis-div').call(drawYAxis(that));
    };
  };
});
