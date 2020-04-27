
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
import { SEVERITY_TYPES, ABOUT_SECTION_HELP_OBJ } from '../alert_constants';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';

// This component provides the 'About' section of the alert page
export class AlertAboutSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayHelpContent: false
    };
  }

  // enable/disable help content
  toggleHelpContent = () => {
    this.setState({ displayHelpContent: !this.state.displayHelpContent });
  }

  render() {
    const callbackParams = this.props.alertAboutSectionObj;
    const alertConfig = this.props.alertConfig;

    // error text fields
    const summaryErrorText = this.props.errorObj.summary.errorText;
    const descriptionErrorText = this.props.errorObj.description.errorText;

    return (
      <div className="alert-about-section">

        {/* Header */}
        <div className="alert-condition-header">
          <span className="header-number">
            01.
          </span>
          <span className="header-title">
            What&apos;s The Alert About?
          </span>
          <i
            className="help-icon icon-help-blue"
            onClick={() => { this.toggleHelpContent(); }}
          />
        </div>

        {/* Help Content */}
        {this.state.displayHelpContent &&
          <VunetHelp
            backgroundColor="white"
            metaData={ABOUT_SECTION_HELP_OBJ}
            onClose={() => { this.toggleHelpContent(); }}
          />
        }

        {/* Body */}
        <div className="alert-condition-body">
          <div className="alert-summary-severity-wrapper row">
            <div className="col-md-6 form-group">
              <label
                className="alert-summary-title"
                htmlFor="alert-summary-id"
              >
                Summary*
              </label>
              <input
                required
                className={'form-control ' + (summaryErrorText && 'errorInput')}
                id="alert-summary-id"
                type="text"
                placeholder="Add summary"
                onChange={(e) => callbackParams.updateAlertAboutInfo('summary', e.target.value)}
                value={alertConfig.summary}
              />
              {summaryErrorText &&
                (
                  <div className="errorFieldText">{summaryErrorText}</div>
                )
              }
            </div>
            <div className="col-md-6 form-group">
              <label
                htmlFor="alert-severity-id"
                className="alert-severity-title"
              >
                Severity*
              </label>
              <select
                className="alert-severity form-control"
                id="alert-severity-id"
                placeholder="select the severity"
                onChange={(e) => callbackParams.updateAlertAboutInfo('severity', e.target.value)}
                value={alertConfig.severity}
              >
                {SEVERITY_TYPES.map((option, i) =>
                  <option key={option.label + i} value={option.value}>{option.label}</option>
                )};

              </select>
            </div>
          </div>
          <div className="alert-description-wrapper form-group">
            <label
              htmlFor="alert-description-id"
              className="alert-description-title"
            >
              Description*
            </label>
            <textarea
              className={'alert-description form-control ' + (descriptionErrorText && 'errorInput')}
              id="alert-description-id"
              type="text"
              maxLength="201"
              placeholder="Add a description"
              onChange={(e) => callbackParams.updateAlertAboutInfo('description', e.target.value)}
              value={alertConfig.description}
            />
            {descriptionErrorText &&
              (
                <div className="errorFieldText">{descriptionErrorText}</div>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}
