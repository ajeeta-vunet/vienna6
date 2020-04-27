
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

import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';
import { VunetSelect } from 'ui_framework/src/vunet_components/vunet_select/vunet_select';
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import {
  SEVERITY_TYPES, ACTION_TYPES, SOURCE_TYPES, COMPARISON_TYPES, CHANNEL_LIST_ACTION_TYPES,
  ACTION_LIST_ADD_DESTINATION_TYPES, ACTION_LIST_SET_DESTINATION_TYPES, ACTION_LIST_REMOVE_DESTINATION_TYPES,
  CHANNEL_LIST_ADD_CHANNEL_TYPES, CHANNEL_LIST_UPDATE_CHANNEL_TYPES, CHANNEL_LIST_MUTE_CHANNEL_TYPES,
  EVALUATION_CONDITION_SECTION_HELP_OBJ
} from '../alert_constants';

// This component provides the 'AlertRuleEvaluationConditionSection' section of the alert page
export class AlertRuleEvaluationConditionSection extends React.Component {
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
    const callbackParams = this.props.alertRuleEvaluationConditionSectionObj;
    const alertConfig = this.props.alertConfig;
    const errorObj = this.props.errorObj.parsedEvalCriteriaConditionList;

    // This method returns a Condition list item
    const generateConditionList = (alertConditionBlockItem, conditionBlockIndex, conditionListItem, conditionListIndex) => {
      const conditionListErrorHandler = errorObj[conditionBlockIndex].conditionList[conditionListIndex];
      const bmvErrorText = conditionListErrorHandler.bmv.errorText;
      const metricErrorText = conditionListErrorHandler.metric.errorText;
      const valueErrorText = conditionListErrorHandler.value.errorText;
      return (
        <div
          className="table-row"
          key={'ConditionList' + conditionBlockIndex + conditionListIndex}
        >
          {
            conditionListItem.source === 'metric' ?
              (
                <div className="table-row-source">
                  <div className="source-item">
                    <select
                      className="form-control"
                      onChange={
                        (e) => callbackParams.updateConditionList(conditionBlockIndex, conditionListIndex, 'source', e.target.value)
                      }
                      value={conditionListItem.source}
                    >
                      {_.sortBy(SOURCE_TYPES, o => o.label).map((option, i) =>
                        <option key={option.label + i} value={option.value}>{option.label}</option>
                      )};
                    </select>
                  </div>
                  <div className="source-item">
                    <label
                      htmlFor="select-bmv-id"
                      className="alert-severity-title"
                    >
                      vuMetric
                    </label>
                    <select
                      className={'form-control ' + (bmvErrorText && 'errorInput')}
                      defaultValue={'default'}
                      id="select-bmv-id"
                      onChange={(e) => {
                        callbackParams.updateConditionList(conditionBlockIndex, conditionListIndex, 'bmv', e.target.value);
                      }}
                      value={conditionListItem.bmv.title}
                    >
                      <option value="default" disabled> -- select an option -- </option>
                      {_.sortBy(alertConfig.parsedRuleList, o => o.selectedMetric.title).map((ruleList, i) => {
                        if (ruleList.selectedMetric.title) {
                          return (
                            <option key={`${ruleList.selectedMetric.title}-${i}`} value={ruleList.selectedMetric.title}>
                              {ruleList.selectedMetric.title}
                            </option>
                          );
                        }
                      })
                      };
                    </select>
                    {bmvErrorText &&
                      (
                        <div className="errorFieldText">{bmvErrorText}</div>
                      )
                    }
                  </div>
                  <div className="source-item last-item">
                    <label
                      htmlFor="select-metric-id"
                      className="alert-severity-title"
                    >
                      Metric
                    </label>
                    <select
                      className={'form-control ' + (metricErrorText && 'errorInput')}
                      defaultValue={'default'}
                      id="select-metric-id"
                      disabled={!conditionListItem.bmv}
                      onChange={
                        (e) => callbackParams.updateConditionList(conditionBlockIndex, conditionListIndex, 'metric', e.target.value)
                      }
                      value={conditionListItem.metric}
                    >
                      <option value="default" disabled> -- select an option -- </option>
                      {
                        _.sortBy(conditionListItem.selectedBmvMetricList, o => o.label).map((metric, i) =>
                          <option key={`${metric.label}-${i}`} value={metric.label}>{metric.label}</option>
                        )
                      };
                    </select>
                    {metricErrorText &&
                      (
                        <div className="errorFieldText">{metricErrorText}</div>
                      )
                    }
                  </div>
                </div>
              ) :
              (
                <div className="table-row-source">
                  <select
                    className="form-control"
                    onChange={(e) => callbackParams.updateConditionList(conditionBlockIndex, conditionListIndex, 'source', e.target.value)}
                    value={conditionListItem.source}
                  >
                    {_.sortBy(SOURCE_TYPES, o => o.label).map((option, i) =>
                      <option key={option.label + i} value={option.value}>{option.label}</option>
                    )};
                  </select>
                </div>
              )
          }
          <div className="table-row-item">
            <select
              className="form-control"
              onChange={(e) => callbackParams.updateConditionList(conditionBlockIndex, conditionListIndex, 'comparison', e.target.value)}
              value={conditionListItem.comparison}
            >
              {COMPARISON_TYPES.map((option, i) =>
                <option key={option.label + i} value={option.value}>{option.label}</option>
              )};
            </select>
          </div>
          <div className="table-row-item">
            {conditionListItem.source === 'severity' ?
              <select
                required
                className={'form-control ' + (valueErrorText && 'errorInput')}
                onChange={(e) => callbackParams.updateConditionList(conditionBlockIndex, conditionListIndex, 'value', e.target.value)}
                value={conditionListItem.value}
              >
                {SEVERITY_TYPES.map((option, i) =>
                  <option key={option.label + i} value={option.value}>{option.label}</option>
                )};
              </select>
              :
              <input
                required
                className={'form-control ' + (valueErrorText && 'errorInput')}
                type={(conditionListItem.source === 'duration') && 'number'}
                onChange={(e) => callbackParams.updateConditionList(conditionBlockIndex, conditionListIndex, 'value', e.target.value)}
                value={conditionListItem.value}
              />
            }
            {valueErrorText &&
              (
                <div className="errorFieldText">{valueErrorText}</div>
              )
            }
          </div>
          <i
            style={alertConditionBlockItem.conditionList.length === 1 ? { display: 'none' } : null}
            className="table-row-bin-icon icon-delete"
            onClick={() => callbackParams.deleteConditionListItem(conditionBlockIndex, conditionListIndex)}
          />
        </div>
      );
    };

