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
import $ from 'jquery';
import moment from 'moment';
import { render, unmountComponentAtNode } from 'react-dom';
import { CalendarChart } from './components/chart/calendar_chart';
import { legendPosition, LegendBar } from './components/legend';
import { CalendarVisConfig, calendarDataObjectProvider, Dispatcher, CalendarErrorHandler } from './lib';
import { ValueAxis } from './components/chart/axis/value_axis';
import { KbnError, NoResults, SearchTimeout } from 'ui/errors';
import { EuiTooltip } from './components/tooltip';
import { HashTable, TIME_FORMAT } from './utils';
import { InvalidBucketError } from './errors';
import { containerName, chartCanvas, chartWrapperName, legendName, tooltipId, tooltipName } from './default_settings';
import { momentLocales } from './i18n';
import { highlight, unHighlight } from './lib/events';
import './calendar_visualization.less';

export function calendarVisualizationProvider(config) {

  const VisConfig = CalendarVisConfig;
  const Data = calendarDataObjectProvider(config);

  class CalendarVisualization {
    constructor(el, vis) {
      this.el = el;
      this.vis = vis;
      this.container = document.createElement('div');
      this.container.className = containerName;
      this.el.appendChild(this.container);
      CalendarErrorHandler.bindEl(this.container);
      this.dispatcher = new Dispatcher();
      this.dispatcher.addConfig(config).addContainer(this.container);
      this.calendarVis = document.createElement('div');
      this.calendarVis.className = chartCanvas;
      this.charts = [];
      this.visConfig = new VisConfig(vis, vis.params);
      this.valueAxes = this.visConfig.get('valueAxes').map(axisConfig => new ValueAxis(this.visConfig, axisConfig, this.vis));
      this.tooltipContainer = null;
      this.legendNode = null;
      this.hashTable = new HashTable();
    }

    renderDOM(component, node) {
      render(component, node);
    }

    unmountDOM(node) {
      unmountComponentAtNode(node);
    }

    async _unmountChart() {
      this.charts.forEach((cEl) => {
        this.unmountDOM(cEl);
      });
      this.charts = [];
      while (this.calendarVis.firstChild) {
        this.calendarVis.removeChild(this.calendarVis.firstChild);
      }
      this.container.removeChild(this.calendarVis);
    }

    async _mountChart(vislibData) {
      const visFragment = document.createDocumentFragment();

      const data = vislibData.getData();
      const numberOfCharts = data.length;
      for(let i = 0; i < numberOfCharts; ++i) {
        const d = document.createElement('div');
        d.className = chartWrapperName;
        this.charts.push(d);
        visFragment.appendChild(d);
      }
      this.calendarVis.appendChild(visFragment);
      this.container.appendChild(this.calendarVis);
      const self = this;

      const renderArray = this.charts.map((cEl, i) => {
        return new Promise((resolve) => {
          self.renderDOM(<CalendarChart
            id={`chart_${vislibData.dataAt(i).label.slice(0, 4)}`}
            visConfig={self.visConfig}
            vislibData={vislibData.dataAt(i)}
            dispatcher={self.dispatcher.addAPI(self.vis.API)}
            renderComplete={resolve}
          />, cEl);
        });
      });

      await Promise.all(renderArray);
    }

    async _removeLegend() {
      this.unmountDOM(this.legendNode);
      if(this.container.contains(this.legendNode)) {
        this.container.removeChild(this.legendNode);
      }
      this.legendNode = null;
    }

    async _renderLegend(vislibData) {
      const self = this;
      const container = this.container;
      this.legendNode = document.createElement('div');
      container.appendChild(this.legendNode);
      this.legendNode.className = legendName;
      function setUiState(state, value) {
        const uiState = self.vis.getUiState();
        uiState.set(state, value);
      }
      function getUiState(state) {
        return self.vis.getUiState().get(state);
      }
      await new Promise((resolve) => {
        self.renderDOM(<LegendBar
          visConfig={self.visConfig}
          colorFunc={vislibData.getColorFunc()}
          position={legendPosition[self.vis.params.legendPosition]}
          dispatcher={self.dispatcher}
          setUiState={setUiState}
          getUiState={getUiState}
          renderComplete={resolve}
        />, self.legendNode);
      });
    }

    bindAnchorEvent(e) {
      const self = this;
      new Promise((resolve) => {
        self.renderDOM(<EuiTooltip
          id={tooltipId}
          formatter={self.tooltipFormatter}
          hashTable={self.hashTable}
          renderComplete={resolve}
          anchorEvent={e}
          container={self.calendarVis}
        />, self.tooltipContainer);
      });
    }

    async _removeTooltip() {
      this.calendarVis.removeEventListener('mouseover', this.anchorEventBinder);
      this.calendarVis.removeEventListener('mouseout', this.anchorEventBinder);
      this.unmountDOM(this.tooltipContainer);
      if (this.container.contains(this.tooltipContainer)) {
        this.container.removeChild(this.tooltipContainer);
      }
      this.tooltipContainer = null;
      this.tooltipFormatter = null;
    }

    async _renderTooltip(vislibData) {
      this.tooltipFormatter = vislibData.get('tooltipFormatter');
      this.tooltipContainer = document.createElement('div');
      this.tooltipContainer.className = tooltipName;
      this.container.appendChild(this.tooltipContainer);
      this.anchorEventBinder = this.bindAnchorEvent.bind(this);
      this.calendarVis.addEventListener('mouseover', this.anchorEventBinder);
      this.calendarVis.addEventListener('mouseout', this.anchorEventBinder);
    }

    async _addHoverEvents() {
      this.dispatcher
        .newMapping()
        .addSource('.month-label')
        .addDataTarget('[data-month]')
        .addEvent('mouseenter', highlight)
        .addEvent('mouseleave', unHighlight);

      this.dispatcher
        .newMapping()
        .addDataTarget('[data-label]')
        .addEvent('mouseenter', highlight)
        .addEvent('mouseleave', unHighlight);
    }

    async _removeHoverEvents() {
      this.dispatcher
        .newMapping()
        .addDataTarget('[data-month]')
        .removeEvent('mouseenter').removeEvent('mouseleave');

      this.dispatcher
        .newMapping()
        .addDataTarget('[data-label]')
        .removeEvent('mouseenter').removeEvent('mouseleave');
    }

    async _render(vislibData, printReport, updateStatus) {
      const { aggs, data, params, time, resize } = updateStatus;

      const localeProvider = momentLocales.en;
      localeProvider({
        dow: config.get('dateFormat:dow')
      });

      if(aggs || time || resize || (params && resize) || (data && params) || (data && !aggs && !params && !time && !resize)) {
        if(this.container.contains(this.calendarVis)) {
          await this._unmountChart();
        }
        await this._mountChart(vislibData);
      }

      if(aggs || data || params || time || resize) {
        const renderValues = this.valueAxes.map(async (axis) => {
          await axis.drawValues(vislibData);
        });
        await renderValues;
        const addons = [];
        if (this.visConfig.get('enableHover')) {
          addons.push(this._addHoverEvents());
        } else {
          addons.push(this._removeHoverEvents());
          $('[data-label]').css('opacity', '');
        }
        if (this.visConfig.get('addTooltip')) {
          if (this.tooltipContainer !== null) {
            await this._removeTooltip();
          }
          addons.push(this._renderTooltip(vislibData));
        } else if (this.tooltipContainer !== null) {
          addons.push(this._removeTooltip());
        }

        if (this.legendNode !== null) {
          await this._removeLegend();
        }
        addons.push(this._renderLegend(vislibData));
        await Promise.all(addons);
      }
    }

    _validateData(data) {
      if(typeof data !== 'object') {
        throw new TypeError(`invalid type ${typeof data} of visData, should be object`);
      }
      if (data.hits === 0) {
        throw new NoResults();
      }
      if (data.timed_out) {
        throw new SearchTimeout();
      }
    }

    _putAll(visData) {
      try {
        visData.rows.forEach(r => {
          const vals = r.series[0].values;
          vals.forEach(v => {
            const dayId = 'day-' + moment(v.x).format(TIME_FORMAT);
            this.hashTable.put(dayId, v);
          });
        });
      } catch(error) {
        if(error.message.includes('the entry already exists')) {
          throw new InvalidBucketError({
            msg: 'hidden date histogram',
            directTo: '#/management/kibana/settings#histogram:maxBars-aria-title',
            changeInstruction: 'increase Maximum bars to disable bucket autoscaling'
          });
        }
      }
    }

    // Due to bucketing by ES, data is approximated
    // For example, In the below sample data as we increase the date duration ES automatically does bucketing.
    // Here we can clearly see that while the data has timestamp of 2018 but its year-timestamp comes as 2019 for the date '2019-01-01/2019' -> '2018-12-31 2019'.

    // Data returned by ES (2017/08/01 - 2019/06/30)
    // @timestamp per day 	@timestamp per year
    // ------------------------------------------
    // 2018-07-05	          2018
    // 2018-12-05	          2018
    // ------------------------------------------
    // 2019-01-01	          2019
    // 2019-01-20	          2019
    // ------------------------------------------

    // ES does bucketing on the index due to increased duration (2017/07/01 - 2019/06/30)
    // @timestamp per day 	@timestamp per year
    // --------------------------------------------
    // 2018-07-02	          2018
    // 2018-12-03	          2018
    // --------------------------------------------
    // 2018-12-31	          2019  <== date present in incorrect timestamp
    // 2019-01-14	          2019
    // --------------------------------------------

    // We move the incorrect data to its appropriate timestamp (2017/07/01 - 2019/06/30)
    // @timestamp per day 	@timestamp per year
    // -------------------------------------------
    // 2018-07-02	          2018
    // 2018-12-03	          2018
    // 2018-12-31	          2018  <== date moved to correct timestamp
    // -------------------------------------------
    // 2019-01-14	          2019
    // -------------------------------------------
    _fixData(data) {
      data.forEach((item, i) => {
        const yearLabel = item.label.slice(0, 4);
        const dateArray = item.series[0].values;
        let peviousYearDate = null;

        // Check if the first date belongs in incorrect timestamp
        // If yes then we need to move that date to the previous timestamp
        if (moment(dateArray[0].x).format('YYYY') !== yearLabel) {

          // Make a copy of the date
          peviousYearDate = dateArray[0];

          // Remove first date in the array
          dateArray.shift();

          // Push the date onto previous year timestamp
          if (data[i - 1]) {
            data[i - 1].series[0].values.push(peviousYearDate);
          }
        }
        // If previous year timestamp is not present, then we exclude that date
      });
    }

    render(visData, printReport, updateStatus) {
      const self = this;
      try {
        this._validateData(visData);
        this.hashTable.clearAll();
        this._putAll(visData);
        CalendarErrorHandler.removeError();
        const vislibData = new Data(visData, this.vis.getUiState());
        this._fixData(vislibData.data.rows);
        this.visConfig.update(updateStatus, {
          containerWidth: this.container.getBoundingClientRect().width
        });
        return this._render(vislibData, printReport, updateStatus);
      } catch (error) {
        if (error instanceof KbnError) {
          return new Promise(async (resolve) => {
            await self.destroy();
            error.displayToScreen(CalendarErrorHandler);
            resolve();
          });
        } else {
          throw error;
        }
      }
    }

    destroy() {
      const self = this;
      return new Promise(async (resolve) => {
        if (self.tooltipContainer !== null) {
          await self._removeTooltip();
        }
        if (self.legendNode !== null) {
          await self._removeLegend();
        }
        if(this.container.contains(this.calendarVis)) {
          await self._unmountChart();
        }
        resolve();
      });
    }
  }

  return CalendarVisualization;
}

