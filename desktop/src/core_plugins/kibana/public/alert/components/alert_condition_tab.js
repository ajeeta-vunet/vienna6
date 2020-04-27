
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
import { AlertConditionsSection } from './alert_conditions_section';
import { AlertAboutSection } from './alert_about_section';
import { AlertRuleEvaluationScriptSection } from './alert_rule_evaluation_script_section';
import { AlertControlSection } from './alert_control_section';
import { AlertRuleEvaluationConditionSection } from './alert_rule_evaluation_condition_section';
import { ALERT_CONDITION_TAB_HEADER_TEXT } from '../alert_constants';

// This component provides the Alert Condition Tab of the alert page
export class AlertConditionTab extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const {
      alertConditionSectionObj,
      alertRuleEvaluationScriptSectionObj,
      alertRuleEvaluationConditionSectionObj,
      alertAboutSectionObj,
      alertControlSectionObj,
      alertConfig,
      errorObj
    } = this.props;
    return (
      <div className="alert-condition-tab-wrapper">

        {/* description */}
        <div className="tab-description">
          {ALERT_CONDITION_TAB_HEADER_TEXT}
        </div>

        <AlertAboutSection
          alertAboutSectionObj={alertAboutSectionObj}
          alertConfig={alertConfig}
          errorObj={errorObj}
        />

        <AlertConditionsSection
          alertConditionSectionObj={alertConditionSectionObj}
          alertConfig={alertConfig}
          errorObj={errorObj}
        />

        <AlertRuleEvaluationConditionSection
          alertRuleEvaluationConditionSectionObj={alertRuleEvaluationConditionSectionObj}
          alertConfig={alertConfig}
          errorObj={errorObj}
        />

        <AlertRuleEvaluationScriptSection
          alertRuleEvaluationScriptSectionObj={alertRuleEvaluationScriptSectionObj}
          alertConfig={alertConfig}
          errorObj={errorObj}
        />

        <AlertControlSection
          alertControlSectionObj={alertControlSectionObj}
          alertConfig={alertConfig}
          errorObj={errorObj}
        />
      </div>
    );
  }
}

