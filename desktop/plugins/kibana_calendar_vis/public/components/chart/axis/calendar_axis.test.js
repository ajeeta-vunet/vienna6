/* eslint-disable */

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
import moment from 'moment';
import { findDOMNode } from 'react-dom';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { CalendarAxis } from './calendar_axis';
import { CalendarVisConfig } from '../../../lib/calendar_vis_config';
import { AXIS_SCALE_TYPE } from './axis_scale';
import aggResponse from '../../../__tests__/agg_response.json';
import { defaultParams, dayViewParams } from '../../../default_settings';
import { Dispatcher } from '../../../lib';
import { CalendarChart } from '../calendar_chart';
import { calculateBounds } from 'ui/timefilter/get_time';

sinon.spy(CalendarAxis.prototype, 'componentDidMount');

describe('CalendarAxis - default', () => {

  const key = 0;
  let visConfig;
  let axesConfig;
  let visData;
  let dispatcher;
  const fakeVis = {
    params: defaultParams,
    API: {
      timeFilter: {
        getBounds: function () {
          return calculateBounds({
            from: moment(1531026000000),
            to: moment(1531026000000 + 35 * 86400000)
          });
        }
      }
    }
  };

  beforeEach(() => {
    visData = aggResponse.rows[0];
    dispatcher = new Dispatcher().addContainer(document.createElement('div'));
  });

  afterEach(() => {
    visConfig = null;
    visData = null;
    axesConfig = null;
  });

  it('should render a month axis', () => {
    visConfig = new CalendarVisConfig(fakeVis, defaultParams);
    axesConfig = visConfig.get('categoryAxes');
    const axisArgs = axesConfig.filter(axis => axis.scale.type === AXIS_SCALE_TYPE.MONTHS)[0];
    const adjustSize = sinon.spy(CalendarChart.prototype.adjustSize);

    const axisWrapper = mount(<CalendarAxis
      key={key}
      type={visConfig.get('type')}
      gridConfig={visConfig.get('grid')}
      axisConfig={axisArgs}
      vislibData={visData}
      dispatcher={dispatcher}
      renderComplete={adjustSize}
    />);

    expect(CalendarAxis.prototype.componentDidMount.called).toEqual(true);
    expect(adjustSize.calledOnce).toEqual(true);
    const axis = axisWrapper.instance();
    expect(findDOMNode(axis)).toMatchSnapshot();
  });

  it('should render a week axis', () => {
    visConfig = new CalendarVisConfig(fakeVis, defaultParams);
    axesConfig = visConfig.get('categoryAxes');
    const axisArgs = axesConfig.filter(axis => axis.scale.type === AXIS_SCALE_TYPE.WEEKS)[0];
    const adjustSize = sinon.spy(CalendarChart.prototype.adjustSize);

    const axisWrapper = mount(
      <CalendarAxis
        key={key}
        type={visConfig.get('type')}
        gridConfig={visConfig.get('grid')}
        axisConfig={axisArgs}
        vislibData={visData}
        dispatcher={dispatcher}
        renderComplete={adjustSize}
      />
    );

    expect(CalendarAxis.prototype.componentDidMount.called).toEqual(true);
    expect(adjustSize.calledOnce).toEqual(true);
    const axis = axisWrapper.instance();
    expect(findDOMNode(axis)).toMatchSnapshot();
  });

  it('should render an hour axis', () => {
    visConfig = new CalendarVisConfig(fakeVis, dayViewParams);
    axesConfig = visConfig.get('categoryAxes');
    const axisArgs = axesConfig.filter(axis => axis.scale.type === AXIS_SCALE_TYPE.HOURS)[0];
    const adjustSize = sinon.spy(CalendarChart.prototype.adjustSize);

    const axisWrapper = mount(
      <CalendarAxis
        key={key}
        type={visConfig.get('type')}
        gridConfig={visConfig.get('grid')}
        axisConfig={axisArgs}
        vislibData={visData}
        dispatcher={dispatcher}
        renderComplete={adjustSize}
      />
    );

    expect(CalendarAxis.prototype.componentDidMount.called).toEqual(true);
    expect(adjustSize.calledOnce).toEqual(true);
    const axis = axisWrapper.instance();
    expect(findDOMNode(axis)).toMatchSnapshot();
  });

  it('should render a meridiem axis', () => {
    visConfig = new CalendarVisConfig(fakeVis, dayViewParams);
    axesConfig = visConfig.get('categoryAxes');
    const axisArgs = axesConfig.filter(axis => axis.scale.type === AXIS_SCALE_TYPE.MERIDIEM)[0];
    const adjustSize = sinon.spy(CalendarChart.prototype.adjustSize);

    const axisWrapper = mount(
      <CalendarAxis
        key={key}
        type={visConfig.get('type')}
        gridConfig={visConfig.get('grid')}
        axisConfig={axisArgs}
        vislibData={visData}
        dispatcher={dispatcher}
        renderComplete={adjustSize}
      />
    );

    expect(CalendarAxis.prototype.componentDidMount.called).toEqual(true);
    expect(adjustSize.calledOnce).toEqual(true);
    const axis = axisWrapper.instance();
    expect(findDOMNode(axis)).toMatchSnapshot();
  });

});
