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
import { ChartGrid } from './chart_grid';
import { Dispatcher } from '../../../lib';
import { CalendarVisConfig } from '../../../lib/calendar_vis_config';
import { defaultParams, monthViewParams, dayViewParams } from '../../../default_settings';
import aggResponse from '../../../__tests__/agg_response.json';
import { truncateUnusable, replicateDate } from '../../../../test/jest/utils';
import { calculateBounds } from 'ui/timefilter/get_time';

describe('ChartGrid - default', () => {

  let visConfig;
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
    visData = truncateUnusable(aggResponse.rows[0]);
    dispatcher = new Dispatcher().addContainer(document.createElement('div'));
  });

  afterEach(() => {
    visConfig = null;
    visData = null;
  });

  it('should render a full year overview chart grid', () => {
    visConfig = new CalendarVisConfig(fakeVis, defaultParams);
    // replicate data
    visData = replicateDate(visData);
    const adjustSize = jest.fn();
    const gridWrapper = mount(
      <ChartGrid
        type={visConfig.get('type')}
        gridConfig={visConfig.get('grid')}
        vislibData={visData}
        axes={visConfig.get('categoryAxes')}
        dispatcher={dispatcher}
        renderComplete={adjustSize}
      />
    );
    const grid = gridWrapper.instance();
    expect(findDOMNode(grid)).toMatchSnapshot();
  });

  it('should render a full month overview chart grid', () => {
    visConfig = new CalendarVisConfig(fakeVis, monthViewParams);
    // replicate data
    visData = replicateDate(visData, 3);
    const adjustSize = jest.fn();
    const gridWrapper = mount(
      <ChartGrid
        type={visConfig.get('type')}
        gridConfig={visConfig.get('grid')}
        vislibData={visData}
        axes={visConfig.get('categoryAxes')}
        dispatcher={dispatcher}
        renderComplete={adjustSize}
      />
    );
    const grid = gridWrapper.instance();
    expect(findDOMNode(grid)).toMatchSnapshot();
  });

  it('should render a full day overview chart grid', () => {
    visConfig = new CalendarVisConfig(fakeVis, dayViewParams);
    // replicate data
    visData = replicateDate(visData, 0);
    const adjustSize = jest.fn();
    const gridWrapper = mount(
      <ChartGrid
        type={visConfig.get('type')}
        gridConfig={visConfig.get('grid')}
        vislibData={visData}
        axes={visConfig.get('categoryAxes')}
        dispatcher={dispatcher}
        renderComplete={adjustSize}
      />
    );
    const grid = gridWrapper.instance();
    expect(findDOMNode(grid)).toMatchSnapshot();
  });

});
