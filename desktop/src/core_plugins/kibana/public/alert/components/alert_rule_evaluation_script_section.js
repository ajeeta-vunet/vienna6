
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

import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';
import { EVALUATION_SCRIPT_SECTION_HELP_OBJ } from '../alert_constants';

// This component provides the 'AlertRuleEvaluationScriptSection' section of the alert page
export class AlertRuleEvaluationScriptSection extends React.Component {
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
    const callbackParams = this.props.alertRuleEvaluationScriptSectionObj;
    const alertConfig = this.props.alertConfig;

    // error text fields
    const evaluationScriptErrorText = this.props.errorObj.parsedEvalCriteria.expression.errorText;
    return (
      <div className="alert-rule-evaluation-script-section">

        {/* Header */}
        <div className="alert-condition-header">
          <span className="header-number">
            04.
          </span>
          <span className="header-title">
            Rule Evaluation Script (Optional)
          </span>
          <i
            className="help-icon icon-help-blue"
            onClick={() => { this.toggleHelpContent(); }}
          />
        </div>

        {/* Help Content */}
        {this.state.displayHelpContent &&
          <VunetHelp
            metaData={EVALUATION_SCRIPT_SECTION_HELP_OBJ}
            onClose={() => { this.toggleHelpContent(); }}
          />
        }

        {/* Body */}
        <div className="alert-condition-body">
          <div className="form-group">
            <label
              className="alert-rule-script-title"
              htmlFor="alert-rule-script-id"
            >
              Evaluation criteria
            </label>
            <textarea
              className={'form-control ' + (evaluationScriptErrorText && 'errorInput')}
              id="alert-rule-script-id"
              type="text"
              maxLength="5001"
              placeholder="Evaluation criteria script"
              onChange={(e) => callbackParams.updateScript(e)}
              onFocus={(e) => callbackParams.resize(e)}
              value={alertConfig.parsedEvalCriteria.expression}
            />
            {evaluationScriptErrorText &&
              (
                <div className="errorFieldText">{evaluationScriptErrorText}</div>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}
