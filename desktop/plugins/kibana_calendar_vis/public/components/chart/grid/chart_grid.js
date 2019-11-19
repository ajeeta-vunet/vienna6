/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import { GridConfig } from './grid_config';
import { VIS_CHART_TYPE } from '../../../lib';
import { getMonthInterval, TIME_FORMAT } from '../../../utils';
import './chart_grid.less';
import { expandView } from '../../../lib/events';

export class ChartGrid extends React.Component {
  constructor(props) {
    super(props);
    const { gridConfig } = this.props;
    this.gridConfig = new GridConfig(gridConfig);
    this.chartGrid = undefined;
    this.chartId = this.props.id;
  }

  componentDidMount() {
    this._render(this.props.vislibData);
    this.props.renderComplete();
  }

  render() {
    return (
      <svg id="all-days" ref={e => {this.chartGrid = e;}} />
    );
  }

  _render(vislibData) {

    const [cellSize, xOffset, yOffset] = this.gridConfig.get(['cellSize', 'xOffset', 'yOffset']);
    const { series } = vislibData;

    const wrapper = {
      year: moment(series[0].values[0].x).format('YYYY'),
      aggs: series[0].values,
      cellSize: cellSize,
      xOffset: xOffset,
      yOffset: yOffset
    };

    this._drawGrid(this.chartId, this.chartGrid, wrapper);
  }

  componentWillUnmount() {
    d3.select(this.chartGrid).remove();
    this.chartGrid = null;
  }

  _getMonthInterval(values) {
    const startDate = _.head(values).x;
    const endDate = _.last(values).x;
    return getMonthInterval(startDate, endDate);
  }

  _getMonth(values) {
    return new Date(_.head(values).x).getMonth();
  }

  _getDate(values) {
    return new Date(_.head(values).x).getDate();
  }

