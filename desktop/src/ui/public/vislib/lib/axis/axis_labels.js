import d3 from 'd3';
import $ from 'jquery';
import { truncateLabel } from '../../components/labels/truncate_labels';

export function VislibAxisLabelsProvider() {
  class AxisLabels {
    constructor(axisConfig, scale, chartSubType = null) {
      this.axisConfig = axisConfig;
      this.axisScale = scale;
      this.chartSubType = chartSubType;
    }

    render(selection) {
      selection.call(this.draw());
    }

    rotateAxisLabels() {
      const config = this.axisConfig;
      return function (selection) {
        const text = selection.selectAll('.tick text');

        if (config.get('labels.rotate')) {
          text
            .style('text-anchor', function () {
              const currentValue = $(this).css('text-anchor');
              const rotateDeg = config.get('labels.rotate');
              if (!rotateDeg) return currentValue;
              else {
                const position = config.get('position');
                switch (position) {
                  case 'top': return 'end';
                  case 'bottom': return 'end';
                  default:
                    if (rotateDeg === 90 || rotateDeg === -90) return 'middle';
                    return currentValue;
                }
              }
            })
            .attr('dy', function () {
              return config.isHorizontal() ? '0.3em' : '0';
            })
            .attr('transform', function rotate(d, j) {
              const position = config.get('position');
              const rotateDeg = position === 'top' ? config.get('labels.rotate') : -config.get('labels.rotate');

              if ($(this).css('text-anchor') === 'middle') {
                const coord = text[0][j].getBBox();
                const transX = ((coord.x) + (coord.width / 2));
                const transY = ((coord.y) + (coord.height / 2));
                return `rotate(${rotateDeg}, ${transX}, ${transY})`;
              } else {
                const transX = this.attributes.x.nodeValue;
                const transY = this.attributes.y.nodeValue;
                return `rotate(${rotateDeg}, ${transX}, ${transY})`;
              }
            });
        }
      };
    }

    truncateLabels() {
      const config = this.axisConfig;
      return function (selection) {
        if (!config.get('labels.truncate')) return;

        selection.selectAll('.tick text')
          .text(function () {
            return truncateLabel(this, config.get('labels.truncate'));
          });
      };
    }

    filterAxisLabels() {
      const self = this;
      const config = this.axisConfig;
      let startPos = 0;
      const padding = 1.1;

      return function (selection) {
        if (!config.get('labels.filter')) return;
        selection.selectAll('.tick text')
          .text(function (d) {
            const par = d3.select(this.parentNode).node();
            const el = $(config.get('rootEl')).find(config.get('elSelector'));
            const maxSize = config.isHorizontal() ? el.width() : el.height();
            const myPos = config.isHorizontal() ? self.axisScale.scale(d) : maxSize - self.axisScale.scale(d);
            const mySize = (config.isHorizontal() ? par.getBBox().width : par.getBBox().height) * padding;
            const halfSize = mySize / 2;

            if ((startPos + halfSize) < myPos && maxSize > (myPos + halfSize)) {
              startPos = myPos + halfSize;
              return this.textContent;
            } else {
              d3.select(this.parentNode).remove();
            }
          });
      };
    }

    draw() {
      const self = this;
      const config = this.axisConfig;
      // Custom font color styling for horizontal and vertical bar (ER-2170)
      const fontColorStyle = (this.chartSubType && ['horizontal_bar', 'vertical_bar'].includes(this.chartSubType)) ? 'fill: #5E5E5E;' : '';

      return function (selection) {
        selection.each(function () {
          selection.selectAll('text')
            .attr('style', function () {
              // Adding the style using a callback function
              const currentStyle = d3.select(this).attr('style');
              return `${currentStyle} font-size: ${config.get('labels.fontSize')}; ${fontColorStyle}`;
            });
          if (!config.get('labels.show')) selection.selectAll('text').attr('style', 'display: none;');

          selection.call(self.truncateLabels());
          selection.call(self.rotateAxisLabels());
          selection.call(self.filterAxisLabels());
        });
      };
    }
  }

  return AxisLabels;
}
