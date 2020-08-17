import d3 from 'd3';
import dateMath from '@elastic/datemath';

export function VislibVisualizationsTimeMarkerProvider() {

  class TimeMarker {

    constructor(times, xScale, height, subType = null) {
      const currentTimeArr = [{
        'time': new Date().getTime(),
        'class': 'time-marker',
        'color': '#c80000',
        'opacity': 0.3,
        'width': 2
      }];

      this.xScale = xScale;
      this.subType = subType;
      this.height = height;
      this.times = (times.length) ? times.map(function (d) {
        return {
          'time': dateMath.parse(d.time),
          'class': d.class || 'time-marker',
          'color': d.color || '#c80000',
          'opacity': d.opacity || 0.3,
          'width': d.width || 2
        };
      }) : currentTimeArr;
    }

    _isTimeBasedChart(selection) {
      const data = selection.data();
      return data.every(function (datum) {
        return (datum.ordered && datum.ordered.date);
      });
    }

    render(selection) {
      const self = this;

      // return if not time based chart
      if (!self._isTimeBasedChart(selection)) return;

      // Interchanging X and Y coordinates in case of horizontal bar
      selection.each(function () {
        let d3Marker = d3.select(this).selectAll('time-marker')
          .data(self.times)
          .enter().append('line');

        d3Marker = d3Marker.attr('class', function (d) {
          return d.class;
        })
          .attr('pointer-events', 'none')
          .attr('stroke', function (d) {
            return d.color;
          })
          .attr('stroke-width', function (d) {
            return d.width;
          })
          .attr('stroke-opacity', function (d) {
            return d.opacity;
          });

        if(self.subType && self.subType === 'horizontal_bar') {
          d3Marker.attr('y1', function (d) {
            return self.xScale(d.time);
          })
            .attr('y2', function (d) {
              return self.xScale(d.time);
            })
            .attr('x1', self.height)
            .attr('x2', self.xScale.range()[0]);
        } else {
          d3Marker.attr('x1', function (d) {
            return self.xScale(d.time);
          })
            .attr('x2', function (d) {
              return self.xScale(d.time);
            })
            .attr('y1', self.height)
            .attr('y2', self.xScale.range()[0]);
        }
      });
    }
  }

  return TimeMarker;
}
