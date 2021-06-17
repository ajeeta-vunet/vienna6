
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

import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import { VunetSelect } from 'ui_framework/src/vunet_components/vunet_select/vunet_select';
import { DURATION_TYPES, CONTROL_SECTION_HELP_OBJ } from '../alert_constants';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';

const HELP_CONTENT_TYPE = {
  controlSection: 'controlSection',
  controlBehaviorSection: 'controlBehaviorSection',
  controlChannelSection: 'controlChannelSection'
};

// This component provides the 'AlertControlSection' section of the alert page
export class AlertControlSection extends React.Component {
  // export function AlertControlSection(props) {
  constructor(props) {
    super(props);
    this.state = {
      displayHelpContent: {
        controlSection: false,
        controlBehaviorSection: false,
        controlChannelSection: false,
      }
    };
  }

  // enable/disable help content
  toggleHelpContent = (type) => {
    const displayHelpContent = { ...this.state.displayHelpContent };
    switch (type) {
      case HELP_CONTENT_TYPE.controlSection:
        displayHelpContent.controlSection = !displayHelpContent.controlSection;
        break;

      case HELP_CONTENT_TYPE.controlBehaviorSection:
        displayHelpContent.controlBehaviorSection = !displayHelpContent.controlBehaviorSection;
        break;

      case HELP_CONTENT_TYPE.controlChannelSection:
        displayHelpContent.controlChannelSection = !displayHelpContent.controlChannelSection;
        break;
    }
    this.setState({ displayHelpContent: displayHelpContent });
  }

