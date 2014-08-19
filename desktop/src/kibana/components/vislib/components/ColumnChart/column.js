define(function (require) {
  return function ColumnChartUtilService(d3, Private) {
    var $ = require('jquery');
    var _ = require('lodash');

    var classify = Private(require('components/vislib/components/Legend/classify'));

    return function (vis, chartEl, chartData) {
      // Attributes
      var data = chartData;
      var xValues = vis.data.orderedKeys ? vis.data.orderedKeys : vis.data.xValues();
      var $elem = $(chartEl);

      var margin = vis._attr.margin;
      var elWidth = vis._attr.width = $elem.width();
      var elHeight = vis._attr.height = $elem.height();
      var offset = vis._attr.offset;
      var focusOpacity = vis._attr.focusOpacity;
      var blurredOpacity = vis._attr.blurredOpacity;
      var defaultOpacity = vis._attr.defaultOpacity;
      var isTooltip = vis._attr.addTooltip;

      // Inherited functions
      var color = vis.data.getColorFunc();
      var tooltip = vis.tooltip;

      // d3 Functions
      var yScale = vis.yAxis.yScale;
      var xScale = d3.scale.ordinal();
//      var xTickScale = d3.scale.linear()
//        .clamp(true)
//        .domain([80, 300, 800])
//        .range([0, 2, 4]);
//      var yTickScale = d3.scale.linear()
//        .clamp(true)
//        .domain([20, 40, 1000])
//        .range([0, 2, 10]);
      var stack = d3.layout.stack()
        .x(function (d) {
          return d.x;
        })
        .y(function (d) {
          return d.y;
        })
        .offset(offset);
      var xValue = function (d, i) {
        return d.x;
      };
      var yValue = function (d, i) {
        return d.y;
      };

      // Unassigned variables
      var svg;
      var width;
      var height;
      var layers;
      var xTicks;
      var yTicks;

      return d3.select(chartEl).call(function () {

        layers = stack(data.series.map(function (d) {
          var label = d.label;
          return d.values.map(function (e, i) {
            return {
              label: label,
              x: xValue.call(d.values, e, i),
              y: yValue.call(d.values, e, i)
            };
          });
        }));

        if (elWidth <= 0 || elHeight <= 0) {
          throw new Error($elem.attr('class') + ' height is ' + elHeight + ' and width is ' + elWidth);
        }

        // Get the width and height
        width = elWidth - margin.left - margin.right;
        height = elHeight - margin.top - margin.bottom;

        // Get the number of axis ticks
//          xTicks = Math.floor(xTickScale(width));
//          yTicks = Math.floor(yTickScale(height));

        // Update the xScale
        xScale.domain(xValues)
          .rangeBands([0, width], 0.1);

        // Create the canvas for the visualization
        var svg = d3.select(chartEl).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Data layers
        var layer = svg.selectAll('.layer')
          .data(layers)
          .enter()
          .append('g')
          .attr('class', function (d, i) {
            return i;
          });

        // Append the bars
        var bars = layer.selectAll('rect')
          .data(function (d) {
            return d;
          });

        // exit
        bars.exit()
          .remove();

        // enter
        bars.enter()
          .append('rect')
          .attr('class', function (d) {
            return 'color ' + classify(color(d.label));
          })
          .attr('fill', function (d) {
            return color(d.label);
          });

        // update
        bars
          .attr('x', function (d) {
            return xScale(d.x);
          })
          .attr('width', function () {
            return xScale.rangeBand();
          })
          .attr('y', function (d) {
            return yScale(d.y0 + d.y);
          })
          .attr('height', function (d) {
            return yScale(d.y0) - yScale(d.y0 + d.y);
          })

          .on('mouseover.bar', function (d, i) {
            //console.log(i, d, data.series, d3.event);
            d3.select(this)
              .classed('hover', true)
              .style('stroke', '#333');
              //.style('cursor', 'pointer');

            // dispatch.hover({
            //   value: getY(d, i),
            //   point: d,
            //   pointIndex: i,
            //   series: data.series,
            //   config: config,
            //   data: latestData,
            //   e: d3.event
            // });
            // d3.event.stopPropagation();

          })
          .on('mouseout.bar', function (d) {
            //console.log('OUT', d);
            d3.select(this)
              .classed('hover', false)
              .style('stroke', null);
              //.style('cursor', 'pointer');
          });

        // chart base line
        var line = layer.append('line')
          .attr('x1', 0)
          .attr('y1', height)
          .attr('x2', width)
          .attr('y2', height);
          
        // Add tooltip
        if (isTooltip) {
          bars.call(tooltip.draw());
        }

        return svg;
      });
    };
  };
});
