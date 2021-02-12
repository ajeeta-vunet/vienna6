import _ from 'lodash';
import d3 from 'd3';
import { VislibVisualizationsPointSeriesProvider } from './_point_series';

export function VislibVisualizationsColumnChartProvider(Private) {

  const PointSeries = Private(VislibVisualizationsPointSeriesProvider);

  const defaults = {
    mode: 'normal',
    showTooltip: true,
    color: undefined,
    fillColor: undefined,
  };

  /**
   * Histogram intervals are not always equal widths, e.g, monthly time intervals.
   * It is more visually appealing to vary bar width so that gutter width is constant.
   */
  function datumWidth(defaultWidth, datum, nextDatum, scale, gutterWidth, groupCount = 1) {
    let datumWidth = defaultWidth;
    if (nextDatum) {
      datumWidth = ((scale(nextDatum.x) - scale(datum.x)) - gutterWidth) / groupCount;
      // To handle data-sets with holes, do not let width be larger than default.
      if (datumWidth > defaultWidth) {
        datumWidth = defaultWidth;
      }
    }
    return datumWidth;
  }

  /**
   * Vertical Bar Chart Visualization: renders vertical and/or stacked bars
   *
   * @class ColumnChart
   * @constructor
   * @extends Chart
   * @param handler {Object} Reference to the Handler Class Constructor
   * @param el {HTMLElement} HTML element to which the chart will be appended
   * @param chartData {Object} Elasticsearch query results for this specific chart
   */
  class ColumnChart extends PointSeries {
    constructor(handler, chartEl, chartData, seriesConfigArgs) {
      super(handler, chartEl, chartData, seriesConfigArgs);
      this.seriesConfig = _.defaults(seriesConfigArgs || {}, defaults);
    }

    addBars(svg, data) {
      const self = this;
      const color = this.handler.data.getColorFunc();
      const tooltip = this.baseChart.tooltip;
      const isTooltip = this.handler.visConfig.get('tooltip.show');

      const layer = svg.append('g')
        .attr('class', 'series histogram')
        .attr('clip-path', 'url(#' + this.baseChart.clipPathId + ')');

      const bars = layer.selectAll('rect')
        .data(data.values.filter(function (d) {
          return !_.isNull(d.y);
        }));

      bars
        .exit()
        .remove();

      bars
        .enter()
        .append('rect')
        .on('mouseover', function () {
          d3.select(this).classed('hover', true);
        })
        .on('mouseout', function () {
          d3.select(this).classed('hover', false);
        })
        .attr('data-label', data.label)
        .attr('fill', () => color(data.label))
        .attr('stroke', () => '#000');

      self.updateBars(bars);

      // Add tooltip
      if (isTooltip) {
        bars.call(tooltip.render());
      }

      return bars;
    }

    /**
     * Determines whether bars are grouped or stacked and updates the D3
     * selection
     *
     * @method updateBars
     * @param bars {D3.UpdateSelection} SVG with rect added
     * @returns {D3.UpdateSelection}
     */
    updateBars(bars) {
      if (this.seriesConfig.mode === 'stacked') {
        return this.addStackedBars(bars);
      }
      return this.addGroupedBars(bars);

    }

    /**
     * Adds stacked bars to column chart visualization
     *
     * @method addStackedBars
     * @param bars {D3.UpdateSelection} SVG with rect added
     * @returns {D3.UpdateSelection}
     */
    addStackedBars(bars) {
      const xScale = this.getCategoryAxis().getScale();
      const yScale = this.getValueAxis().getScale();
      const isHorizontal = this.getCategoryAxis().axisConfig.isHorizontal();
      const isTimeScale = this.getCategoryAxis().axisConfig.isTimeDomain();
      const yMin = yScale.domain()[0];
      const gutterSpacingPercentage = 0.15;
      const groupCount = this.getGroupedCount();
      let groupNum = this.getGroupedNum(this.chartData);
      const isLabels = this.seriesConfig.showValues;
      const labelColor = this.seriesConfig.labelColor;
      const chartData = this.chartData;
      const fontSize = this.seriesConfig.fontSize;
      const fontOrientation = this.seriesConfig.fontOrientation;
      const fontPosition = this.seriesConfig.fontPosition;
      let barWidth;
      let gutterWidth;

      if (isTimeScale) {
        const { min, interval } = this.handler.data.get('ordered');
        let intervalWidth = xScale(min + interval) - xScale(min);
        intervalWidth = Math.abs(intervalWidth);

        gutterWidth = intervalWidth * gutterSpacingPercentage;
        barWidth = (intervalWidth - gutterWidth) / groupCount;
      }

      function x(d, i) {
        if (isTimeScale) {
          return xScale(d.x) + datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount) * groupNum;
        }
        if (groupNum > groupCount) {
          groupNum = groupNum - groupCount;
        }
        return xScale(d.x) + xScale.rangeBand() / groupCount * groupNum;
      }

      function y(d) {
        if ((isHorizontal && d.y < 0) || (!isHorizontal && d.y > 0)) {
          return yScale(d.y0);
        }
        return yScale(d.y0 + d.y);
      }

      // It returns the X position where the text will be drawn
      function labelX(d, i) {
        return x(d, i) + widthFunc(d, i) / 4;
      }

      // It returns the Y position where the text will be drawn
      function labelY(d) {
        if (fontPosition === 'middle') {
          return y(d) + heightFunc(d) / 2;
        }
        if (isHorizontal) {
          return d.y >= 0 ? y(d) - 4 : y(d) + heightFunc(d) + this.getBBox().height;
        }
        return d.y >= 0 ? y(d) + heightFunc(d) + 4 : y(d) - this.getBBox().width - 4;
      }

      // This function returns the formatted value for the field if formatted in the field formatting section.
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

      function widthFunc(d, i) {
        if (isTimeScale) {
          return datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount);
        }
        return xScale.rangeBand() / groupCount;
      }

      function heightFunc(d) {
        // for split bars or for one series,
        // last series will have d.y0 = 0
        if (d.y0 === 0 && yMin > 0) {
          return yScale(yMin) - yScale(d.y);
        }

        return Math.abs(yScale(d.y0) - yScale(d.y0 + d.y));
      }

      // update
      bars
        .attr('x', isHorizontal ? x : y)
        .attr('width', isHorizontal ? widthFunc : heightFunc)
        .attr('y', isHorizontal ? y : x)
        .attr('height', isHorizontal ? heightFunc : widthFunc);

      // if "show values" option is true for the metric then show the values in the chart
      if (isLabels) {
        const layer = d3.select(bars[0].parentNode);
        const barLabels = layer.selectAll('text').data(chartData.values.filter(function (d) {
          return !_.isNull(d.y);
        }));

        barLabels
          .enter()
          .append('text')
          .text(formatValue)
          .attr('font-size', fontSize)
          .attr('style', 'fill:' + labelColor  + ';font-weight:Bold;writing-mode:' + fontOrientation)
          .attr('x', isHorizontal ? labelX : labelY)
          .attr('y', isHorizontal ? labelY : labelX);

      }
      return bars;
    }

    /**
     * Adds grouped bars to column chart visualization
     *
     * @method addGroupedBars
     * @param bars {D3.UpdateSelection} SVG with rect added
     * @returns {D3.UpdateSelection}
     */
    addGroupedBars(bars) {
      const xScale = this.getCategoryAxis().getScale();
      const yScale = this.getValueAxis().getScale();
      const groupCount = this.getGroupedCount();
      let groupNum = this.getGroupedNum(this.chartData);
      const gutterSpacingPercentage = 0.15;
      const isTimeScale = this.getCategoryAxis().axisConfig.isTimeDomain();
      const isHorizontal = this.getCategoryAxis().axisConfig.isHorizontal();
      const isLogScale = this.getValueAxis().axisConfig.isLogScale();
      const isLabels = this.seriesConfig.showValues;
      const labelColor = this.seriesConfig.labelColor;
      const chartData = this.chartData;
      const fontSize = this.seriesConfig.fontSize;
      const fontOrientation = this.seriesConfig.fontOrientation;
      const fontPosition = this.seriesConfig.fontPosition;
      let barWidth;
      let gutterWidth;

      if (isTimeScale) {
        const { min, interval } = this.handler.data.get('ordered');
        let intervalWidth = xScale(min + interval) - xScale(min);
        intervalWidth = Math.abs(intervalWidth);

        gutterWidth = intervalWidth * gutterSpacingPercentage;
        barWidth = (intervalWidth - gutterWidth) / groupCount;
      }

      function x(d, i) {
        if (isTimeScale) {
          return xScale(d.x) + datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount) * groupNum;
        }
        if (groupNum > groupCount) {
          groupNum = groupNum - groupCount;
        }
        return xScale(d.x) + xScale.rangeBand() / groupCount * groupNum;
      }

      function y(d) {
        if ((isHorizontal && d.y < 0) || (!isHorizontal && d.y > 0)) {
          return yScale(0);
        }

        return yScale(d.y);
      }

      // It returns the X position where the text will be drawn
      // We get the width of the bar and devide by 2 to start the
      // text from the middle of the bar.
      function labelX(d, i) {
        return x(d, i) + widthFunc(d, i) / 2;
      }

      // it returns the Y position where the text will be drawn
      function labelY(d) {
        if (fontPosition === 'middle') {
          return y(d) + heightFunc(d) / 4;
        }
        if (isHorizontal) {
          return d.y >= 0 ? y(d) - 4 : y(d) + heightFunc(d) + this.getBBox().height;
        }
        return d.y >= 0 ? y(d) + heightFunc(d) + 4 : y(d) - this.getBBox().width - 4;
      }

      // This function returns the formatted value for the field if formatted in the field formatting section
      // else returns the actual value.
      function formatValue(d) {
        let agg = d.aggConfig;
        let formattedvalue = null;
        const value = d.y;
        if (!d.agg) {
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

      function widthFunc(d, i) {
        if (isTimeScale) {
          return datumWidth(barWidth, d, bars.data()[i + 1], xScale, gutterWidth, groupCount);
        }
        return xScale.rangeBand() / groupCount;
      }

      function heightFunc(d) {
        const baseValue = isLogScale ? 1 : 0;
        return Math.abs(yScale(baseValue) - yScale(d.y));
      }

      // update
      bars
        .attr('x', isHorizontal ? x : y)
        .attr('width', isHorizontal ? widthFunc : heightFunc)
        .attr('y', isHorizontal ? y : x)
        .attr('height', isHorizontal ? heightFunc : widthFunc);

      // if "show values" option is true for the metric then show the values in the chart
      if (isLabels) {
        const layer = d3.select(bars[0].parentNode);
        const barLabels = layer.selectAll('text').data(chartData.values.filter(function (d) {
          return !_.isNull(d.y);
        }));

        // Applies the font size, orientation, position and color for the value
        barLabels
          .enter()
          .append('text')
          .text(formatValue)
          .attr('font-size', fontSize)
          .attr('dy', '-.4em')
          .attr('style', 'writing-mode:' + fontOrientation + ';fill:' + labelColor  + ';font-weight:Bold;padding:50px')
          .attr('x', isHorizontal ? labelX : labelY)
          .attr('y', isHorizontal ? labelY : labelX);
      }
      return bars;
    }

    /**
     * Renders d3 visualization
     *
     * @method draw
     * @returns {Function} Creates the vertical bar chart
     */
    draw() {
      const self = this;

      return function (selection) {
        selection.each(function () {
          const svg = self.chartEl.append('g');
          svg.data([self.chartData]);

          const bars = self.addBars(svg, self.chartData);
          self.addCircleEvents(bars);

          self.events.emit('rendered', {
            chart: self.chartData
          });

          return svg;
        });
      };
    }
  }

  return ColumnChart;
}
