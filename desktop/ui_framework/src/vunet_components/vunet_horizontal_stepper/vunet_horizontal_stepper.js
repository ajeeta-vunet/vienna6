
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

// Copyright 2019 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React, { Component } from 'react';

import './_vunet_horizontal_stepper.less';
import PropTypes from 'prop-types';

export class VunetHorizontalStepper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
    };
  }

  render() {
    const nodes = this.state.data.map((nodeObj, index) => {
      const nodeStyle = {
        background: nodeObj.node_color
      };

      const textStyle = {
        color: nodeObj.node_color,
      };

      const linkStyle = {
        background: nodeObj.link_color
      };

      const stepStyle = {
        width: (100 / this.state.data.length) + '%'
      };

      return (
        <div
          key={index}
          className="step"
          style={stepStyle}
        >
          <div className="circle-icon-wrapper">
            <div className="circle-icon" style={nodeStyle}>
              <i className={nodeObj.icon} aria-hidden="true" />
            </div>
          </div>
          <div className="step-header-container">
            <div className="step-header-index" style={textStyle}>0{index + 1}</div>
            <div className="step-header-text" style={textStyle}>{nodeObj.node_name}</div>
          </div>
          <div className="connector-line" style={linkStyle} />
        </div>
      );
    });

    return (
      <div className="horizontal-stepper-container">
        <div className="row steps">
          <div className="col-md-1 pre-step-connector"/>
          <div className="col-md-11 steps-container">{nodes}</div>
        </div>
      </div>
    );
  }
}

VunetHorizontalStepper.propTypes = {
  data: PropTypes.array
};
