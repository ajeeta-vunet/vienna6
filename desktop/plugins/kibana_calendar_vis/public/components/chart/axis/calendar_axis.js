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
import moment from 'moment';
import { AxisConfig } from './axis_config';
import { AXIS_SCALE_TYPE, CalendarAxisScale } from './axis_scale';
import './calendar_axis.less';
import { expandView } from '../../../lib/events';

export class CalendarAxis extends React.Component {
  constructor(props) {
    super(props);
    const { gridConfig, axisConfig, type } = this.props;
    this.axisConfig = new AxisConfig(axisConfig, gridConfig);
    this.axisConfig.validateAxis(type);
    this.axisScale = new CalendarAxisScale(this.axisConfig);
    this.axis = undefined;
  }

  componentDidMount() {
    const pos = this.axisConfig.get('position');
    const { vislibData, renderComplete } = this.props;
    if (pos === 'top') {
      this._drawTop(vislibData);
    } else if (pos === 'left') {
      this._drawLeft(vislibData);
    }
    renderComplete();
  }

  render() {
    const type = this.axisConfig.get('scale.type');
    let axisId;
    if (type === AXIS_SCALE_TYPE.MONTHS) {
      axisId = 'month-labels';
    } else if(type === AXIS_SCALE_TYPE.WEEKS) {
      axisId = 'weekday-labels';
    } else if (type === AXIS_SCALE_TYPE.HOURS) {
      axisId = 'hours-labels';
    } else if (type === AXIS_SCALE_TYPE.MERIDIEM) {
      axisId = 'meridiem-labels';
    }
    return (
      <svg id={axisId} ref={e => {this.axis = e;}} />
    );
  }

  componentWillUnmount() {
    d3.select(this.axis).remove();
    this.axisConfig = null;
    this.axisScale = null;
    this.axis = null;
  }

  _drawTop(vislibData) {
    const [
      type,
      cellSize,
      xOffset,
      yOffset,
      padding
    ] = this.axisConfig.get(['scale.type', 'cellSize', 'xOffset', 'yOffset', 'padding']);

    const axis = d3.select(this.axis);

    if (type === AXIS_SCALE_TYPE.MONTHS) {
      const label = vislibData.label;
      const year = label.slice(0, 4);

      const monthLeftPad = [];
      const [startMonth, endMonth] = this.axisScale.getExtents(vislibData);
      const sMonth = this.axisScale.getNumericScale(startMonth);
      const eMonth = this.axisScale.getNumericScale(endMonth);
      this.axisScale.setExtents({ scaleMin: startMonth, scaleMax: endMonth });
      const startWeek = moment(new Date(year, sMonth - 1, 1)).week() % 52;

      for(let i = sMonth; i <= eMonth; ++i) {
        const pad = cellSize * (
          (i - sMonth) * 1.5 +
          (moment(new Date(year, i - 1, 1)).week() - startWeek) % 52
        );
        monthLeftPad.push(pad);
      }

      this.axisScale.extents.forEach((d, i) => {
        axis.append('text')
          .attr('class', 'month-label')
          .attr('data-month', `${sMonth + i}`)
          .attr('data-year', year)
          .attr('x', monthLeftPad[i] + padding + xOffset * 2)
          .attr('y', yOffset * 2.5)
          .style('font-size', cellSize * 7 / 10)
          .text(d);
      });

      this.props.dispatcher.newMapping().addSource('.month-label').addDataTarget('[data-month]')
        .addEvent('click', expandView);
    } else if (type === AXIS_SCALE_TYPE.WEEKS) {
      this.axisScale.extents.forEach(function (d, i) {
        axis.append('text')
          .attr('class', 'weekday-label')
          .attr('x', ((i + 0.15) * padding) + xOffset * 2)
          .attr('y', yOffset * 2.5)
          .style('font-size', cellSize * 4 / 10)
          .text(d);
      });
    } else if (type === AXIS_SCALE_TYPE.HOURS) {
      this.axisScale.extents.forEach(function (d, i) {
        axis.append('text')
          .attr('class', 'hour-label')
          .attr('x', i * padding + xOffset * 2)
          .attr('y', yOffset * 2.5)
          .style('font-size', cellSize * 3 / 10)
          .text(d);
      });
    }
  }

  _drawLeft() {
    const [type, cellSize, padding, yOffset] = this.axisConfig.get(['scale.type', 'cellSize', 'padding', 'yOffset']);
    const axis = d3.select(this.axis);

    if(type === AXIS_SCALE_TYPE.WEEKS) {
      this.axisScale.extents.forEach(function (d, i) {
        axis.append('text')
          .attr('class', 'weekday-label')
          .attr('y', () => (yOffset * 3.1) + ((i + 0.4) * padding))
          .attr('x', 5)
          .style('font-size', cellSize * 7 / 10)
          .text(d);
      });
    } else if (type === AXIS_SCALE_TYPE.MERIDIEM) {
      this.axisScale.extents.forEach(function (d, i) {
        axis.append('text')
          .attr('class', 'meridiem-label')
          .attr('y', () => (yOffset * 3.2) + ((i + 0.4) * padding))
          .attr('x', 5)
          .style('font-size', cellSize * 3 / 10)
          .text(d);
      });
    }
  }

}
