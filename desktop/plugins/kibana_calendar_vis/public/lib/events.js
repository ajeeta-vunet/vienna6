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

import $ from 'jquery';
import moment from 'moment';

export function highlight({ config, container, dataTarget }) {
  const label = this.getAttribute(dataTarget.replace(/\=".*"/, '').slice(1, -1));

  function justifyOpacity(opacity) {
    const decimalNumber = parseFloat(opacity, 10);
    const fallbackOpacity = 0.5;
    return (0 <= decimalNumber && decimalNumber <= 1) ? decimalNumber : fallbackOpacity;
  }

  const dimming = config.get('visualization:dimmingOpacity');
  $(container).find(dataTarget)
    .css('opacity', 1)
    .not((els, el) => el.getAttribute(dataTarget.slice(1, -1)) === label)
    .css('opacity', justifyOpacity(dimming));
}

export function unHighlight({ container, dataTarget }) {
  const div = $(container);
  $(dataTarget, div).css('opacity', '');
}

export function expandView({ API }) {
  const { timeFilter } = API;
  const { year, month, day } = this.dataset;
  let start;
  let end;
  if (day === undefined) {
    start = moment(new Date(year, month - 1, 1));
    end = moment(new Date(new Date(year, month, 1).getTime() - 1));
  } else {
    start = moment(new Date(year, month - 1, day, 0));
    end = moment(new Date(new Date(year, month - 1, day, 24).getTime() - 1));
  }

  timeFilter.setTime(start, end, 'absolute');
}
