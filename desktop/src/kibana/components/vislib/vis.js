define(function (require) {
  return function VisFactory(d3, Private) {
    var $ = require('jquery');
    var _ = require('lodash');

    var Handler = Private(require('components/vislib/lib/handler'));
    var ResizeChecker = Private(require('components/vislib/lib/resize_checker'));
    var Events = Private(require('factories/events'));
    var chartTypes = Private(require('components/vislib/vis_types'));

    /*
     * Visualization controller. Exposed API for creating visualizations.
     * arguments:
     *  $el => jquery reference to a DOM element
     *  config => object of params for the chart.
      *  e.g. type: 'column', addLegend: true, ...
     */
    _(Vis).inherits(Events);
    function Vis($el, config) {
      if (!(this instanceof Vis)) {
        return new Vis($el, config);
      }
      Vis.Super.apply(this, arguments);

      this.el = $el.get ? $el.get(0) : $el;
      this.ChartClass = chartTypes[config.type];
      this._attr = _.defaults(config || {}, {});

      // bind the resize function so it can be used as an event handler
      this.resize = _.bind(this.resize, this);

      this.resizeChecker = new ResizeChecker(this.el);
      this.resizeChecker.on('resize', this.resize);
    }

    // Exposed API for rendering charts.
    Vis.prototype.render = function (data) {
      if (!data) {
        throw new Error('No valid data!');
      }

      // Save data to this object and new up the Handler constructor
      this.data = data;
      this.handler = new Handler(this);

      try {
        this.handler.render();
      } catch (error) {
        // if involving height and width of the container, log error to screen
        // Because we have to wait for the DOM element to initialize, we do not
        // want to throw an error when the DOM `el` is zero
        if ($(this.el).height() > 0 &&
          error.message === 'The height and/or width of this container is too small for this chart.') {
          this.handler.error(error.message);
        } else {
          console.log(error.message);
        }
      }
    };

    // Resize the chart
    Vis.prototype.resize = function () {
      if (!this.data) {
        // TODO: need to come up with a solution for resizing when no data is available
        return;
      }
      this.render(this.data);
    };

    // Destroy the chart
    Vis.prototype.destroy = function () {
      // Removing chart and all elements associated with it
      d3.select(this.el).selectAll('*').remove();

      // remove event listeners
      this.resizeChecker.off('resize', this.resize);

      // pass destroy call down to owned objects
      this.resizeChecker.destroy();
    };

    // Set attributes on the chart
    Vis.prototype.set = function (name, val) {
      this._attr[name] = val;
      this.render(this.data);
    };

    // Get attributes from the chart
    Vis.prototype.get = function (name) {
      return this._attr[name];
    };

    return Vis;
  };
});