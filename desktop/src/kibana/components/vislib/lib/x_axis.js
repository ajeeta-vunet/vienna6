define(function (require) {
  return function XAxisFactory(d3, Private) {
    var $ = require('jquery');
    var _ = require('lodash');

    var ErrorHandler = Private(require('components/vislib/lib/_error_handler'));
    var ChartTitle = Private(require('components/vislib/lib/chart_title'));

    /*
     * Add an x axis to the visualization
     * aruments =>
     *  el => reference to DOM element
     *  xValues => array of x values from the dataset
     *  ordered => data object that is defined when the data is ordered
     *  xAxisFormatter => function to formatx axis tick values
     *  _attr => visualization attributes
     */
    function XAxis(args) {
      if (!(this instanceof XAxis)) {
        return new XAxis(args);
      }

      this.el = args.el;
      this.xValues = args.xValues;
      this.ordered = args.ordered;
      this.xAxisFormatter = args.xAxisFormatter;
      this._attr = _.defaults(args._attr || {}, {
        // isDiscover: false,
        //isRotated: true
      });
    }

    _(XAxis.prototype).extend(ErrorHandler.prototype);

    // Render the x axis
    XAxis.prototype.render = function () {
      d3.select(this.el).selectAll('.x-axis-div').call(this.draw());
    };

    // Get the d3 scale
    XAxis.prototype.getScale = function (ordered) {
      // if time, return time scale
      if (ordered && ordered.date) {
        return d3.time.scale();
      }
      // return d3 ordinal scale for nominal data
      return d3.scale.ordinal();
    };

    // Add domain to the scale
    XAxis.prototype.getDomain = function (scale, ordered) {
      // if time, return a time domain
      if (ordered && ordered.date) {
        // Calculate the min date, max date, and time interval;
        return this.getTimeDomain(scale, ordered);
      }
      // return a nominal domain, i.e. array of x values
      return this.getOrdinalDomain(scale, this.xValues);
    };

    // Returns a time domain
    XAxis.prototype.getTimeDomain = function (scale, ordered) {
      return scale.domain([ordered.min, ordered.max]);
    };

    // Return a nominal(d3 ordinal) domain
    XAxis.prototype.getOrdinalDomain = function (scale, xValues) {
      
      return scale.domain(xValues);
    };

    // Return the range for the x axis scale
    XAxis.prototype.getRange = function (scale, ordered, width) {
      // if time, return a normal range
      if (ordered && ordered.date) {
        return scale.range([0, width]);
      }
      // if nominal, return rangeBands with a default (0.1) spacer specified
      return scale.rangeBands([0, width], 0.1);
    };

    // Return the x axis scale
    XAxis.prototype.getXScale = function (ordered, width) {
      var scale = this.getScale(ordered);
      var domain = this.getDomain(scale, ordered);
      var xScale = this.getRange(domain, ordered, width);

      return xScale;
    };

    // Create the d3 xAxis function
    XAxis.prototype.getXAxis = function (width) {
      // save a reference to the xScale
      this.xScale = this.getXScale(this.ordered, width);

      // Scale should never === `NaN`
      if (!this.xScale || _.isNaN(this.xScale)) {
        throw new Error('xScale is ' + this.xScale);
      }

      // save a reference to the xAxis
      this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        .ticks(10)
        .tickFormat(this.xAxisFormatter)
        .orient('bottom');
    };

    // Returns a function that renders the x axis
    XAxis.prototype.draw = function () {
      var self = this;
      var margin = this._attr.margin;
      var div;
      var width;
      var height;
      var svg;
      this._attr.isRotated = false;

      return function (selection) {

        selection.each(function () {
          div = d3.select(this);
          width = $(this).width();
          height = $(this).height();

          // Validate that the width and height are not 0 or `NaN`
          self.validateWidthandHeight(width, height);

          // Return access to xAxis variable on the object
          self.getXAxis(width);

          // Append svg and x axis
          svg = div.append('svg')
            .attr('width', width)
            .attr('height', height);

          svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,0)')
            .call(self.xAxis);
        });

        selection.call(self.filterOrRotate());
      };
    };

    // Returns a function that evaluates scale type and applies 
    // filters tick labels on time scales
    // rotates and truncates labels on nominal/ordinal scales
    XAxis.prototype.filterOrRotate = function () {
      var self = this;
      var ordered = self.ordered;
      var axis;
      var labels;

      return function (selection) {
        selection.each(function () {
          axis = d3.select(this);
          labels = axis.selectAll('.tick text');
          
          if (!self.ordered) {
            // nominal/ordinal scale
            //axis.call(self.rotateAxisLabels());
            axis.call(self.truncateLabels(200));
          } else {
            // time scale
            axis.call(self.filterAxisLabels());
          }
        });

        selection.call(self.fitTitles());
      };
    };

    // Rotate the axis tick labels within selection
    XAxis.prototype.rotateAxisLabels = function () {
      this._attr.isRotated = true;
      return function (selection) {
        selection.selectAll('.tick text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '-.60em')
          .attr('transform', function () {
            return 'rotate(-90)';
          });
      };
    };

    // Returns a function that truncates tick labels
    XAxis.prototype.truncateLabels = function (size) {
      var self = this;
      var labels;
      var node;
      var str;
      var n;
      var maxWidth;
      var maxLength;
      var pixPerChar;
      var endChar;

      return function (selection) {
        
        // get label maxWidth
        labels = selection.selectAll('.tick text');
        maxWidth = 0;
        maxLength = 0;
        labels.each(function () {
          node = d3.select(this).node();
          n = node.innerHTML.length;
          maxWidth = _.max([maxWidth, node.getComputedTextLength() * 0.9]);
          maxLength = _.max([maxLength, n]);
        });
        pixPerChar = maxWidth / maxLength;

        // truncate str
        selection.selectAll('.tick text')
          .text(function (d) {
            str = d;
            if (maxWidth > size) {
              endChar = 0;
              if (Math.floor((size / pixPerChar) - 4) >= 4) {
                endChar = Math.floor((size / pixPerChar) - 4);
                while (str[endChar - 1] === ' ' || str[endChar - 1] === '-' || str[endChar - 1] === ',') {
                  endChar = endChar - 1;
                }
              }
              str = str.substr(0, endChar) + '...';
              return str;
            }
            return str;
          });
      };
    };

    // Filter out text labels by width and position on axis
    XAxis.prototype.filterAxisLabels = function () {
      var self = this;
      var startX = 0;
      var maxW;
      var par;
      var myX;
      var myWidth;
      var halfWidth;

      return function (selection) {
        selection.selectAll('.tick text')
          .text(function (d, i) {
            par = d3.select(this.parentNode).node();
            myX = self.xScale(d);
            myWidth = par.getBBox().width;
            halfWidth = par.getBBox().width / 2;
            maxW = $('.x-axis-div').width();

            // trims labels that would overlap each other 
            // or extend past left or right edges
            // if prev label pos (or 0) + half of label width is < label pos
            // and label pos + half width  is not > width of axis
            if ((startX + halfWidth) < myX && maxW > (myX + halfWidth)) {
              startX = myX + halfWidth;
              return self.xAxisFormatter(d);
            } else {
              d3.select(this.parentNode).remove();
            }
          });
      };
    };

    // Returns a function that adjusts axis title and
    // all chart title transforms to fit axis labels
    XAxis.prototype.fitTitles = function () {
      var self = this;
      var visEls = $('.vis-wrapper');
      var visEl;
      var xAxisTitle;
      var xAxisChartTitle;
      var titleWidth;
      var text;
      var titles;

      return function () {
        visEls.each(function () {
          visEl = this;
          // set transform of x-axis-title to fit .x-axis-title div width
          xAxisTitle = $(this).find('.x-axis-title');
          titleWidth = xAxisTitle.width();

          text = d3.select(this).select('.x-axis-title')
            .select('svg')
            .attr('width', titleWidth)
            .select('text')
            .attr('transform', 'translate(' + (titleWidth / 2) + ',11)');

          // if x-axis-chart-titles, set transform of x-axis-chart-titles
          // to fit .chart-title div width
          if ($(this).find('.x-axis-chart-title').length) {
            xAxisChartTitle = $(this).find('.x-axis-chart-title');
            titleWidth = xAxisChartTitle.find('.chart-title').width();
            
            titles = d3.select(this).select('.x-axis-chart-title').selectAll('.chart-title');
            titles.each(function () {
              text = d3.select(this)
                .select('svg')
                .attr('width', titleWidth)
                .select('text')
                .attr('transform', 'translate(' + (titleWidth / 2) + ',11)');
            });
          }
          
        });
        
      };
    };

    return XAxis;
  };
});