  render() {
    const callbackParams = this.props.alertControlSectionObj;
    const alertConfig = this.props.alertConfig;
    const errorObj = this.props.errorObj;

    // Generate Throttle Block body
    const generateThrottleBlock = () => {
      const throttleDurationErrorText = errorObj.throttleDuration.errorText;
      return (
        <div className="set-throttle-container">
          <div className="throttle-duration-container form-group">
            <label
              className="metric-title"
              htmlFor="throttle-duration"
            >
              After Triggering the Alert, don&apos;t trigger it for*
            </label>
            <input
              className={'throttle-duration form-control ' + (throttleDurationErrorText && 'errorInput')}
              type="number"
              min="1"
              id="throttle-duration"
              onChange={(e) => callbackParams.updateAlertControlInfo('throttleDuration', e.target.value)}
              value={alertConfig.throttleDuration}
            />
            {throttleDurationErrorText &&
              (
                <div className="errorFieldText">{throttleDurationErrorText}</div>
              )
            }
          </div>
          <div className="throttle-duration-type-container">
            <select
              className="throttle-duration-type form-control"
              onChange={(e) => callbackParams.updateAlertControlInfo('throttleDurationType', e.target.value)}
              value={alertConfig.throttleDurationType}
            >
              {_.sortBy(DURATION_TYPES, o => o.label).map((option, i) =>
                <option key={option.label + i} value={option.value}>{option.label}</option>
              )};
            </select>
          </div>
        </div>
      );
    };

    // Generate Alert Duration Block body
    const generateAlertDurationBlock = () => {
      const activeStartTimeErrorText = errorObj.activeStartTime.errorText;
      const activeEndTimeErrorText = errorObj.activeEndTime.errorText;
      return (
        <div className="alert-duration-body">
          <div className="duration-from">
            <input
              className={'form-control ' + (activeStartTimeErrorText && 'errorInput')}
              type="time"
              step="1"
              onChange={(e) => callbackParams.updateAlertControlInfo('startTime', e.target.value)}
              value={alertConfig.activeStartTime}
            />
            {activeStartTimeErrorText &&
              (
                <div className="errorFieldText">{activeStartTimeErrorText}</div>
              )
            }
          </div>
          <span className="duration-text">
            To
          </span>
          <div className="duration-to">
            <input
              className={'form-control ' + (activeEndTimeErrorText && 'errorInput')}
              type="time"
              step="1"
              onChange={(e) => callbackParams.updateAlertControlInfo('endTime', e.target.value)}
              value={alertConfig.activeEndTime}
            />
            {activeEndTimeErrorText &&
              (
                <div className="errorFieldText">{activeEndTimeErrorText}</div>
              )
            }
          </div>
        </div>
      );
    };

    // Generate Alert Email Block body
    const generateAlertEmailBlock = () => {
      const alertEmailIdErrorText = errorObj.alertEmailId.errorText;
      const alertEmailGroupHandlerErrorText = errorObj.alertEmailGroupHandler.errorText;
      const alertEmailBodyErrorText = errorObj.alertEmailBody.errorText;
      return (
        <div className="email-body">
          <div className="email-group-recipient-wrapper row">
            <div className="col-md-6 form-group">
              <label
                className="recipient-list-title"
                htmlFor="recipient-list-id"
              >
                Recipient list*
              </label>
              <input
                className={'form-control ' + (alertEmailIdErrorText && 'errorInput')}
                id="recipient-list-id"
                type="text"
                onChange={(e) => callbackParams.updateAlertControlInfo('alertEmailId', e.target.value)}
                value={alertConfig.alertEmailId}
              />
              {alertEmailIdErrorText &&
                (
                  <div className="errorFieldText">{alertEmailIdErrorText}</div>
                )
              }
            </div>
            <div className="col-md-6 form-group">
              <div className="email-group-title">
                Email Group*
              </div>
              <div
                className={'email-group-listbox ' +
                  (alertEmailGroupHandlerErrorText && 'multiselect-error')}
              >
                <VunetSelect
                  placeholder="Select"
                  values={alertConfig.alertEmailGroupHandler}
                  options={_.sortBy(callbackParams.allEmailGroups, o => o.value)}
                  callback={(e) => { callbackParams.updateAlertControlInfo('alertEmailGroupList', e.values); }}
                  multiple
                />
                {alertEmailGroupHandlerErrorText &&
                  (
                    <div className="errorFieldText">{alertEmailGroupHandlerErrorText}</div>
                  )
                }
              </div>
            </div>
          </div>
          <div className="email-body-wrapper form-group">
            <label
              htmlFor="email-body-id"
              className="email-body-title"
            >
              Email Body
            </label>
            <textarea
              className={'email-body form-control ' + (alertEmailBodyErrorText && 'errorInput')}
              id="email-body-id"
              maxLength="5001"
              onChange={(e) => callbackParams.updateAlertControlInfo('alertEmailBody', e.target.value)}
              value={alertConfig.alertEmailBody}
            />
            {alertEmailBodyErrorText &&
              (
                <div className="errorFieldText">{alertEmailBodyErrorText}</div>
              )
            }
          </div>
        </div>
      );
    };

    // Generate Alert Whatsapp Block body
    const generateAlertWhatsappBlock = () => {
      const whatappErrorText = errorObj.alertWhatsappNumber.errorText;
      return (
        <div className="whatsapp-body">
          <label
            htmlFor="whatsapp-id"
            className="whatsapp-body-title"
          >
            Mobile Number*
          </label>
          <div className="row">
            <div className="col-md-6">
              {/* whatsapp input will take multiple numbers separated by comma ','. For this sake its of type 'text' */}
              <input
                className={'form-control ' + (whatappErrorText && 'errorInput')}
                id="whatsapp-id"
                type="text"
                onChange={(e) => callbackParams.updateAlertControlInfo('whatsappNumber', e.target.value)}
                value={alertConfig.alertWhatsappNumber}
              />
              {whatappErrorText &&
                (
                  <div className="errorFieldText">{whatappErrorText}</div>
                )
              }
            </div>
            <div className="col-md-6" />
          </div>
        </div>
      );
    };

    // Generate Alert Runbook Block body
    const generateAlertRunbookBlock = () => {
      const runbookScriptErrorText = errorObj.runbook_script.errorText;
      return (
        <div className="runbook-body">
          <label
            htmlFor="runbook-id"
            className="runbook-body-title"
          >
            Script*
          </label>
          <div className="row">
            <div className="col-md-6">
              <textarea
                className={'form-control ' + (runbookScriptErrorText && 'errorInput')}
                id="runbook-id"
                type="text"
                maxLength="256"
                onChange={(e) => callbackParams.updateAlertControlInfo('alertRunbookScript', e.target.value)}
                value={alertConfig.runbook_script}
              />
              {runbookScriptErrorText &&
                (
                  <div className="errorFieldText">{runbookScriptErrorText}</div>
                )
              }
            </div>
            <div className="col-md-6" />
          </div>
        </div>
      );
    };

    // Generate Alert Report Block body
    const generateAlertReportBlock = () => {
      const alertReportListHandlerErrorText = errorObj.alertReportListHandler.errorText;
      return (
        <div className="report-body row">
          <div
            className={'report-list col-md-6 ' +
              (alertReportListHandlerErrorText && 'multiselect-error')}
          >
            <VunetSelect
              placeholder="Select"
              values={alertConfig.alertReportListHandler}
              options={_.sortBy(callbackParams.allReportTitles, o => o.value)}
              callback={(e) => { callbackParams.updateAlertControlInfo('alertReportList', e.values); }}
              multiple
            />
            {alertReportListHandlerErrorText &&
              (
                <div className="errorFieldText">{alertReportListHandlerErrorText}</div>
              )
            }
          </div>
          <div className="col-md-6" />
        </div>
      );
    };

    // Generate Alert Ansible book Block body
    const generateAlertAnsibleBlock = () => {
      const ansiblePlaybookNameErrorText = errorObj.ansible_playbook_name.errorText;
      const ansiblePlaybookOptionsErrorText = errorObj.ansible_playbook_options.errorText;
      return (
        <div className="ansible-body row">
          <div className="col-md-6 form-group">
            <label
              className="ansible-name-title"
              htmlFor="ansible-name-id"
            >
              Name*
            </label>
            <input
              className={'form-control ' + (ansiblePlaybookNameErrorText && 'errorInput')}
              id="ansible-name-id"
              type="text"
              onChange={(e) => callbackParams.updateAlertControlInfo('ansiblePlaybookName', e.target.value)}
              value={alertConfig.ansible_playbook_name}
            />
            {ansiblePlaybookNameErrorText &&
              (
                <div className="errorFieldText">{ansiblePlaybookNameErrorText}</div>
              )
            }
          </div>
          <div className="col-md-6 form-group">
            <label
              htmlFor="ansible-options-id"
              className="ansible-options-title"
            >
              Options*
            </label>
            <input
              className={'form-control ' + (ansiblePlaybookOptionsErrorText && 'errorInput')}
              id="ansible-options-id"
              type="text"
              onChange={(e) => callbackParams.updateAlertControlInfo('ansiblePlaybookOptions', e.target.value)}
              value={alertConfig.ansible_playbook_options}
            />
            {ansiblePlaybookOptionsErrorText &&
              (
                <div className="errorFieldText">{ansiblePlaybookOptionsErrorText}</div>
              )
            }
          </div>
        </div>
      );
    };

    const {
      displayHelpContent
    } = this.state;
    return (
      <div className="alert-control-section">

        {/* Header */}
        <div className="alert-control-header">
          <span className="header-number">
            05.
          </span>
          <span className="header-title">
            Control your Alerts
          </span>
          <i
            className="help-icon icon-help-blue"
            onClick={() => {
              this.toggleHelpContent(HELP_CONTENT_TYPE.controlSection);
            }}
          />
        </div>

        {/* Alert Control Section Help Content */}
        {displayHelpContent.controlSection &&
          <VunetHelp
            backgroundColor="white"
            metaData={CONTROL_SECTION_HELP_OBJ.controlSection}
            onClose={() => {
              this.toggleHelpContent(HELP_CONTENT_TYPE.controlSection);
            }}
          />
        }

        {/* Body */}
        <div className="alert-control-body">
          <div className="channel-behavior-header">
            <div className="title">
              Alert Behavior
              <i
                className="help-icon icon-help-blue"
                onClick={() => {
                  this.toggleHelpContent(HELP_CONTENT_TYPE.controlBehaviorSection);
                }}
              />
            </div>
            <div className="title-desc">
              Use the below to configure the alert behavior
            </div>
          </div>

          {/* Alert Behavior Help Content */}
          {displayHelpContent.controlBehaviorSection &&
            <VunetHelp
              backgroundColor="white"
              metaData={CONTROL_SECTION_HELP_OBJ.controlBehaviorSection}
              onClose={() => {
                this.toggleHelpContent(HELP_CONTENT_TYPE.controlBehaviorSection);
              }}
            />
          }

          {/* Alert Alarm mode */}
          <div className="alert-alarm-mode alert-control-switch-item">
            <VunetSwitch
              onChange={() => { callbackParams.updateAlertControlInfo('enableAlarmMode'); }}
              checked={alertConfig.enableAlarmMode}
            />
            <span className="alarm-mode-title title">
              Enable Alarm Mode
            </span>
          </div>

          {/* Alert Throttle */}
          <div className="alert-throttle-wrapper">
            <div className="alert-throttle-switch alert-control-switch-item">
              <VunetSwitch
                onChange={() => { callbackParams.updateAlertControlInfo('enableThrottle'); }}
                checked={alertConfig.enableThrottle}
              />
              <span className="title">
                Throttling
              </span>
            </div>
            {alertConfig.enableThrottle &&
              generateThrottleBlock()
            }
          </div>

          {/* Alert Duration */}
          <div className="alert-duration-wrapper">
            <div className="alert-duration-container">
              <div className="alert-duration-header">
                <div className="alert-duration-switch alert-control-switch-item">
                  <VunetSwitch
                    onChange={() => { callbackParams.updateAlertControlInfo('enableAlertDuration'); }}
                    checked={alertConfig.activeAlertCheck}
                  />
                  <span className="alert-duration-title title">
                    Enable Alerts During
                  </span>
                </div>
                {alertConfig.activeAlertCheck ? (
                  <div className="alert-days-container">
                    <div className="alert-days-title">
                      Select the days
                    </div>
                    {
                      alertConfig.parsedWeekdaysList.map((day) => {
                        return (
                          <span
                            key={day.name}
                            className={day.selected && 'alert-day-selected'}
                            onClick={() => callbackParams.updateAlertControlInfo('enableAlertForADay', day.name)}
                          >
                            {day.name[0]}
                          </span>
                        );
                      })
                    }
                  </div>
                ) : null
                }
              </div>
              {alertConfig.activeAlertCheck &&
                generateAlertDurationBlock()
              }
            </div>
          </div>

          {/* Alert Advanced Config */}
          <div className="alert-advanced-config">
            <div className="advanced-config-header alert-control-switch-item">
              <VunetSwitch
                onChange={() => { callbackParams.updateAlertControlInfo('enableAlertAdvancedConfig'); }}
                checked={alertConfig.enableAdvancedConfig}
              />
              <span className="advanced-config-switch-title title">
                Enable Advanced Configuration
              </span>
            </div>
            {alertConfig.enableAdvancedConfig ? (
              <div className="advanced-config-body">
                <textarea
                  className={'form-control ' + (errorObj.advancedConfiguration.errorText && 'errorInput')}
                  type="text"
                  maxLength="5001"
                  placeholder="Advanced Configuration"
                  onChange={(e) => callbackParams.updateAlertControlInfo('advancedConfig', e.target.value)}
                  value={alertConfig.advancedConfiguration}
                />
                {errorObj.advancedConfiguration.errorText &&
                  (
                    <div className="errorFieldText">{errorObj.advancedConfiguration.errorText}</div>
                  )
                }
              </div>
            ) : null
            }
          </div>

          <div className="alert-channel-container">
            <div className="channel-header">
              <div className="title">
                Alert channel
                <i
                  className="help-icon icon-help-blue"
                  onClick={() => {
                    this.toggleHelpContent(HELP_CONTENT_TYPE.controlChannelSection);
                  }}
                />
              </div>
              <div className="title-desc">
                Use the below channels to get notified when there is an alert
              </div>
            </div>

            {/* Alert Channel Help Content */}
            {displayHelpContent.controlChannelSection &&
              <VunetHelp
                backgroundColor="white"
                metaData={CONTROL_SECTION_HELP_OBJ.controlChannelSection}
                onClose={() => {
                  this.toggleHelpContent(HELP_CONTENT_TYPE.controlChannelSection);
                }}
              />
            }

            <div className="channel-body">
              {/* Alert Ticket */}
              <div className="ticket-switch alert-control-switch-item">
                <VunetSwitch
                  onChange={() => { callbackParams.updateAlertControlInfo('enableAlertTicket'); }}
                  checked={alertConfig.alertByTicket}
                />
                <span className="title">
                  Tickets
                </span>
              </div>

              {/* whatsApp */}
              <div className="whatsapp-container">
                <div className="whatsapp-header alert-control-switch-item">
                  <VunetSwitch
                    onChange={() => { callbackParams.updateAlertControlInfo('enableAlertWhatsapp'); }}
                    checked={alertConfig.alertByWhatsapp}
                  />
                  <span className="title">
                    WhatsApp
                  </span>
                </div>
                {alertConfig.alertByWhatsapp &&
                  generateAlertWhatsappBlock()
                }
              </div>

              {/* Email */}
              <div className="email-container">
                <div className="email-header alert-control-switch-item">
                  <VunetSwitch
                    onChange={() => { callbackParams.updateAlertControlInfo('enableAlertEmail'); }}
                    checked={alertConfig.alertByEmail}
                  />
                  <span className="title">
                    Email
                  </span>
                </div>
                {alertConfig.alertByEmail &&
                  generateAlertEmailBlock()
                }
              </div>

              {/* Runbook Automation */}
              <div className="runbook-container">
                <div className="runbook-header alert-control-switch-item">
                  <VunetSwitch
                    onChange={() => { callbackParams.updateAlertControlInfo('enableAlertRunbook'); }}
                    checked={alertConfig.enable_runbook_automation}
                  />
                  <span className="title">
                    Runbook Automation
                  </span>
                </div>
                {alertConfig.enable_runbook_automation &&
                  generateAlertRunbookBlock()
                }
              </div>

              {/* Ansible Playbook */}
              <div className="ansible-container">
                <div className="ansible-head alert-control-switch-item">
                  <VunetSwitch
                    onChange={() => { callbackParams.updateAlertControlInfo('enableAlertAnsible'); }}
                    checked={alertConfig.enable_ansible_playbook}
                  />
                  <span className="title">
                    Ansible Playbook
                  </span>
                </div>
                {alertConfig.enable_ansible_playbook &&
                  generateAlertAnsibleBlock()
                }
              </div>

              {/* Report */}
              <div className="report-container">
                <div className="report-head alert-control-switch-item">
                  <VunetSwitch
                    onChange={() => { callbackParams.updateAlertControlInfo('enableAlertReport'); }}
                    checked={alertConfig.alertByReport}
                  />
                  <span className="title">
                    Reports
                  </span>
                </div>
                {alertConfig.alertByReport &&
                  generateAlertReportBlock()
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
