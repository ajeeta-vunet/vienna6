define(function (require) {
  var angular = require('angular');
  var _ = require('lodash');
  var $ = require('jquery');

  // Data
  var series = require('vislib_fixtures/mock_data/date_histogram/_series');
  var columns = require('vislib_fixtures/mock_data/date_histogram/_columns');
  var rows = require('vislib_fixtures/mock_data/date_histogram/_rows');
  var stackedSeries = require('vislib_fixtures/mock_data/date_histogram/_stacked_series');
  var termSeries = require('vislib_fixtures/mock_data/terms/_series');
  var termColumns = require('vislib_fixtures/mock_data/terms/_columns');
  var dataArray = [
    series,
    columns,
    rows,
    stackedSeries,
    termSeries,
    termColumns
  ];
  var names = [
    'series',
    'columns',
    'rows',
    'stackedSeries',
    'term series',
    'term columns'
  ];
  var modes = [
    'stacked',
    'grouped',
    'percentage',
    'stacked',
    'grouped',
    'percentage'
  ];

  angular.module('ColumnChartFactory', ['kibana']);

  dataArray.forEach(function (data, i) {
    describe('VisLib Column Chart Test Suite for ' + names[i] + ' Data', function () {
      var vis;
      var visLibParamms = {
        type: 'histogram',
        addLegend: true,
        addTooltip: true,
        mode: modes[i]
      };

      beforeEach(function () {
        module('AreaChartFactory');
      });

      beforeEach(function () {
        inject(function (Private) {
          vis = Private(require('vislib_fixtures/_vis_fixture'))(visLibParamms);
          require('css!components/vislib/styles/main');

          vis.render(data);
        });
      });

      afterEach(function () {
        $(vis.el).remove();
        vis = null;
      });

      describe('stackData method', function () {
        var stackedData;
        var isStacked;

        beforeEach(function () {
          vis.handler.charts.forEach(function (chart) {
            stackedData = chart.stackData(chart.chartData);

            isStacked = stackedData.every(function (arr) {
              return arr.every(function (d) {
                return _.isNumber(d.y0);
              });
            });
          });
        });

        it('should append a d.y0 key to the data object', function () {
          expect(isStacked).to.be(true);
        });
      });

      describe('addBars method', function () {
        it('should append rects', function () {
          var numOfSeries;
          var numOfValues;
          var product;

          vis.handler.charts.forEach(function (chart) {
            numOfSeries = chart.chartData.series.length;
            numOfValues = chart.chartData.series[0].values.length;
            product = numOfSeries * numOfValues;

            expect($(chart.chartEl).find('rect').length).to.be(product);
          });
        });
      });

      describe('updateBars method', function () {
        beforeEach(function () {
          vis.handler._attr.mode = 'grouped';
          vis.render(vis.data);
        });

        it('should returned grouped bars', function () {
          vis.handler.charts.forEach(function (chart) {
            console.log('did it!');
          });
        });
      });

      describe('addStackedBars method', function () {});

      describe('addGroupedBars method', function () {});

      describe('addBarEvents method', function () {
        var rect;
        var d3selectedRect;
        var onClick;
        var onMouseOver;

        beforeEach(function () {
          inject(function (d3) {
            vis.handler.charts.forEach(function (chart) {
              rect = $(chart.chartEl).find('rect')[0];
              d3selectedRect = d3.select(rect)[0][0];

              // d3 instance of click and hover
              onClick = (!!d3selectedRect.__onclick);
              onMouseOver = (!!d3selectedRect.__onmouseover);
            });
          });
        });

        it('should attach a click event', function () {
          vis.handler.charts.forEach(function () {
            expect(onClick).to.be(true);
          });
        });

        it('should attach a hover event', function () {
          vis.handler.charts.forEach(function () {
            expect(onMouseOver).to.be(true);
          });
        });
      });

      describe('draw method', function () {
        it('should return a function', function () {
          vis.handler.charts.forEach(function (chart) {
            expect(_.isFunction(chart.draw())).to.be(true);
          });
        });
      });

      describe('containerTooSmall error', function () {
        beforeEach(function () {
          $(vis.el).height(0);
          $(vis.el).width(0);
        });

        it('should throw an error', function () {
          vis.handler.charts.forEach(function (chart) {
            expect(function () {
              chart.render();
            }).to.throwError();
          });
        });
      });
    });
  });
});
