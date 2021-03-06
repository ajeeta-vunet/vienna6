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
import './SeverityWidget.less';
import { SingleSeverity } from './SingleSeverity/SingleSeverity';

export class SeverityWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      severityInfo: this.props.severityInfo,
      displaySeverityWidgets: true,
    };
  }

  //this method is used to hide or unhide alert overview.
  hideOrUnhideSeverityWidgets = () => {
    this.setState({
      displaySeverityWidgets: !this.state.displaySeverityWidgets,
    });
  };

  render() {
    if (this.props.severityInfo) {
      return (
        <div className="severity-widget-container">
          <div className="severity-widget-header-row">
            <div className="severity-header">Alert Overview</div>
            <button
              className="hide-or-unhide-button"
              onClick={() => this.hideOrUnhideSeverityWidgets()}
            >
              <i
                className={
                  'fa ' +
                  (this.state.displaySeverityWidgets
                    ? 'fa-angle-up'
                    : 'fa-angle-down')
                }
              />
            </button>
          </div>
          {this.state.displaySeverityWidgets && (
            <div className="severity-widget-wrapper">
              {Object.keys(this.props.severityInfo).map((key) => {
                if (key !== 'period') {
                  return (
                    <SingleSeverity
                      key={key}
                      type={key}
                      new={this.props.severityInfo[key].new}
                      wip={this.props.severityInfo[key].wip}
                      filterBySeverity={this.props.filterBySeverity}
                      appliedSeverityList={this.props.appliedSeverityList}
                    />
                  );
                }
              })}
            </div>
          )}
        </div>
      );
    } else {
      return null;
    }
  }
}
