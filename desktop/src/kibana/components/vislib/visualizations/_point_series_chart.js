define(function (require) {
  return function PointSeriesChartProvider(d3, Private) {
    var _ = require('lodash');

    var Chart = Private(require('components/vislib/visualizations/_chart'));
    var Tooltip = Private(require('components/vislib/components/tooltip/tooltip'));
    var touchdownTmpl = _.template(require('text!components/vislib/partials/touchdown.tmpl.html'));

    _(PointSeriesChart).inherits(Chart);
    function PointSeriesChart(handler, chartEl, chartData) {
      if (!(this instanceof PointSeriesChart)) {
        return new PointSeriesChart(handler, chartEl, chartData);
      }

      PointSeriesChart.Super.apply(this, arguments);
    }

    /**
     * Stacks chart data values
     *
     * @method stackData
     * @param data {Object} Elasticsearch query result for this chart
     * @returns {Array} Stacked data objects with x, y, and y0 values
     */
    PointSeriesChart.prototype.stackData = function (data) {
      var self = this;
      var stack = this._attr.stack;

      return stack(data.series.map(function (d) {
        var label = d.label;
        return d.values.map(function (e, i) {
          return {
            _input: e,
            label: label,
            x: self._attr.xValue.call(d.values, e, i),
            y: self._attr.yValue.call(d.values, e, i)
          };
        });
      }));
    };

    /**
     * Creates rects to show buckets outside of the ordered.min and max, returns rects
     *
     * @param xScale {Function} D3 xScale function
     * @param svg {HTMLElement} Reference to SVG
     * @method createEndZones
     * @returns {D3.Selection}
     */
    PointSeriesChart.prototype.createEndZones = function (svg) {
      var xAxis = this.handler.xAxis;
      var xScale = xAxis.xScale;
      var yScale = xAxis.yScale;
      var ordered = xAxis.ordered;
      var lastX = _.last(xAxis.xValues);

      if (!ordered || ordered.min == null || ordered.max == null) return;

      var attr = this.handler._attr;
      var height = attr.height;
      var width = attr.width;
      var margin = attr.margin;
      var color = '#004c99';

      var leftEndzone = {
        x: 0,
        w: xScale(ordered.min) > 0 ? xScale(ordered.min) : 0
      };

      var rightEndzone;
      if (xAxis.extendOneInterval) {
        // the last data point extends to the edge of the interval,
        // so start the right endzone right at the max
        rightEndzone = {
          x: xScale(ordered.max),
          w: width - xScale(ordered.max) > 0 ? width - xScale(ordered.max) : 0
        };
      } else {
        // the x-axis does not extend (much) past the last point,
        // so start at the point and
        rightEndzone = {
          x: xScale(lastX),
          w: xScale(xAxis.addInterval(lastX)) - xScale(lastX)
        };
      }

      // svg diagonal line pattern
      this.pattern = svg.append('defs')
      .append('pattern')
      .attr('id', 'DiagonalLines')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)')
      .attr('x', '0')
      .attr('y', '0')
      .attr('width', '4')
      .attr('height', '4')
      .append('rect')
      .attr('stroke', 'none')
      .attr('fill', color)
      .attr('width', 2)
      .attr('height', 4);

      this.endzones = svg.selectAll('.layer')
      .data([leftEndzone, rightEndzone])
      .enter()
      .insert('g', '.brush')
      .attr('class', 'endzone')
      .append('rect')
      .attr('class', 'zone')
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', 0)
      .attr('height', height - margin.top - margin.bottom)
      .attr('width', function (d) {
        return d.w;
      })
      .attr('fill', 'url(#DiagonalLines)');

      function callPlay(event) {
        var boundData = event.target.__data__;
        var wholeBucket = boundData && boundData.x != null;
        var x = wholeBucket ? xScale(boundData.x) : event.offsetX;
        return { wholeBucket: wholeBucket, touchdown: (x <= leftEndzone.w) || (x >= rightEndzone.x) };
      }

      function textFormatter() {
        return touchdownTmpl(callPlay(d3.event));
      }

      var endzoneTT = this.endzoneTT = new Tooltip('endzones', this.handler.el, textFormatter, null);
      endzoneTT.order = 0;
      endzoneTT.showCondition = function inEndzone() {
        return callPlay(d3.event).touchdown;
      };
      endzoneTT.render()(svg);
    };

    return PointSeriesChart;
  };
});