define(function () {
  return function YAxisSplitFactory(d3) {
    return function (selection) {
      selection.each(function () {
        var div = d3.select(this);

        div.selectAll('.y-axis-div')
          .append('div')
          .data(function (d) {
            return d.rows ? d.rows : [d];
          })
          .enter()
          .append('div')
          .attr('class', 'y-axis-div');
      });
    };
  };
});