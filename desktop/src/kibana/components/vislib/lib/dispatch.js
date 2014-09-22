define(function (require) {
  return function DispatchClass(d3, Private) {
    var _ = require('lodash');

    /**
     * Events Class
     */
    function Dispatch(vis, chartData) {
      if (!(this instanceof Dispatch)) {
        return new Dispatch(vis, chartData);
      }
      var type = vis._attr.type;

      this.vis = vis;
      this.chartData = chartData;
      this.color = type === 'pie' ? vis.data.getPieColorFunc() : vis.data.getColorFunc();
      this._attr = _.defaults(vis._attr || {}, {
        yValue: function (d) {
          return d.y;
        },
        dispatch: d3.dispatch('brush', 'click', 'hover', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout')
      });
    }

    // Response to `click` and `hover` events
    Dispatch.prototype.eventResponse = function (d, i) {
      var label = d.label ? d.label : d.name;
      var getYValue = this._attr.yValue;
      var color = this.color;
      var chartData = this.chartData;
      var attr = this._attr;
      var vis = this.vis;

      // Adding a look up for the field. Currently this relies on filtering the
      // data for the label then using that with the pointIndex to get the aggConfig.
      // It works for now... but we need something a little more robust. That will
      // come after the first beta. :)
      //
      // TODO: Replace the following code with something more robust for finding the field
      var field, series, aggConfig;
      if (d.label) {
        series = _.find(this.chartData.series, { label: d.label });
        aggConfig = _.last(series.values[i].aggConfigs);
        if (aggConfig.aggType.name === 'terms') {
          field = aggConfig.field.name;
        }
      }

      return {
        value     : getYValue(d, i),
        point     : d,
        label     : label,
        color     : color(label),
        pointIndex: i,
        series    : chartData.series,
        config    : attr,
        data      : chartData,
        e         : d3.event,
        field     : field,
        aggConfig : aggConfig,
        vis       : vis
      };
    };

    // Add brush to the svg
    Dispatch.prototype.addBrush = function (xScale, svg) {
      var dispatch = this._attr.dispatch;
      var attr = this._attr;
      var chartData = this.chartData;
      var isBrush = this._attr.addBrushing;
      var height = this._attr.height;
      var margin = this._attr.margin;

      // Brush scale
      var brush = d3.svg.brush()
        .x(xScale)
        .on('brushend', function brushEnd() {
          // response returned on brush
          return dispatch.brush({
            range: brush.extent(),
            config: attr,
            e: d3.event,
            data: chartData
          });
        });

      // if `addBrushing` is true, add brush canvas
      if (isBrush) {
        return svg.append('g')
          .attr('class', 'brush')
          .call(brush)
          .selectAll('rect')
          .attr('height', height - margin.top - margin.bottom);
      }
    };

    return Dispatch;
  };
});
