define(function (require) {
    'use strict';

    var tip = require('src/tooltip'),
        d3 = require('lib/d3/d3'),
        selectionFn = require('src/utils/selection');

    return function(elem, args) {
        if (typeof args === 'undefined') { args = {}; }

        var chart = {},

        /* ******* Error Handling ******** */
            destroyFlag = false,
        /* ***************************** */

        /* ******* Chart options******* */
            margin = args.margin ? args.margin : { top: 30, right: 50, bottom: 50, left: 50 },
            offset = args.offset ? args.offset : 'zero',
            color = args.color ? d3.scale.linear().range(args.color) : d3.scale.linear().range(['#e24700', '#f9e593']),
            //shareYAxis = args.shareYAxis ? args.shareYAxis : false,
            tooltip = args.tooltip && typeof args.tooltip === 'boolean' && args.tooltip === false ? 'undefined' : typeof args.tooltip === 'function' ?
                tip().attr('class', 'k4-tip').html(args.tooltip).offset([-12, 0]) : tip().attr('class', 'k4-tip').html(function(d) {
                    if (d.y < 1) { return '<span>x: ' + d.x + '</span><br><span>y: ' + d.y.toFixed(2) * 100 + '%</span>'; }
                    return '<span>x: ' + d.x + '</span><br><span>y: ' + d.y + '</span>';
                }).offset([-12, 0]),
        /* ***************************** */

        /* Chart parameters defined within the chart.render function */
            stack = d3.layout.stack().values(function(d) { return d.values; }),
            yGlobalGroupMax, yGlobalStackMax, viz,
            selection, elemWidth, elemHeight, width, height, layers, n, yGroupMax, yStackMax,
            keys, xScale, yScale, xAxis, yAxis, svg, layer, rect;
        /* ***************************** */

        chart.render = function(data) {

            if (destroyFlag || !elem) {
                if (destroyFlag) { throw new Error('you destroyed this chart and then tried to use it again'); }
                else { throw new Error('there is no element present'); }
            }

            // Max y values for grouped and stacked data
            /*
             yGlobalGroupMax = yGroupMaxFn(data);
             yGlobalStackMax = yGroupStackFn(data);
             */

            // Selection function - returns an array of DOM elements with data bound
            selection = d3.selectAll(selectionFn(elem, data));

            selection.each(function (d, i) {
                //console.log(d, i, this);
                viz = d3.select(this);

                // removes elements to redraw the chart on subsequent calls
                viz.selectAll('*').remove();

                // width, height, margins
                elemWidth = parseInt(d3.select(this).style('width'), 10);
                elemHeight = parseInt(d3.select(this).style('height'), 10);
                width = elemWidth - margin.left - margin.right; // width of the parent element ???
                height = elemHeight - margin.top - margin.bottom; // height of the parent element ???

                // preparing the data and scales
                stack.offset(offset);
                layers = stack(d.layers);
                n = layers.length; // number of layers
                yGroupMax = d3.max(layers, function (layer) { return d3.max(layer.values, function (d) { return d.y; }); });
                yStackMax = d3.max(layers, function (layer) { return d3.max(layer.values, function (d) { return d.y0 + d.y; }); });
                keys = d3.set(layers[0].values.map(function (d) { return d.x; })).values();

                // axis components
                xScale = d3.scale.ordinal().domain(keys).rangeRoundBands([0, width], 0.1);
                yScale = d3.scale.linear().range([height, 0]).nice();
                xAxis = d3.svg.axis().scale(xScale).tickSize(3, 0).tickPadding(6).orient('bottom');
                yAxis = d3.svg.axis().scale(yScale).ticks(6).tickSize(-width, 0).tickPadding(4).orient('left');
                
                // setting the y scale domain
                if (offset === 'group') {
                    /* if (shareYAxis) { yScale.domain([0, yGlobalGroupMax]); } */
                    yScale.domain([0, yGroupMax]);
                } else {
                    /* if (shareYAxis) { yScale.domain([0, yGlobalStackMax]); } */
                    yScale.domain([0, yStackMax]);
                }

                // maps color domain to range
                color.domain([0, n - 1]);

                // canvas
                svg = d3.select(this).append('svg')
                    .attr('class', 'canvas')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                // background rect
                svg.append('rect')
                    .attr('class', 'bkgd')
                    .style('fill', '#fff')
                    .style('opacity', 0.35)
                    .attr('width', width)
                    .attr('height', height);

                // x axis
                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .style('stroke-width', 0.5) // should probably be in the css file
                    .call(xAxis);

                // y axis
                svg.append('g')
                    .attr('class', 'y axis')
                    .style('stroke-width', 0.5) // should probably be in the css file
                    .call(yAxis);

                // layers
                layer = svg.selectAll('.layer')
                    .data(function (d) { return d.layers; })
                    .enter().append('g')
                    .attr('class', function (d, i) { return 'layer ' + i; })
                    .style('fill', function (d, i) { return color(i); });

                // enter
                rect = layer.selectAll('rect')
                    .data(function (d) { return d.values; })
                    .enter().append('rect')
                    .attr('class', function (d, i) { return 'rect ' + i; });

                // update with transition
                switch (offset) {
                    case 'group':
                        rect
                            //.attr('x', function (d, i, j) { return xScale(d.x) + xScale.rangeBand() / n * j; })
                            //.attr('width', xScale.rangeBand() / n)
                            //.attr('y', height)
                            //.attr('height', 0)
                            //.transition()
                            //.duration(500)
                            //.delay(function (d, i) { return i * 10; })
                            .attr('x', function (d, i, j) { return xScale(d.x) + xScale.rangeBand() / n * j; })
                            .attr('width', xScale.rangeBand() / n)
                            .attr('y', function (d) { return yScale(d.y); })
                            .attr('height', function (d) { return height - yScale(d.y); })
                            .on('mouseover', mouseover)
                            .on('mouseout', mouseout)
                            .on('mousemove', mousemove)
                            .on('click', click);
                        break;

                    default:
                        rect
                            //.attr('x', function (d) { return xScale(d.x); })
                            //.attr('width', xScale.rangeBand())
                            //.attr('y', height)
                            //.attr('height', 0)
                            //.transition()
                            //.duration(500)
                            //.delay(function (d, i) { return i * 10; })
                            .attr('x', function (d) { return xScale(d.x); })
                            .attr('width', xScale.rangeBand())
                            .attr('y', function (d) { return yScale(d.y0 + d.y); })
                            .attr('height', function (d) { return yScale(d.y0) - yScale(d.y0 + d.y); })
                            .on('mouseover', mouseover)
                            .on('mouseout', mouseout)
                            .on('mousemove', mousemove)
                            .on('click', click);
                        break;
                }

                // exit
                layer.selectAll('rect').data(function(d) { return d.values; }).exit().remove();

                // tooltip
                if (tooltip) { svg.call(tooltip); }

                // Window resize
                d3.select(window).on('resize', resize);

                return svg;
            });

            return chart;
        };

        /*
        function yGroupMaxFn(data) {
            if (data.rows) {
                return yGlobalGroupMax = d3.max(data.rows.map(function(a) {
                    return d3.max(a.columns, function(b) {
                        return d3.max(b.layers, function(c) {
                            return d3.max(c.values, function(d) {
                                return d.y;
                            });
                        });
                    });
                }));
            } else {
                return yGlobalGroupMax = d3.max(data.columns.map(function(a) {
                    return d3.max(a.rows, function(b) {
                        return d3.max(b.layers, function(c) {
                            return d3.max(c.values, function(d) {
                                return d.y;
                            });
                        });
                    });
                }));
            }
        }

        function yGroupStackFn(data) {
            if (data.rows) {
                return yGlobalStackMax = d3.max(data.rows.map(function(a) {
                    return d3.max(a.columns, function(b) {
                        return d3.max(stack(b.layers), function(c) {
                            return d3.max(c.values, function(d) {
                                return d.y0 + d.y;
                            });
                        });
                    });
                }));
            } else {
                return  yGlobalStackMax = d3.max(data.columns.map(function(a) {
                    return d3.max(a.rows, function(b) {
                        return d3.max(stack(b.layers), function(c) {
                            return d3.max(c.values, function(d) {
                                return d.y0 + d.y;
                            });
                        });
                    });
                }));
            }
        }
        */

        function resize() {
            selection.each(function(d) {
                svg = d3.select(this);

                // width, height, margins
                elemWidth = parseInt(d3.select(this).style('width'), 10);
                elemHeight = parseInt(d3.select(this).style('height'), 10);
                width = elemWidth - margin.left - margin.right;
                height = elemHeight - margin.top - margin.bottom;

                // axis components
                xScale.rangeRoundBands([0, width], 0.1);
                yScale.range([height, 0]).nice();

                // preparing the data and scales
                layers = stack(d.layers);
                yGroupMax = d3.max(layers, function (layer) { return d3.max(layer.values, function (d) { return d.y; }); });
                yStackMax = d3.max(layers, function (layer) { return d3.max(layer.values, function (d) { return d.y0 + d.y; }); });

                // setting the y scale domain
                if (offset === 'group') {
                    yScale.domain([0, yGroupMax]);
                } else {
                    yScale.domain([0, yStackMax]);
                }

                // canvas
                svg
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)

                // background rect
                svg.select('rect.bkgd').attr('width', width).attr('height', height);

                // update axes
                svg.select('.x.axis').call(xAxis.scale(xScale));
                svg.select('.y.axis').call(yAxis.scale(yScale).tickSize(-width, 0));

                rect = svg.selectAll('rect.rect');

                // update with transition
                switch (offset) {
                    case 'group':
                        rect
                            /*
                            .attr('x', function(d, i, j) { return xScale(d.x) + xScale.rangeBand() / n * j; })
                            .attr('width', xScale.rangeBand() / n)
                            .attr('y', height)
                            .attr('height', 0)
                            .transition()
                            .duration(500)
                            */
                            .attr('x', function(d, i, j) { return xScale(d.x) + xScale.rangeBand() / n * j; })
                            .attr('width', xScale.rangeBand() / n)
                            .attr('y', function(d) { return yScale(d.y); })
                            .attr('height', function(d) { return height - yScale(d.y); });
                        break;

                    default:
                        rect
                            /*
                            .attr('x', function(d) { return xScale(d.x); })
                            .attr('width', xScale.rangeBand())
                            .attr('y', height)
                            .attr('height', 0)
                            .transition()
                            .duration(500)
                            */
                            .attr('x', function(d) { return xScale(d.x); })
                            .attr('width', xScale.rangeBand())
                            .attr('y', function(d) { return yScale(d.y0 + d.y); })
                            .attr('height', function(d) { return yScale(d.y0) - yScale(d.y0 + d.y); });
                        break;
                }
            });
        }

        // event handlers
        function mouseover(e) {
            mouseHandler('mouseover', e, d3.mouse(this), this);
            //toolTip.show(e);
        }

        function mouseout(e) {
            mouseHandler('mouseout', e, d3.mouse(this), this);
            //toolTip.hide(e);
        }

        function mousemove(e) {
            mouseHandler('mousemove', e, d3.mouse(this), this);
            //toolTip.show( e, d3.mouse( this ) );
        }

        function click(e) {
            mouseHandler('click', e, d3.mouse(this), this);
        }

        function drag(e) {
            //console.log('drag');
        }

        function mouseHandler(type, e, mouse, target) {
            //console.log( type, e, mouse, target );
        }

        // getters / setters
        chart.margin = function(_) {
            if (!arguments.length) { return margin; }
            margin = _;
            return chart;
        };

        chart.offset = function(_) {
            if (!arguments.length) { return offset; }
            offset = _;
            return chart;
        };

        chart.tooltip = function(_) {
            if (!arguments.length) { return tooltip; }
            tooltip = _;
            return chart;
        };

        chart.width = function(_) {
            if (!arguments.length) { return elemWidth; }
            elemWidth = _;
            return chart;
        };

        chart.height = function(_) {
            if (!arguments.length) { return elemHeight; }
            elemHeight = _;
            return chart;
        };

        chart.color = function(_) {
            if (!arguments.length) { return color; }
            color = d3.scale.linear().range(_);
            return chart;
        };

        chart.destroy = function(_) {
            /*
                Destroys all charts associated with the parent element
                if the argument passed is true. By default the argument
                is true.
            */
            if (!arguments.length || _) {
                destroyFlag = _ || true;
                d3.select(elem).selectAll('*').remove();
            }
            destroyFlag = _;
            return chart;
        };

        chart.on = function(_, callback) {
            if (!arguments.length) { return; }
            // Code
            if (_ === 'click') {
                clickEvent = callback;
            } else if (_ === 'hover') {
                hoverEvent = callback;
            } else {
                dragEvent = callback;
            }
            return chart;
        };

        return chart;
    };
});
