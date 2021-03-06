import d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';
import { VislibVisualizationsPointSeriesProvider } from './_point_series';

export function VislibVisualizationsAreaChartProvider(Private) {

  const PointSeries = Private(VislibVisualizationsPointSeriesProvider);

  const defaults = {
    mode: 'normal',
    showValues: false,
    showCircles: true,
    radiusRatio: 9,
    showLines: true,
    interpolate: 'linear',
    color: undefined,
    fillColor: undefined,
  };
  /**
   * Area chart visualization
   *
   * @class AreaChart
   * @constructor
   * @extends Chart
   * @param handler {Object} Reference to the Handler Class Constructor
   * @param el {HTMLElement} HTML element to which the chart will be appended
   * @param chartData {Object} Elasticsearch query results for this specific
   * chart
   */
  class AreaChart extends PointSeries {
    constructor(handler, chartEl, chartData, seriesConfigArgs) {
      super(handler, chartEl, chartData, seriesConfigArgs);

      this.seriesConfig = _.defaults(seriesConfigArgs || {}, defaults);
      this.isOverlapping = (this.seriesConfig.mode !== 'stacked');
      if (this.isOverlapping) {

        // Default opacity should return to 0.6 on mouseout
        const defaultOpacity = 0.6;
        this.seriesConfig.defaultOpacity = defaultOpacity;
        handler.highlight = function (element) {
          const label = this.getAttribute('data-label');
          if (!label) return;

          const highlightOpacity = 0.8;
          const highlightElements = $('[data-label]', element.parentNode).filter(
            function (els, el) {
              return `${$(el).data('label')}` === label;
            });
          $('[data-label]', element.parentNode).not(highlightElements).css('opacity', defaultOpacity / 2); // half of the default opacity
          highlightElements.css('opacity', highlightOpacity);
        };
        handler.unHighlight = function (element) {
          $('[data-label]', element).css('opacity', defaultOpacity);

          //The legend should keep max opacity
          $('[data-label]', $(element).siblings()).css('opacity', 1);
        };
      }

    }

    addPath(svg, data) {
      const ordered = this.handler.data.get('ordered');
      const isTimeSeries = (ordered && ordered.date);
      const isOverlapping = this.isOverlapping;
      const color = this.handler.data.getColorFunc();
      const xScale = this.getCategoryAxis().getScale();
      const yScale = this.getValueAxis().getScale();
      const interpolate = this.seriesConfig.interpolate;
      const isHorizontal = this.getCategoryAxis().axisConfig.isHorizontal();

      // Data layers
      const layer = svg.append('g')
        .attr('class', function (d, i) {
          return 'series series-' + i;
        });

      // Append path
      const path = layer.append('path')
        .attr('data-label', data.label)
        .style('fill', () => color(data.label))
        .style('stroke', () => color(data.label))
        .classed('overlap_area', function () {
          return isOverlapping;
        })
        .attr('clip-path', 'url(#' + this.baseChart.clipPathId + ')');

      function x(d) {
        if (isTimeSeries) {
          return xScale(d.x);
        }
        return xScale(d.x) + xScale.rangeBand() / 2;
      }

      function y1(d) {
        const y0 = d.y0 || 0;
        const y = d.y || 0;
        return yScale(y0 + y);
      }

      function y0(d) {
        const y0 = d.y0 || 0;
        return yScale(y0);
      }

      function getArea() {
        if (isHorizontal) {
          return d3.svg.area()
            .x(x)
            .y0(y0)
            .y1(y1);
        } else {
          return d3.svg.area()
            .y(x)
            .x0(y0)
            .x1(y1);
        }
      }

      // update
      path
        .attr('d', function () {
          const area = getArea()
            .defined(function (d) {
              return !_.isNull(d.y);
            })
            .interpolate(interpolate);
          return area(data.values.filter(function (d) {
            return !_.isNull(d.y);
          }));
        })
        .style('stroke-width', '1px');

      return path;
    }

    /**
     * Adds SVG circles to area chart
     *
     * @method addCircles
     * @param svg {HTMLElement} SVG to which circles are appended
     * @param data {Array} Chart data array
     * @returns {D3.UpdateSelection} SVG with circles added
     */
    addCircles(svg, data) {
      const color = this.handler.data.getColorFunc();
      const xScale = this.getCategoryAxis().getScale();
      const yScale = this.getValueAxis().getScale();
      const ordered = this.handler.data.get('ordered');
      const circleRadius = 12;
      const circleStrokeWidth = 0;
      const tooltip = this.baseChart.tooltip;
      const isTooltip = this.handler.visConfig.get('tooltip.show');
      const isOverlapping = this.isOverlapping;
      const isHorizontal = this.getCategoryAxis().axisConfig.isHorizontal();
      const isLabels = this.seriesConfig.showValues;
      const labelColor = this.seriesConfig.labelColor;
      const fontSize = this.seriesConfig.fontSize;

      const layer = svg.append('g')
        .attr('class', 'points area')
        .attr('clip-path', 'url(#' + this.baseChart.clipPathId + ')');

      // This function returns the formatted value for the field if formatted in the field formatting section
      // else returns the actual value.
      function formatValue(d) {
        let agg = d.aggConfig;
        let formattedvalue = null;
        const value = d.y;
        if (agg && agg !== undefined) {
          if (agg !== d.aggConfigResult.aggConfig) {
            agg = d.aggConfigResult.aggConfig;
            formattedvalue = agg.fieldFormatter()(value);
          }
          else {
            formattedvalue = agg.fieldFormatter()(value);
          }
          return formattedvalue;
        }
      }

      // append the circles
      const circles = layer.selectAll('circles')
        .data(function appendData() {
          return data.values.filter(function isZeroOrNull(d) {
            return d.y !== 0 && !_.isNull(d.y);
          });
        });

      // exit
      circles.exit().remove();

      // if "show values" option is true for the metric then show the values in the chart
      if (isLabels) {
        const barLabels = layer
          .selectAll('text')
          .data(function appendData() {
            return data.values.filter(function (d) {
              return !_.isNull(d.y);
            });
          });
        // Applies the font size, orientation, position and color for the value
        barLabels
          .enter()
          .append('text')
          .text(formatValue)
          .attr('font-size', fontSize)
          .attr('style', 'fill:' + labelColor  + ';font-weight:Bold')
          .attr('x', cx)
          .attr('y', cy);
      }

      // enter
      circles
        .enter()
        .append('circle')
        .attr('data-label', data.label)
        .attr('stroke', () => {
          return color(data.label);
        })
        .attr('fill', 'transparent')
        .attr('stroke-width', circleStrokeWidth);

      function cx(d) {
        if (ordered && ordered.date) {
          return xScale(d.x);
        }
        return xScale(d.x) + xScale.rangeBand() / 2;
      }

      function cy(d) {
        const y = d.y || 0;
        if (isOverlapping) {
          return yScale(y) - 5;
        }
        return yScale(d.y0 + y) - 5;
      }

      // update
      circles
        .attr('cx', isHorizontal ? cx : cy)
        .attr('cy', isHorizontal ? cy : cx)
        .attr('r', circleRadius);

      // Add tooltip
      if (isTooltip) {
        circles.call(tooltip.render());
      }

      return circles;
    }

    addPathEvents(path) {
      const events = this.events;
      if (this.handler.visConfig.get('enableHover')) {
        const hover = events.addHoverEvent();
        const mouseout = events.addMouseoutEvent();
        path.call(hover).call(mouseout);
      }
    }

    /**
     * Renders d3 visualization
     *
     * @method draw
     * @returns {Function} Creates the area chart
     */
    draw() {
      const self = this;

      return function (selection) {
        selection.each(function () {
          const svg = self.chartEl.append('g');
          svg.data([self.chartData]);

          const path = self.addPath(svg, self.chartData);
          self.addPathEvents(path);
          const circles = self.addCircles(svg, self.chartData);
          self.addCircleEvents(circles);

          self.events.emit('rendered', {
            chart: self.chartData
          });

          return svg;
        });
      };
    }
  }

  return AreaChart;
}
