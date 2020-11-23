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
        className={
          'single-severity ' + (this.props.type !== 'total' ? 'severity-widget-cursor' : null)
        }
        onClick={() => {
          this.props.type !== 'total' &&
            this.props.filterBySeverity('severity', this.props.type);
        }}
      >
        <div className="severity-info">
          <div className="severity-heading">{this.props.type}</div>
          <div className="severity-details">
            NEW - {this.props.new} | IN PROGRESS - {this.props.wip}
          </div>
        </div>
        <div className={`severity-count-wrapper event-${this.props.type}`}>
          <div className="circle-segment">
            <img src={`/ui/vienna_images/${this.props.type}_segment.svg`} />
          </div>
          <div className="severity-count">
            <div className="count-text">{this.state.total}</div>
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
