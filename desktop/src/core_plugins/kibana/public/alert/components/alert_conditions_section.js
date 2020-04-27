
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
import _ from 'lodash';

import { DURATION_TYPES, CONDITION_SECTION_HELP_OBJ } from '../alert_constants';
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';

// This component provides the 'AlertConditionsSection' section of the alert page
export class AlertConditionsSection extends React.Component {
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

  // This method returns a condition block
  generateConditionBlock = (alertConditionItem, index) => {
    const errorObj = this.props.errorObj.parsedRuleList;
    const callbackParams = this.props.alertConditionSectionObj;
    const alertRuleList = this.props.alertConfig.parsedRuleList;

    // error text fields
    const ruleNameAliasErrorText = errorObj[index].ruleNameAlias.errorText;
    const selectedMetricErrorText = errorObj[index].selectedMetric.errorText;
    const ruleTypeDurationErrorText = errorObj[index].ruleTypeDuration.errorText;
    return (
      <div
        className="body-item"
        key={index}
      >
        <div className="body-title">
          <div className="body-title-number">
            R{index + 1}.
          </div>
          <div className="body-title-name">
            <input
              required
              className={'form-control ' + (ruleNameAliasErrorText && 'errorInput')}
              type="text"
              id={'ruleName' + index}
              placeholder="Rule Name"
              onChange={(e) => callbackParams.updateAlertConfig(index, 'alertLabel', e.target.value)}
              value={alertConditionItem.ruleNameAlias}
            />
          </div>

          {/* don't display delete icon only only one item is present */}
          {alertRuleList.length > 1 &&
            <i
              className="body-title-icon icon-delete"
              onClick={() => callbackParams.deleteCondition(index)}
            />
          }

          {/* don't display information collection only only one item is present */}
          {alertRuleList.length > 1 &&
            <div className="body-title-switch-wrapper">
              <div className="switch-container">
                <VunetSwitch
                  onChange={() => { callbackParams.updateAlertConfig(index, 'alertInformationCollector'); }}
                  checked={alertConditionItem.informationCollector}
                />
                <span className="switch-title">
                  Information collection only
                </span>
              </div>
            </div>
          }

          {ruleNameAliasErrorText &&
            (
              <div className="errorFieldText">{ruleNameAliasErrorText}</div>
            )
          }

        </div>
        <div className="body-data">
          <div className="select-metric-container form-group">
            <label
              className="metric-title"
              htmlFor={`select-metric-title-id ${index}`}
            >
              Select vuMetric*
            </label>
            <select
              className={'form-control metric-list ' + (selectedMetricErrorText && 'errorInput')}
              defaultValue={'default'}
              id={`select-metric-title-id ${index}`}
              onChange={(e) => callbackParams.updateAlertConfig(index, 'metric', e.target)}
              value={alertConditionItem.selectedMetric.title}
            >
              <option value="default" disabled> -- select an option -- </option>
              {_.sortBy(callbackParams.vuMetricList, o => o.title).map(metric =>
                <option key={metric.id} id={metric.id} value={metric.title}>{metric.title}</option>
              )};
            </select>
            {selectedMetricErrorText &&
              (
                <div className="errorFieldText">{selectedMetricErrorText}</div>
              )
            }
          </div>
          <div
            className="view-metric-container hover-effect"
            onClick={() => callbackParams.previewMetric(alertConditionItem.selectedMetric.id)}
          >
            <i className="view-metric-icon icon-eye" />
            <span className="view-metric-text">
              View vuMetric
            </span>
          </div>
          <div className="get-metric-container form-group">
            <label
              className="metric-title"
              htmlFor={`get-metric-title-id ${index}`}
            >
              Get Metric*
            </label>
            <div className="metric-data-container">
              <input
                className={'metric-data-number form-control ' + (ruleTypeDurationErrorText && 'errorInput')}
                id={`get-metric-title-id ${index}`}
                type="number"
                min="1"
                onChange={(e) => callbackParams.updateAlertConfig(index, 'duration', e.target.value)}
                value={alertConditionItem.ruleTypeDuration}
              />
              {ruleTypeDurationErrorText &&
                (
                  <div className="errorFieldText">{ruleTypeDurationErrorText}</div>
                )
              }
              <select
                className="metric-data-list form-control"
                onChange={(e) => callbackParams.updateAlertConfig(index, 'durationType', e.target.value)}
                value={alertConditionItem.ruleTypeDurationType}
              >
                {_.sortBy(DURATION_TYPES, o => o.label).map((option, i) =>
                  <option key={option.label + i} value={option.value}>{option.label}</option>
                )};
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const callbackParams = this.props.alertConditionSectionObj;
    const alertRuleList = this.props.alertConfig.parsedRuleList;

    return (
      <div className="alert-condition-section">

        {/* Header */}
        <div className="alert-condition-header">
          <div className="header-number">
            02.
          </div>
          <div className="header-title">
            Set Alert Condition
            <i
              className="help-icon icon-help-blue"
              onClick={() => { this.toggleHelpContent(); }}
            />
          </div>
          {alertRuleList.length < 8 &&
            <div
              className="header-add-button hover-effect"
              onClick={() => callbackParams.addCondition()}
            >
              <i className="header-add-icon icon-add-plus" />
              <span className="header-add-text">
                Add New Condition
              </span>
            </div>
          }
        </div>

        {/* Help Content */}
        {this.state.displayHelpContent &&
          <VunetHelp
            metaData={CONDITION_SECTION_HELP_OBJ}
            onClose={() => { this.toggleHelpContent(); }}
          />
        }

        {/* Body */}
        <div className="alert-condition-body">
          {
            alertRuleList.map((alertConditionItem, index) => {
              return (
                this.generateConditionBlock(alertConditionItem, index)
              );
            })
          }
        </div>
      </div>
    );
  }
}
