
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
      severityInfo: this.props.severityInfo
    };
  }

  render() {
    return (
      <div className="severity-widget-wrapper">
        {Object.keys(this.props.severityInfo['Time-Periods'][0]).map(key => {
          if (key !== 'period' && key !== 'total') {
            return (
              <SingleSeverity
                key={key}
                type={key}
                new={this.props.severityInfo['Time-Periods'][0][key].new}
                wip={this.props.severityInfo['Time-Periods'][0][key].wip}
              />);
          }
        })}
      </div>
    );
  }
}