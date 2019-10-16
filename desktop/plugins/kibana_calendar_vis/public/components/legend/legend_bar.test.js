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
import { mount } from 'enzyme';
import sinon from 'sinon';
import { LegendBar } from './legend_bar';
import { legendPosition } from './';
import { CalendarVisConfig, CalendarErrorHandler } from '../../lib';
import { calendarDataObjectProvider } from '../../lib/data_object/calendar_data';
import { Dispatcher } from '../../lib/dispatcher';
import aggResponse from '../../__tests__/agg_response.json';
import colorMap from '../../__tests__/colormap.json';
import { containerName, legendName, defaultParams } from '../../default_settings';
import { calculateBounds } from 'ui/timefilter/get_time';

describe('LegendBar', () => {

  let visConfig;
  let DataObject;
  let vislibData;
  let dispatcher;
  let visData;
  let legendBarWrapper;
  let renderComplete;
  const fakeConfig = {
    get(key) {
      if (key === 'visualization:colorMapping') {
        return {
          Count: '#00A69B'
        };
      } else if (key === 'visualization:dimmingOpacity') {
        return 0.5;
      }
    }
  };
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
  let fakeUiState;
  let setUiState;
  let getUiState;

  beforeEach(() => {
    visData = aggResponse;
    visConfig = new CalendarVisConfig(fakeVis, defaultParams);

    visConfig.set('legend', {
      labels: Object.keys(colorMap)
    });

    fakeUiState = {
      get(state) {
        return this[state];
      },
      set(state, value) {
        this[state] = value;
      }
    };
    setUiState = function (state, value) {
      fakeUiState.set(state, value);
    };
    getUiState = function (state) {
      return fakeUiState.get(state);
    };
    fakeUiState.set('vis.legendOpen', true);
    fakeUiState.set('vis.defaultColors', colorMap);

    DataObject = calendarDataObjectProvider(fakeConfig);
    vislibData = new DataObject(visData, fakeUiState);
    dispatcher = new Dispatcher(CalendarErrorHandler.bindEl(document.createElement('div')));
    dispatcher.addConfig(fakeConfig);
    renderComplete = jest.fn();
    legendBarWrapper = mount(
      <div className={containerName}>
        <div className={legendName}>
          <LegendBar
            visConfig={visConfig}
            colorFunc={vislibData.getColorFunc()}
            position={legendPosition[defaultParams.legendPosition]}
            dispatcher={dispatcher}
            setUiState={setUiState}
            getUiState={getUiState}
            renderComplete={renderComplete}
          />
        </div>
      </div>
    );
  });

  afterEach(() => {
    visData = null;
    visConfig = null;
    vislibData = null;
    legendBarWrapper.unmount();
  });

  it('should render a full LegendBar component, default position to the right', () => {
    sinon.spy(LegendBar.prototype, 'componentDidMount');
    expect(renderComplete.mock.calls.length).toBe(1);
    expect(legendBarWrapper.find('li.legend-value')).toHaveLength(4);
    expect(legendBarWrapper).toMatchSnapshot();
  });

  it('should collapse and expand when click the arrow', () => {
    legendBarWrapper.find('button').simulate('click');
    expect(legendBarWrapper.find(LegendBar).instance().state.open).toEqual(false);
    expect(legendBarWrapper).toMatchSnapshot();

    legendBarWrapper.find('button').simulate('click');
    expect(legendBarWrapper.find(LegendBar).instance().state.open).toEqual(true);
  });

  it('should dim and undim the data labels when mouseover and mouseout the legends', () => {
    visConfig.set('enableHover', true);
    sinon.spy(dispatcher, 'addEvent');
    legendBarWrapper = mount(
      <div className={containerName}>
        <div className={legendName}>
          <LegendBar
            visConfig={visConfig}
            colorFunc={vislibData.getColorFunc()}
            position={legendPosition[defaultParams.legendPosition]}
            dispatcher={dispatcher}
            setUiState={setUiState}
            getUiState={getUiState}
            renderComplete={renderComplete}
          />
        </div>
      </div>
    );

    legendBarWrapper.find('li.legend-value').at(0).simulate('mouseenter');
    expect(dispatcher.addEvent.calledOnce).toEqual(true);

    legendBarWrapper.find('li.legend-value').at(0).simulate('mouseleave');
    expect(dispatcher.addEvent.calledTwice).toEqual(true);
  });

});