    // This method returns a Action list item
    const generateActionList = (alertConditionBlockItem, conditionBlockIndex, actionListItem, actionListIndex) => {
      const actionListErrorHandler = errorObj[conditionBlockIndex].actionList[actionListIndex];
      const valueErrorText = actionListErrorHandler.value.errorText;
      const isEnabled = alertConditionBlockItem.generateAlert;

      // depending on the action type the destinationTypes vary
      let destinationTypes = undefined;
      if (actionListItem.action === 'add') {
        destinationTypes = ACTION_LIST_ADD_DESTINATION_TYPES;
      } else if (actionListItem.action === 'set') {
        destinationTypes = ACTION_LIST_SET_DESTINATION_TYPES;
      } else {
        destinationTypes = ACTION_LIST_REMOVE_DESTINATION_TYPES;
      }

      return (
        <div
          className="table-row"
          key={'ActionList' + conditionBlockIndex + actionListIndex}
        >
          <div className="table-row-action">
            <select
              className="form-control"
              disabled={!isEnabled}
              onChange={(e) => callbackParams.updateActionList(conditionBlockIndex, actionListIndex, 'action', e.target.value)}
              value={actionListItem.action}
            >
              {_.sortBy(ACTION_TYPES, o => o.label).map((option, i) =>
                <option key={option.label + i} value={option.value}>{option.label}</option>
              )};
            </select>
          </div>
          <div className="table-row-item">
            <select
              className="form-control"
              disabled={!isEnabled}
              onChange={(e) => callbackParams.updateActionList(conditionBlockIndex, actionListIndex, 'destination', e.target.value)}
              value={actionListItem.destination}
            >
              {_.sortBy(destinationTypes, o => o.label).map((option, i) =>
                <option key={option.label + i} value={option.value}>{option.label}</option>
              )};
            </select>
          </div>

          <div className="table-row-item">
            {actionListItem.destination === 'severity' ?
              <select
                required
                disabled={!isEnabled}
                className={'form-control ' + (valueErrorText && 'errorInput')}
                onChange={(e) => callbackParams.updateActionList(conditionBlockIndex, actionListIndex, 'value', e.target.value)}
                value={actionListItem.value}
              >
                {SEVERITY_TYPES.map((option, i) =>
                  <option key={option.label + i} value={option.value}>{option.label}</option>
                )};
              </select>
              :
              <input
                required
                disabled={!isEnabled}
                className={'form-control ' + (valueErrorText && 'errorInput')}
                type="text"
                onChange={(e) => callbackParams.updateActionList(conditionBlockIndex, actionListIndex, 'value', e.target.value)}
                value={actionListItem.value}
              />
            }

            {valueErrorText &&
              (
                <div className="errorFieldText">{valueErrorText}</div>
              )
            }
          </div>
          <i
            className={'table-row-bin-icon icon-delete ' +
              (!isEnabled ? 'disabledIcon' : null)
            }
            style={
              (alertConditionBlockItem.actionList.length === 1 && alertConditionBlockItem.channelList.length === 0
                ? { display: 'none' } : null)
            }
            onClick={() => {
              if (isEnabled) {
                // enable click event if icon is enabled
                callbackParams.deleteActionListItem(conditionBlockIndex, actionListIndex);
              }
            }}

          />
        </div>
      );
    };

