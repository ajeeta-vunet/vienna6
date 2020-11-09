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

import React from "react";
import "./EventHistory.less";

export class EventHistory extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const renderRows = this.props.history && Object.keys(this.props.history).map((key, value) => {
      return (
        <div className="row history-row">
          <div className="col-md-2">{key}</div>
          <div className="col-md-2">{value}</div>
        </div>
      );
    });
    return (
      <div className="container history-wrapper">
        <div className="row header-row">
          <div className="col-md-2">
            <span className="history-details">
              History Details
            </span>
          </div>
          <div className="col-md-2">
            <span className="values">
              Values
            </span>
          </div>
        </div>
        {renderRows}
      </div>
    );
  }
}
