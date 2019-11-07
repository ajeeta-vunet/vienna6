import d3 from 'd3';

(function () {

  d3.bulletChart = function () {
    // assigne default values.
    let orient = 'left';
    let  reverse = false;
    let  vertical = false;
    let  threshold = function (d) { return d.threshold;};
    let maxMetric = function (d) { return d.maxMetric;};
    let currentMetric = function (d) { return d.currentMetric;};
    let  width = 380;
    let  height = 30;
    const  xAxis = d3.svg.axis();

    // For each small multiple…
    function bulletChart(g) {
      g.each(function (d, i) {
        let thresholdz = typeof threshold === 'function' ? threshold.call(this, d, i) : threshold;
        let  maxMetricz = typeof maxMetric === 'function' ? maxMetric.call(this, d, i) : maxMetric;
        let  currentMetricz = typeof currentMetric === 'function' ? currentMetric.call(this, d, i) : currentMetric;
        const  g = d3.select(this);
        let  extentX;
        let  extentY;

        thresholdz = thresholdz.slice().sort(d3.descending);
        maxMetricz = maxMetricz.slice();
        currentMetricz = currentMetricz.slice();

        let wrap = g.select('g.wrap');
        if (wrap.empty()) wrap = g.append('g').attr('class', 'wrap');

        if (vertical) {
          extentX = height; extentY = width;
          wrap.attr('transform', 'rotate(90)translate(0,' + -width + ')');
        } else {
          extentX = width; extentY = height;
          wrap.attr('transform', null);
        }

        // Compute the new x-scale.
        const newX = d3.scale.linear()
          // .domain([0, Math.max(thresholdz[0], maxMetricz[0], currentMetricz[0])])
          .domain([0, Math.max(thresholdz[0], d3.max(maxMetricz), d3.max(currentMetricz))])
          .range(reverse ? [extentX, 0] : [0, extentX]);

          // Retrieve the old x-scale, if this is an update.
        const previousX = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(newX.range());

          // Stash the new scale.
        this.__chart__ = newX;

        // Derive width-scales from the x-scales.
        const previousWidth = bulletWidth(previousX);
        const newWidth = bulletWidth(newX);

        // Update the ranges.
        const range = wrap.selectAll('rect.range')
          .data(thresholdz);

        range.enter().append('rect')
          .attr('class', function (d, i) { return 'range s' + i + ' t' + range.size(); })
          .attr('width', previousWidth)
          .attr('height', extentY)
          .attr('x', reverse ? previousX : 0);

        d3.transition(range)
          .attr('x', reverse ? newX : 0)
          .attr('width', newWidth)
          .attr('height', extentY);

        // Update the measure rects.
        const measure = wrap.selectAll('rect.measure')
          .data(currentMetricz);

        measure.enter().append('rect')
          .attr('class', function (d, i) { return 'measure s' + i; })
          .sort(d3.descending)
          .attr('width', previousWidth)
          .attr('height', extentY / 3)
          .attr('x', reverse ? previousX : 0)
          .attr('y', extentY / 3);

        d3.transition(measure)
          .attr('width', newWidth)
          .attr('height', extentY / 3)
          .attr('x', reverse ? newX : 0)
          .attr('y', extentY / 3);


        // Update the marker lines.
        const marker = wrap.selectAll('line.marker')
          .data(maxMetricz);

        marker.enter().append('line')
          .attr('class', 'marker')
          .attr('class', function (d, i) { return 'marker s' + i; })
          .attr('x1', previousX)
          .attr('x2', previousX)
          .attr('y1', extentY / 6)
          .attr('y2', extentY * 5 / 6);

        d3.transition(marker)
          .attr('x1', newX)
          .attr('x2', newX)
          .attr('y1', extentY / 6)
          .attr('y2', extentY * 5 / 6);

        const axis = g.selectAll('g.axis').data([0]);
        axis.enter().append('g').attr('class', 'axis');
        axis.attr('transform', vertical ? null : 'translate(0,' + extentY + ')')
          .call(xAxis.scale(newX));
      });
      d3.timer.flush();
    }

    // left, right, top, bottom
    bulletChart.orient = function (_) {
      if (!arguments.length) return orient;
      orient = _ + '';
      reverse = orient === 'right' || orient === 'bottom';
      xAxis.orient((vertical = orient === 'top' || orient === 'bottom') ? 'left' : 'bottom');
      return bulletChart;
    };

    // threshold (bad, satisfactory, good)
    bulletChart.threshold = function (_) {
      if (!arguments.length) return threshold;
      threshold = _;
      return bulletChart;
    };

    // maxMetric (previous, goal)
    bulletChart.maxMetric = function (_) {
      if (!arguments.length) return maxMetric;
      maxMetric = _;
      return bulletChart;
    };

    // currentMetric (actual, forecast)
    bulletChart.currentMetric = function (_) {
      if (!arguments.length) return currentMetric;
      currentMetric = _;
      return bulletChart;
    };

    bulletChart.width = function (_) {
      if (!arguments.length) return width;
      width = +_;
      return bulletChart;
    };

    bulletChart.height = function (_) {
      if (!arguments.length) return height;
      height = +_;
      return bulletChart;
    };

    return d3.rebind(bulletChart, xAxis, 'tickFormat');
  };

  function bulletWidth(x) {
    const previousX = x(0);
    return function (d) {
      return Math.abs(x(d) - previousX);
    };
  }

}());