    // This method returns a Channe list item
    const generateChannelList = (alertConditionBlockItem, conditionBlockIndex, channelListItem, channelListIndex) => {
      const channelListErrorHandler = errorObj[conditionBlockIndex].channelList[channelListIndex];
      const valueErrorText = channelListErrorHandler.value.errorText;
      const isEnabled = alertConditionBlockItem.generateAlert;

      // depending on the action type the destinationTypes vary
      let channelTypes = undefined;
      if (channelListItem.action === 'add') {
        channelTypes = CHANNEL_LIST_ADD_CHANNEL_TYPES;
      } else if (channelListItem.action === 'update') {
        channelTypes = CHANNEL_LIST_UPDATE_CHANNEL_TYPES;
      } else {
        channelTypes = CHANNEL_LIST_MUTE_CHANNEL_TYPES;
      }

      // the value field should be disabled if
      // 1) 'generate alert' is turned off, i.e entire block is disabled
      // 2) if actionType is 'mute'
      // 3) if channelType is 'ticketingSystem'
      const isValueDisabled = (!isEnabled) || (channelListItem.action === 'mute') || (channelListItem.channel === 'ticketingSystem');
      return (
        <div
          className="table-row"
          key={'ChannelList' + conditionBlockIndex + channelListIndex}
        >
          <div className="table-row-action">
            <select
              className="form-control"
              disabled={!isEnabled}
              onChange={(e) => callbackParams.updateChannelList(conditionBlockIndex, channelListIndex, 'action', e.target.value)}
              value={channelListItem.action}
            >
              {_.sortBy(CHANNEL_LIST_ACTION_TYPES, o => o.label).map((option, i) =>
                <option key={option.label + i} value={option.value}>{option.label}</option>
              )};
            </select>
          </div>
          <div className="table-row-item">
            <select
              className="form-control"
              disabled={!isEnabled}
              onChange={(e) => callbackParams.updateChannelList(conditionBlockIndex, channelListIndex, 'channel', e.target.value)}
              value={channelListItem.channel}
            >
              {_.sortBy(channelTypes, o => o.label).map((option, i) =>
                <option key={option.label + i} value={option.value}>{option.label}</option>
              )};
            </select>
          </div>
          <div className="table-row-item">
            {channelListItem.channel === 'emailGroup' &&
              <div className={'multi-select-style ' +
                (valueErrorText && 'multiselect-error ') + (isValueDisabled && 'multiselect-disabled ')}
              >
                <VunetSelect
                  placeholder="Select"
                  values={channelListItem.value}
                  options={_.sortBy(callbackParams.allEmailGroups, o => o.value)}
                  callback={(e) => { callbackParams.updateChannelList(conditionBlockIndex, channelListIndex, 'value', e.values); }}
                  multiple
                />
              </div>
            }
            {channelListItem.channel === 'report' &&
              <div className={'multi-select-style ' +
                (valueErrorText && 'multiselect-error ') + (isValueDisabled && 'multiselect-disabled ')}
              >
                <VunetSelect
                  placeholder="Select"
                  values={channelListItem.value}
                  options={_.sortBy(callbackParams.allReportTitles, o => o.value)}
                  callback={(e) => { callbackParams.updateChannelList(conditionBlockIndex, channelListIndex, 'value', e.values); }}
                  multiple
                />
              </div>
            }
            {(channelListItem.channel !== 'emailGroup' && channelListItem.channel !== 'report') &&
              <input
                required
                disabled={isValueDisabled}
                className={'form-control ' + (valueErrorText && 'errorInput')}
                type="text"
                onChange={(e) => callbackParams.updateChannelList(conditionBlockIndex, channelListIndex, 'value', e.target.value)}
                value={channelListItem.value}
              />
            }
            {valueErrorText &&
              (
                <div className="errorFieldText">{valueErrorText}</div>
              )
            }

          </div>
          <i
            className={'table-row-bin-icon icon-delete ' +
              (!isEnabled ? 'disabledIcon' : null)
            }
            style={
              (alertConditionBlockItem.channelList.length === 1 && alertConditionBlockItem.actionList.length === 0
                ? { display: 'none' } : null)
            }
            onClick={() => {
              if (isEnabled) {
                // enable click event if icon is enabled
                callbackParams.deleteChannelListItem(conditionBlockIndex, channelListIndex);
              }
            }}
          />
        </div>
      );
    };

