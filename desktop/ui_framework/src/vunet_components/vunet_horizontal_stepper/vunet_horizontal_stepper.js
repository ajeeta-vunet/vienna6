
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
      steps: props.data.steps,
      currentStep: props.data.currentStep
    };
  }

  // Update the current step when user clicks the form
  // wizard buttons to view contents of next / previous step.
  componentWillReceiveProps(newProps) {
    this.setState({ currentStep: newProps.data.currentStep });
  }

  // This is a callback function which calls the
  // switchStep  function in vunet form wizard
  // component.
  onSwitch = (index) => {
    this.setState({ currentStep: index });
    this.props.onSwitch(index);
  }

  render() {

    const nodes = this.state.steps.map((nodeObj, index) => {
      //Inline style initialization for stepper sub components

      // inline style for the step node
      let nodeStyle = {};

      // inline style for the step icon
      let iconStyle = {};

      // inline style for the step text
      let textStyle = {};

      // inline style for the connecting lines between steps
      let linkStyle = {};

      // inline style for each step node with its connecting line
      let stepStyle = {};

      // Use the following inline styles when user action is 'edit'
      if (this.props.data.action === 'edit') {

        // Update the inline style of step node to indicate
        // the current step.
        if(this.state.currentStep === index) {
          nodeStyle = {
            background: nodeObj.node_color,
            border: '1px solid ' + nodeObj.node_color,
          };

          iconStyle = {
            color: '#fff',
          };

        } else {
          nodeStyle = {
            background: '#fff',
            border: '1px solid ' + nodeObj.node_color
          };

          iconStyle = {
            color: nodeObj.node_color,
          };
        }

        textStyle = {
          color: nodeObj.node_color,
        };

        linkStyle = {
          background: nodeObj.link_color
        };

        stepStyle = {
          width: (100 / this.state.steps.length) + '%'
        };
      } else {
        // Use the following inline styles for 'add' action
        nodeStyle = {
          background: '#fff',
          background: nodeObj.node_color
        };

        iconStyle = {
          color: '#fff',
        };

        textStyle = {
          color: nodeObj.node_color,
        };

        linkStyle = {
          background: nodeObj.link_color
        };

        stepStyle = {
          width: (100 / this.state.steps.length) + '%'
        };
      }

      return (
        <div
          key={index}
          className="step"
          style={stepStyle}
        >
          <div className="circle-icon-wrapper">
            <div
              style={nodeStyle}
              className={'circle-icon'}
              onClick={() => {
                this.onSwitch(index);
              }}
            >
              <i
                className={nodeObj.icon}
                style={iconStyle}
                aria-hidden="true"
              />
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
          <div className="col-md-1 pre-step-connector" />
          <div className="col-md-11 steps-container">{nodes}</div>
        </div>
      </div>
    );
  }
}

VunetHorizontalStepper.propTypes = {
  data: PropTypes.object,
  onSwitch: PropTypes.func
};
