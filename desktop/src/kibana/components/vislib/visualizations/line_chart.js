define(function (require) {
  return function LineChartFactory(d3, Private) {
    var _ = require('lodash');
    var $ = require('jquery');

    var Chart = Private(require('components/vislib/visualizations/_chart'));

    // Dynamically adds css file
    require('css!components/vislib/components/styles/main');

    _(LineChart).inherits(Chart);
    function LineChart(vis, chartEl, chartData) {
      if (!(this instanceof LineChart)) {
        return new LineChart(vis, chartEl, chartData);
      }

      LineChart.Super.apply(this, arguments);
      // Line chart specific attributes
      this._attr = _.defaults(vis._attr || {}, {
        interpolate: 'linear',
        xValue: function (d) { return d.x; },
        yValue: function (d) { return d.y; },
        dispatch: d3.dispatch('brush', 'click', 'hover', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout')
      });
    }

    // Response to `click` and `hover` events
    LineChart.prototype.eventResponse = function (d, i) {
      var getYValue = this._attr.yValue;
      var color = this.vis.data.getColorFunc();
      var series = this.chartData.series;
      var config = this._attr;
      var chartData = this.chartData;

      return {
        value: getYValue(d, i),
        point: d,
        label: d.label,
        color: color(d.label),
        pointIndex: i,
        series: series,
        config: config,
        data: chartData,
        e: d3.event
      };
    };

    LineChart.prototype.addCircleEvents = function (circles) {
      var self = this;
      var tooltip = this.vis.tooltip;
      var isTooltip = this._attr.addTooltip;
      var dispatch = this._attr.dispatch;

      circles
      .on('mouseover.circle', function mouseOverCircle(d, i) {
        var circle = this;

        d3.select(circle)
        .classed('hover', true)
        .style('stroke', '#333')
        .style('cursor', 'pointer');

        dispatch.hover(self.eventResponse(d, i));
        d3.event.stopPropagation();
      })
      .on('click.circle', function clickCircle(d, i) {
        dispatch.click(self.eventResponse(d, i));
        d3.event.stopPropagation();
      })
      .on('mouseout.circle', function mouseOutCircle() {
        var circle = this;

        d3.select(circle)
        .classed('hover', false)
        .style('stroke', null);
      });

      // Add tooltip
      if (isTooltip) {
        circles.call(tooltip.render());
      }
    };

    // Add brush to the svg
    LineChart.prototype.addBrush = function (xScale, svg) {
      var brushDispatch = this._attr.dispatch.brush;
      var height = this._attr.height;
      var margin = this._attr.margin;
      var self = this;

      // Brush scale
      var brush = d3.svg.brush()
      .x(xScale)
      .on('brushend', function brushEnd() {
        // response returned on brush
        return brushDispatch({
          range: brush.extent(),
          config: self._attr,
          e: d3.event,
          data: self.chartData
        });
      });

      if (self._attr.addBrushing) {
        // add brush canvas
        svg.append('g')
        .attr('class', 'brush')
        .call(brush)
          .selectAll('rect')
          .attr('height', height - margin.top - margin.bottom);
      }
    };

    LineChart.prototype.addCircles = function (svg, data) {
      var self = this;
      var color = this.vis.data.getColorFunc();
      var xScale = this.vis.xAxis.xScale;
      var yScale = this.vis.yAxis.yScale;
      var ordered = this.vis.data.get('ordered');
      var circleRadius = 4;
      var circleStrokeWidth = 1;
      var layer;
      var circles;

      layer = svg.selectAll('.points')
      .data(data)
      .enter()
        .append('g')
        .attr('class', 'points');

      // Append the bars
      circles = layer
      .selectAll('rect')
      .data(function appendData(d) {
        return d;
      });

      // exit
      circles
      .exit()
      .remove();

      // enter
      circles
      .enter()
        .append('circle')
        .attr('class', function circleClass(d) {
          return self.colorToClass(color(d.label));
        })
        .attr('fill', function (d) {
          return color(d.label);
        })
        .attr('stroke', function strokeColor(d) {
          return color(d.label);
        })
        .attr('stroke-width', circleStrokeWidth);

      // update
      circles
      .attr('cx', function cx(d) {
        if (ordered && ordered.date) {
          return xScale(d.x);
        }
        return xScale(d.x) + xScale.rangeBand() / 2;
      })
      .attr('cy', function cy(d) {
        return yScale(d.y);
      })
      .attr('r', circleRadius);

      return circles;
    };

    LineChart.prototype.addLines = function (svg, data) {
      var self = this;
      var xScale = this.vis.xAxis.xScale;
      var yScale = this.vis.yAxis.yScale;
      var xAxisFormatter = this.vis.data.get('xAxisFormatter');
      var color = this.vis.data.getColorFunc();
      var ordered = this.vis.data.get('ordered');
      var interpolate = this._attr.interpolate;
      var line = d3.svg.line()
      .interpolate(interpolate)
      .x(function x(d) {
        if (ordered && ordered.date) {
          return xScale(d.x);
        }
        return xScale(d.x) + xScale.rangeBand() / 2;
      })
      .y(function y(d) {
        return yScale(d.y);
      });
      var lines;

      lines = svg
      .selectAll('.lines')
      .data(data)
      .enter()
        .append('g')
        .attr('class', 'lines');

      lines.append('path')
      .attr('class', function lineClass(d) {
        return self.colorToClass(color(d.label));
      })
      .attr('d', function lineD(d) {
        return line(d.values);
      })
      .attr('fill', 'none')
      .attr('stroke', function lineStroke(d) {
        return color(d.label);
      })
      .attr('stroke-width', 2);

      return lines;
    };

    LineChart.prototype.addClipPath = function (svg, width, height) {
      var startX = 0;
      var startY = 0;

      // Creating clipPath
      return svg
      .attr('clip-path', 'url(#chart-area)')
      .append('clipPath')
        .attr('id', 'chart-area')
      .append('rect')
        .attr('x', startX)
        .attr('y', startY)
        .attr('width', width)
        .attr('height', height);
    };

    LineChart.prototype.draw = function () {
      // Attributes
      var self = this;
      var $elem = $(this.chartEl);
      var margin = this._attr.margin;
      var elWidth = this._attr.width = $elem.width();
      var elHeight = this._attr.height = $elem.height();
      var xScale = this.vis.xAxis.xScale;
      var chartToSmallError = 'The height and/or width of this container is too small for this chart.';
      var minWidth = 20;
      var minHeight = 20;
      var startLineX = 0;
      var lineStrokeWidth = 1;
      var div;
      var svg;
      var width;
      var height;
      var lines;
      var circles;

      return function (selection) {
        selection.each(function (data) {
          var el = this;

          var layers = data.series.map(function mapSeries(d) {
            var label = d.label;
            return d.values.map(function mapValues(e, i) {
              return {
                label: label,
                x: self._attr.xValue.call(d.values, e, i),
                y: self._attr.yValue.call(d.values, e, i)
              };
            });
          });

          // Get the width and height
          width = elWidth - margin.left - margin.right;
          height = elHeight - margin.top - margin.bottom;

          // if height or width < 20 or NaN, throw error
          if (_.isNaN(width) || width < minWidth || _.isNaN(height) || height < minHeight) {
            throw new Error(chartToSmallError);
          }

          // Select the current DOM element
          div = d3.select(el);

          // Create the canvas for the visualization
          svg = div.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

          // add clipPath to hide circles when they go out of bounds
          self.addClipPath(svg, width, height);

          // addBrush canvas
          self.addBrush(xScale, svg);

          // add lines
          lines = self.addLines(svg, data.series);

          // add circles
          circles = self.addCircles(svg, layers);

          // add click and hover events to circles
          self.addCircleEvents(circles);

          // chart base line
          var line = svg
          .append('line')
          .attr('x1', startLineX)
          .attr('y1', height)
          .attr('x2', width)
          .attr('y2', height)
          .style('stroke', '#ddd')
          .style('stroke-width', lineStrokeWidth);

          return svg;
        });
      };
    };

    return LineChart;
  };
});