    // This method provides an entire logic block
    const generateLogicBlock = (alertConditionBlockItem, conditionBlockIndex) => {
      const conditionBlockErrorHandler = errorObj[conditionBlockIndex];
      const blockLabelErrorText = conditionBlockErrorHandler.blockLabel.errorText;
      return (
        <div
          className="logic-block"
          key={'logic-block' + conditionBlockIndex + !alertConditionBlockItem.expanded}
        >

          {/* Block Header */}
          <div className="block-header" >
            <i
              className={'expand-collapse-icon ' + (!alertConditionBlockItem.expanded ? 'icon-arrow-up' : 'icon-arrow-down')}
              onClick={() => callbackParams.expandLogicBlock(conditionBlockIndex)}
            />
            <div className="block-text">
              <input
                required
                className={'form-control ' + (blockLabelErrorText && 'errorInput')}
                type="text"
                onChange={(e) => callbackParams.updateLogicBlock(conditionBlockIndex, 'blockLabel', e.target.value)}
                value={alertConditionBlockItem.blockLabel}
                placeholder={`Logic Block ${conditionBlockIndex}`}
              />
              {blockLabelErrorText &&
                (
                  <div className="errorFieldText">{blockLabelErrorText}</div>
                )
              }
            </div>
            <div className="reorder-icon-container">
              {/* Up arrow */}
              <i
                className={'reorder-icon-up icon-arrow-up ' +
                  (conditionBlockIndex === 0 ? 'disabledIcon' : null)
                }
                onClick={() => callbackParams.moveLogicBlockUp(conditionBlockIndex)}
              />
              {/* Down arrow */}
              <i
                className={'reorder-icon-down icon-arrow-down ' +
                  (
                    (conditionBlockIndex === alertConfig.parsedEvalCriteriaConditionList.length - 1)
                      ? 'disabledIcon' : null)
                }
                onClick={() => callbackParams.moveLogicBlockDown(conditionBlockIndex)}
              />
            </div>
            <i
              className="delete-icon icon-delete"
              onClick={() => callbackParams.deleteLogicBlock(conditionBlockIndex)}
            />
          </div>
          {!alertConditionBlockItem.expanded &&
            // Block Body
            <div className="block-body">
              <div className="switch-wrapper">
                <div className="radio-input-container">
                  <input
                    className="form-control radio-input"
                    type="radio"
                    value="any"
                    id={'any' + conditionBlockIndex}
                    name="matchCondition"
                    checked={!alertConditionBlockItem.matchAll}
                    onChange={(e) => { callbackParams.enableMatchAllCondition(conditionBlockIndex, e.target.value); }}
                  />
                  <label className="radio-input-text" htmlFor={'any' + conditionBlockIndex}>
                    Match any of the following conditions
                  </label>
                </div>

                <div className="radio-input-container">
                  <input
                    className="form-control radio-input"
                    type="radio"
                    value="all"
                    id={'all' + conditionBlockIndex}
                    name="matchCondition"
                    checked={alertConditionBlockItem.matchAll}
                    onChange={(e) => { callbackParams.enableMatchAllCondition(conditionBlockIndex, e.target.value); }}
                  />
                  <label className="radio-input-text" htmlFor={'all' + conditionBlockIndex}>
                    Match all the following conditions
                  </label>
                </div>

              </div>
              <div className="conditions-wrapper">
                <div className="conditions-container">
                  <div className="table-header">
                    <div className="table-row-source">Source</div>
                    <div className="table-row-item">Comparison</div>
                    <div className="table-row-item">Value</div>
                  </div>

                  <div className="table-body">
                    {
                      alertConditionBlockItem.conditionList.map((conditionListItem, conditionListIndex) => {
                        return (
                          generateConditionList(alertConditionBlockItem, conditionBlockIndex, conditionListItem, conditionListIndex)
                        );
                      })
                    }
                    <div className="add-button-container">
                      {/* allow only 8 condition list items to be added */}
                      {alertConditionBlockItem.conditionList.length < 8 &&
                        <div
                          className="add-button hover-effect"
                          onClick={() => callbackParams.addConditionListItem(conditionBlockIndex)}
                        >
                          <i className="add-icon icon-add-plus" />
                          <span className="add-text">
                            Add Condition
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="action-title-text">On Match</div>

              <div className="actions-wrapper">
                <div className="actions-container">

                  <div className="generate-alert-switch">
                    <VunetSwitch
                      onChange={() => { callbackParams.enableAlert(conditionBlockIndex); }}
                      checked={alertConditionBlockItem.generateAlert}
                    />
                    <span className="switch-text">
                      Generate Alert
                    </span>
                  </div>

                  <div className="action-table">
                    <div className="table-header">
                      <div className="table-row-source">Action</div>
                      <div className="table-row-item">Destination</div>
                      <div className="table-row-item">Value</div>
                    </div>
                    <div className="table-body">
                      {
                        alertConditionBlockItem.actionList.map((actionListItem, actionListIndex) => {
                          return (
                            generateActionList(alertConditionBlockItem, conditionBlockIndex, actionListItem, actionListIndex)
                          );
                        })
                      }
                      <div className="add-button-container">
                        {/* allow only 8 action list items to be added */}
                        {alertConditionBlockItem.actionList.length < 8 &&
                          <div
                            className={'add-button hover-effect ' +
                              (!alertConditionBlockItem.generateAlert ? 'disabledIcon' : null)
                            }
                            onClick={() => {
                              // Disable click event if generateAlert is false
                              if (alertConditionBlockItem.generateAlert) {
                                callbackParams.addActionListItem(conditionBlockIndex);
                              }
                            }}
                          >
                            <i className="add-icon icon-add-plus" />
                            <span className="add-text">
                              Add Action
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="channel-table">
                    <div className="table-header">
                      <div className="table-row-source">Action</div>
                      <div className="table-row-item">Channel</div>
                      <div className="table-row-item">Value</div>
                    </div>
                    <div className="table-body">
                      {
                        alertConditionBlockItem.channelList.map((channelListItem, channelListIndex) => {
                          return (
                            generateChannelList(alertConditionBlockItem, conditionBlockIndex, channelListItem, channelListIndex)
                          );
                        })
                      }
                      <div className="add-button-container">
                        {/* allow only 8 channel list items to be added */}
                        {alertConditionBlockItem.channelList.length < 8 &&
                          <div
                            className={'add-button hover-effect ' +
                              (!alertConditionBlockItem.generateAlert ? 'disabledIcon' : null)
                            }
                            onClick={() => {
                              // Disable click event if generateAlert is false
                              if (alertConditionBlockItem.generateAlert) {
                                callbackParams.addChannelListItem(conditionBlockIndex);
                              }
                            }}
                          >
                            <i className="add-icon icon-add-plus" />
                            <span className="add-text">
                              Add Action
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

      );
    };

    return (
      <div className="alert-rule-evaluation-condition-section">

        {/* Header */}
        <div className="alert-condition-header">
          <div className="header-number">
            03.
          </div>
          <div className="header-title">
            Rule Evaluation Conditions (Optional)
            <i
              className="help-icon icon-help-blue"
              onClick={() => { this.toggleHelpContent(); }}
            />
          </div>
          {alertConfig.parsedEvalCriteriaConditionList.length < 8 &&
            <div
              className="header-add-button hover-effect"
              onClick={() => callbackParams.addLogicBlock()}
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
            backgroundColor="white"
            metaData={EVALUATION_CONDITION_SECTION_HELP_OBJ}
            onClose={() => { this.toggleHelpContent(); }}
          />
        }

        {/* Body */}
        <div className="alert-condition-body">
          {
            alertConfig.parsedEvalCriteriaConditionList.map((alertConditionBlockItem, conditionBlockIndex) => {
              return (
                generateLogicBlock(alertConditionBlockItem, conditionBlockIndex)
              );
            })
          }
        </div>
      </div>
    );
  }
}
