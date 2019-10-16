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

import _ from 'lodash';
import React from 'react';
import { Legend } from './legend';
import { legendPosition } from './index';
import { highlight, unHighlight } from '../../lib/events';

export class LegendBar extends React.Component {

  constructor(props) {
    super(props);
    this.legend = undefined;
    this.state = {
      enableHover: this.props.visConfig.get('enableHover'),
      labels: [{
        label: 'loading ...'
      }]
    };
    const { dispatcher } = this.props;
    dispatcher.newMapping().addDataTarget('[data-label]');
  }

  _accommodateContainer() {
    let container;
    if(this.legend) {
      container = this.legend.parentNode.parentNode;
      const legendPos = this.props.position;
      for (const className of container.classList) {
        if (Object.values(legendPosition).includes(className)) {
          container.classList.remove(className);
          break;
        }
      }
      container.classList.add(legendPos);
    }
  }

  highlight() {
    const { dispatcher } = this.props;
    if (this.state.enableHover) {
      dispatcher.addEvent('mouseenter', highlight);
    } else {
      dispatcher.removeEvent('mouseenter');
    }
  }

  unHighlight() {
    const { dispatcher } = this.props;
    if (this.state.enableHover) {
      dispatcher.addEvent('mouseleave', unHighlight);
    } else {
      dispatcher.removeEvent('mouseleave');
    }
  }

  componentWillMount() {
    const { visConfig, getUiState } = this.props;
    const labels = visConfig.get('legend.labels', null);
    const legendOpen = getUiState('vis.legendOpen');
    if (!labels) {
      this.setState({
        labels: [{
          label: 'loading ...'
        }]
      });
    }
    else {
      this.setState({
        open: legendOpen,
        enableHover: visConfig.get('enableHover'),
        labels: _.map(labels, label => ({ label: label }))
      });
    }
  }

  componentDidMount() {
    this._accommodateContainer();
    this.props.renderComplete();
  }

  componentDidUpdate() {
    this._accommodateContainer();
    this.props.renderComplete();
  }

  render() {
    return (
      <div ref={e => {this.legend = e;}} className="legend-col-wrapper">
        <ul className="legend-ul">
          {this.state.labels.map((legendData, i) => (
            <li
              className="legend-value color"
              key={i}
              onMouseEnter={this.highlight.bind(this)}
              onMouseLeave={this.unHighlight.bind(this)}
              data-label={legendData.label}
            >
              <Legend
                legendData={legendData}
                colorFunc={this.props.colorFunc}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  componentWillUnmount() {
    this.legend = null;
  }
}
