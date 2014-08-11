define(function (require) {
  return function ChartBaseClass(d3, Private) {
    var _ = require('lodash');
    var $ = require('jquery');

    var ChartFunctions = Private(require('components/vislib/modules/_functions'));
    var XAxis = Private(require('components/vislib/modules/XAxis'));
    var YAxis = Private(require('components/vislib/modules/YAxis'));
    var renderChart = Private(require('components/vislib/components/_chart/_render'));

    _(Chart).inherits(ChartFunctions);
    function Chart(vis) {
      Chart.Super.apply(this, arguments);
      this.el = vis.el;
      this.config = vis.config;
      this.ChartClass = vis.ChartClass;
      this._attr = _.defaults(vis.config || {}, {});
    }

    Chart.prototype.render = function (data) {
      if (!data) {
        throw new Error('No valid data');
      }

      this.data = data;
      this.labels = this.getLabels(this.data);
      this.color = this.getColor(this.labels);

      return renderChart(this);
    };

    Chart.prototype.callXAxis = function () {
      return new XAxis(this);
    };

    Chart.prototype.callYAxis = function () {
      return new YAxis(this);
    };

    Chart.prototype.resize = _.debounce(function () {
      if (!this.data) {
        throw new Error('No valid data');
      }

      this.render(this.data);
    }, 200);

    Chart.prototype.checkSize = function () {
      // enable auto-resize
      var size = $('.chart').width() + ':' + $('.chart').height();

      if (this.prevSize !== size) {
        this.resize();
      }
      this.prevSize = size;
      setTimeout(this.checkSize, 250);
    };

//    Chart.prototype.on = function () {};
//    Chart.prototype.off = function () {};
//    Chart.prototype.destroy = function () {};

    Chart.prototype.set = function (name, val) {
      this._attr[name] = val;
      this.render();
    };

    Chart.prototype.get = function (name) {
      return this._attr[name];
    };

    return Chart;
  };
});