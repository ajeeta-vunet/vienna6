// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import { CheckCircleFillIcon } from '@primer/octicons-react';
import { generateHeading } from '../../../utils/vunet_format_name';
import './SingleSeverity.less';

export class SingleSeverity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: parseInt(this.props.new) + parseInt(this.props.wip),
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ total: parseInt(newProps.new) + parseInt(newProps.wip) });
  }

  render() {
    return (
      <div
        className={'single-severity-container ' + this.props.type + '-severity'}
        onClick={() => {
          this.props.type !== 'total' &&
            this.props.filterBySeverity('severity', this.props.type);
        }}
      >
        <div className="total-count-wrapper">
          <div className="total-count-number">{this.state.total}</div>
          <div className="severity-name">
            {generateHeading(this.props.type)}
          </div>
        </div>
        <div className="total-count-breakdown-wrapper">
          <div className="new-count-wrapper">
            <div className="new-count-number">{this.props.new}</div>
            <div className="new-count-label">New</div>
          </div>
          <div className="in-progress-wrapper">
            <div className="in-progress-number">{this.props.wip}</div>
            <div className="in-progress-label">In-Progress</div>
          </div>
        </div>
        {this.props.appliedSeverityList &&
          this.props.appliedSeverityList.includes(this.props.type) && (
            <div className="applied-severity-tick">
              <CheckCircleFillIcon />
            </div>
          )}
      </div>
    );
  }
}
