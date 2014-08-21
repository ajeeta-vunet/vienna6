define(function (require) {
  return function LegendFactory(d3, Private) {
    var _ = require('lodash');

    var createHeader = Private(require('components/vislib/components/Legend/header'));
    var createList = Private(require('components/vislib/components/Legend/list'));
    var classify = Private(require('components/vislib/components/Legend/classify'));

    // Dynamically adds css file
    require('css!components/vislib/components/styles/main');

    function Legend(legend, config) {
      this.labels = legend.labels;
      this.color = legend.color;
      this._attr = _.defaults(config || {}, {
        'legendClass' : 'legend-col-wrapper',
        'blurredOpacity' : 0.3,
        'focusOpacity' : 1,
        'defaultOpacity' : 1,
        'isOpen' : false
      });
    }

    Legend.prototype.render = function () {
      var legendDiv = d3.select('.' + this._attr.legendClass);
      var items = this.labels;
      var header = createHeader(legendDiv);
      var headerIcon = d3.select('.legend-toggle');
      var list = createList(legendDiv, items, this);
      var that = this;

      // toggle
      headerIcon.on('click', function (d) {
        if (that._attr.isOpen) {
          // close legend
          d3.select('.' + that._attr.legendClass)
            .classed('open4', false);
          d3.select('ul.legend-ul')
            .classed('hidden', true);
          that._attr.isOpen = false;
          
        } else {
          // open legend
          d3.select('.' + that._attr.legendClass)
            .classed('open4', true);
          d3.select('ul.legend-ul')
            .classed('hidden', false);
          that._attr.isOpen = true;
        }
      });

      d3.selectAll('.color')
        .on('mouseover', function (d) {
          var liClass = '.' + classify(that.color(d));
          d3.selectAll('.color').style('opacity', that._attr.blurredOpacity);
          
          // select series on chart
          d3.selectAll(liClass).style('opacity', that._attr.focusOpacity);

          d3.selectAll('.color')
            .style('opacity', that._attr.blurredOpacity);
          
          // Select series on chart
          d3.selectAll(liClass)
            .style('opacity', that._attr.focusOpacity);
        });

      d3.selectAll('.color')
        .on('mouseout', function () {
          d3.selectAll('.color').style('opacity', that._attr.defaultOpacity);
        });

      // add/remove class to open legend
      if (this._attr.isOpen) {
        d3.select('.' + this._attr.legendClass)
          .classed('open4', true);
      } else {
        d3.select('.' + this._attr.legendClass)
          .classed('open4', false);
      }

    };

    Legend.prototype.set = function (name, val) {
      this[name] = val;
    };

    Legend.prototype.get = function (name) {
      return this[name];
    };

    return Legend;
  };
});