  _drawGrid(chartId, svg, { year, aggs, cellSize, xOffset, yOffset }) {
    const { type, dispatcher } = this.props;

    if(type === VIS_CHART_TYPE.HEATMAP_YEAR) {
      const [startMonth, endMonth] = this._getMonthInterval(aggs);
      const startFullDate = new Date(parseInt(year), startMonth - 1, 1);
      const endFullDate = new Date(parseInt(year), endMonth, 1);
      const startDateWeek = moment(startFullDate).week();
      const weeksInCurrentYear = moment(startFullDate).weeksInYear();
      const previousYear = moment(startFullDate).format('YYYY') - 1;
      const weeksInPreviousYear = moment(previousYear, 'YYYY').weeksInYear();
      let shiftWeekFlag = false;

      d3.select(svg)
        .selectAll('.day')
        .data(d3.time.days(startFullDate, endFullDate))
        .enter().append('g').append('rect')
        .attr('id', (d) => {
          return 'day-' + moment(d).format(TIME_FORMAT) + '-' + chartId;
        })
        .classed('day', true)
        .attr('data-year', () => year)
        .attr('data-month', (d) => `${moment(d).month() + 1}`)
        .attr('data-day', (d) => `${moment(d).date()}`)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('x', (d) => {
          let calc = undefined;

          // moment.week() on first week of Jan can return 53/52/1
          // moment.week() on last week of Dec can return 53/52/1
          // If year begins with Jan, logic is based on weeksInPreviousYear
          // If year doesn't begin with Jan, logic is based on weeksInCurrentYear
          // Special case, when last week of Dec is 1. We get the weekNo of 2nd last week and incement it by 1
          if (moment(d).format('MMM') === 'Jan') {
            calc = (moment(d).week() % weeksInPreviousYear) - (startDateWeek % weeksInPreviousYear);
            shiftWeekFlag = true; // shiftWeekFlag used to track if year begins with Jan
          } else if (moment(d).format('MMM') === 'Dec' && moment(d).week() === 1) {
            calc = shiftWeekFlag ?
              weeksInPreviousYear - (startDateWeek % weeksInPreviousYear) + 1 :
              weeksInCurrentYear - (startDateWeek % weeksInCurrentYear) + 1;
          } else if (shiftWeekFlag) {
            calc = moment(d).week() - (startDateWeek % weeksInPreviousYear);
          } else {
            calc = moment(d).week() - (startDateWeek % weeksInCurrentYear);
          }

          return (moment(d).month() - startMonth + 1) * 1.5 * cellSize +
            xOffset * 2 + (calc * cellSize);
        })
        .attr('y', (d) => {
          return yOffset * 3 + (moment(d).weekday() * cellSize);
        })
        .attr('rx', cellSize * 1 / 10)
        .attr('ry', cellSize * 1 / 10);
      dispatcher.newMapping()
        .addSource('.data-day')
        .addDataTarget('[data-day]')
        .addEvent('click', expandView);
    } else if (type === VIS_CHART_TYPE.HEATMAP_MONTH) {
      const month = this._getMonth(aggs);
      const startDate = new Date(parseInt(year), month, 1);
      const endDate = new Date(parseInt(year), month + 1, 1);
      const weeksInCurrentYear = moment(startDate).weeksInYear();
      const previousYear = moment(startDate).format('YYYY') - 1;
      const weeksInPreviousYear = moment(previousYear, 'YYYY').weeksInYear();

      d3.select(svg)
        .selectAll('.day')
        .data(d3.time.days(startDate, endDate))
        .enter().append('g').append('rect')
        .attr('id', (d) => {
          return 'day-' + moment(d).format(TIME_FORMAT) + '-' + chartId;
        })
        .classed('day', true)
        .attr('data-year', () => year)
        .attr('data-month', (d) => `${moment(d).month() + 1}`)
        .attr('data-day', (d) => `${moment(d).date()}`)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('x', (d) => {
          return xOffset * 2 + (moment(d).weekday() * cellSize);
        })
        .attr('y', (d) => {
          let calc = undefined;

          // moment.week() on first week of Jan can return 53/52/1
          // moment.week() on last week of Dec can return 53/52/1
          // If month is Jan, logic is based on weeksInPreviousYear
          // If month isn't Jan, logic is based on weeksInCurrentYear
          // Special case, when last week of Dec is 1. We get the weekNo of 2nd last week and incement it by 1
          if (moment(d).format('MMM') === 'Jan') {
            calc = moment(d).week() % weeksInPreviousYear;
          } else if (moment(d).format('MMM') === 'Dec' && moment(d).week() === 1) {
            calc = weeksInCurrentYear - moment(startDate).week() + 1;
          } else {
            calc = moment(d).week() - moment(startDate).week();
          }

          return yOffset * 3 + (calc * cellSize);
        })
        .attr('rx', cellSize * 1 / 10)
        .attr('ry', cellSize * 1 / 10);

      dispatcher.newMapping()
        .addSource('.data-day')
        .addDataTarget('[data-day]')
        .addEvent('click', expandView);
    } else if (type === VIS_CHART_TYPE.HEATMAP_DAY) {
      const month = this._getMonth(aggs);
      const date = this._getDate(aggs);
      const startTime = new Date(parseInt(year), month, date, 0);
      const endTime = new Date(parseInt(year), month, date + 1, 0);

      d3.select(svg)
        .selectAll('.hour')
        .data(d3.time.hours(startTime, endTime))
        .enter().append('g').append('rect')
        .attr('id', (d) => {
          return 'day-' + moment(d).format(TIME_FORMAT) + '-' + chartId;
        })
        .classed('hour', true)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('x', (d) => {
          return xOffset * 2 + (moment(d).hour() % 12 * cellSize);
        })
        .attr('y', (d) => {
          return yOffset * 3 + (Math.floor(moment(d).hour() / 12) * cellSize);
        })
        .attr('rx', cellSize * 1 / 10)
        .attr('ry', cellSize * 1 / 10);
    }
  }

}
