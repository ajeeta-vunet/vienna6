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

import MarkdownIt from 'markdown-it';
import d3 from 'd3';

const markdownIt = new MarkdownIt({
  html: true,
  linkify: true
});

export const errorContainer = 'visualize-error';

export class CalendarErrorHandler {
  constructor() {
    this.el = undefined;
    this.id = undefined;
  }

  bindEl(el, id) {
    this.el = el;
    this.id = id;
    return this;
  }

  removeError() {
    d3.select(this.el)
      .attr('id', this.id)
      .selectAll(`.${errorContainer}`)
      .remove();
  }

  error(msg) {
    this.removeError();
    const div = d3.select(this.el)
      .append('div')
      .attr('id', this.id)
      // class name needs `chart` in it for the polling checkSize function
      // to continuously call render on resize
      .attr('class', `${errorContainer} chart error`);

    if (msg === 'No results found') {
      div.append('div')
        .attr('class', `text-center ${errorContainer} visualize-chart`)
        .append('div').attr('class', 'item top')
        .append('div').attr('class', 'item')
        .append('h3').html('No data to show');

      div.append('div').attr('class', 'item bottom');
    } else {
      div.append('h4').html(markdownIt.renderInline(msg));
    }
    return div;
  }
}
