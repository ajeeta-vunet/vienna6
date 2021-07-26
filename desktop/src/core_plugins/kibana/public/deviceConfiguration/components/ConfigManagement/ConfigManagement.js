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

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React, { Component } from 'react';
import './ConfigManagement.less';
import moment from 'moment';
import { VunetCronTab } from 'ui_framework/src/vunet_components/vunet_cron_tab/vunet_cron_tab';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { produce } from 'immer';
import $ from 'jquery';

export class ConfigManagement extends Component {
  constructor(props) {
    super(props);
    // if 'schedule_at' and 'periodic_schedule' is not assigned, set them as empty string
    // else, set these values appropriately
    let scheduleAt = '';
    let periodicSchedule = '';
    let scheduleFrequency = '';
    if (
      this.props.deviceObj.config_collection_settings[0].schedule_at.length > 0
    ) {
      scheduleAt = moment(
        this.props.deviceObj.config_collection_settings[0].schedule_at
      )
        .format()
        .slice(0, -6)
        .replace(' ', 'T');
    }
    if (
      this.props.deviceObj.config_collection_settings[0].periodic_schedule
        .length > 0
    ) {
      periodicSchedule =
        this.props.deviceObj.config_collection_settings[0].periodic_schedule;
      scheduleFrequency =
        this.props.deviceObj.config_collection_settings[0].frequency;
    }
    this.state = {
      deviceObj: this.props.deviceObj,
      scheduleAt,
      periodicSchedule,
      scheduleFrequency,
      showScheduleAt:
        this.props.deviceObj.config_collection_settings[0].schedule_at.length >
        0
          ? true
          : false,
      showPeriodicSchedule:
        this.props.deviceObj.config_collection_settings[0].periodic_schedule
          .length > 0
          ? true
          : false,
    };
  }

  // if 'schedule_at' and 'periodic_schedule' values are already present for a device,
  // check the check-boxes corresponding to them
  componentDidMount() {
    if (
      this.props.deviceObj.config_collection_settings[0].schedule_at.length > 0
    ) {
      $('#schedule').prop('checked', true);
    }
    if (
      this.props.deviceObj.config_collection_settings[0].periodic_schedule
        .length > 0
    ) {
      $('#periodic').prop('checked', true);
    }
  }

  // on user's interaction with "schedule-time" date-time component
  saveConfigCollectTime = (e) => {
    const scheduleAt = moment(e.target.value)
      .format()
      .slice(0, -6)
      .replace('T', ' ');
    let periodicSchedule = '';
    let frequency = '';
    if (this.state.periodicSchedule.length > 0) {
      periodicSchedule = this.state.periodicSchedule;
      frequency = this.state.scheduleFrequency;
    }
    const configCollectionSettings = [
      {
        schedule_at: scheduleAt,
        periodic_schedule: periodicSchedule,
        frequency: frequency
      },
    ];
    const deviceObj = produce(this.state.deviceObj, (draft) => {
      draft.config_collection_settings = configCollectionSettings;
    });
    this.setState({ deviceObj, scheduleAt: e.target.value });
  };

  // on user's interaction with cron tab
  saveConfigCollectSchedule = (e) => {
    const periodicSchedule = e.cronString;
    const frequency = e.scheduleFrequency;
    let scheduleAt = '';
    if (this.state.scheduleAt.length > 0) {
      scheduleAt = moment(this.state.scheduleAt)
        .format()
        .slice(0, -6)
        .replace('T', ' ');
    }
    const configCollectionSettings = [
      {
        schedule_at: scheduleAt,
        periodic_schedule: periodicSchedule,
        frequency: frequency
      },
    ];
    const deviceObj = produce(this.state.deviceObj, (draft) => {
      draft.config_collection_settings = configCollectionSettings;
    });
    this.setState(
      {
        deviceObj,
        periodicSchedule: e.cronString,
        scheduleFrequency: e.scheduleFrequency,
      }
    );
  };

  // when user interacts with the checkboxes corresponding to
  // 'Schedule At' and 'Periodic'
  onCheckBoxChange = () => {
    let configCollectionSettings;
    const scheduleAt =
      this.state.scheduleAt.length > 0
        ? moment(this.state.scheduleAt).format().slice(0, -6).replace('T', ' ')
        : '';
    const periodicSchedule = this.state.periodicSchedule.length > 0
      ? this.state.periodicSchedule : '';
    const frequency = this.state.periodicSchedule.length > 0
      ? this.state.scheduleFrequency : '';
    // if both the checkboxes are clicked
    if ($('#schedule').prop('checked') && $('#periodic').prop('checked')) {
      configCollectionSettings = [
        {
          schedule_at: scheduleAt,
          periodic_schedule: periodicSchedule,
          frequency: frequency
        },
      ];
      this.setState({ showScheduleAt: true, showPeriodicSchedule: true });
    } else if ($('#schedule').prop('checked')) {
      configCollectionSettings = [
        {
          schedule_at: scheduleAt,
          periodic_schedule: '',
          frequency: ''
        },
      ];
      this.setState({
        periodicSchedule: '',
        scheduleFrequency: '',
        showScheduleAt: true,
        showPeriodicSchedule: false,
      });
    } else if ($('#periodic').prop('checked')) {
      configCollectionSettings = [
        {
          schedule_at: '',
          periodic_schedule: periodicSchedule,
          frequency: frequency
        },
      ];
      this.setState({
        scheduleAt: '',
        showScheduleAt: false,
        showPeriodicSchedule: true,
      });
    } else {
      // if both the checkboxes are unchecked
      configCollectionSettings = [
        {
          schedule_at: '',
          periodic_schedule: '',
          frequency: ''
        },
      ];
      this.setState({
        scheduleAt: '',
        periodicSchedule: '',
        scheduleFrequency: '',
        showPeriodicSchedule: false,
        showScheduleAt: false,
      });
    }
    const deviceObj = produce(this.state.deviceObj, (draft) => {
      draft.config_collection_settings = configCollectionSettings;
    });
    this.setState({ deviceObj });
  };

  // if rendered for 'View Device', go back to 'Device Details' section
  // if rendered for 'Edit Device', go back along with edited deviceDetails
  previousSection = () => {
    if(this.props.action === 'viewSnapshots') {
      this.props.navigateToPrevious('deviceDetails');
    } else {
      this.props.navigateToPrevious('deviceDetails', this.state.deviceObj);
    }
  }

  // call parent component's navigateToNext() method
  // if rendered for 'View Device', navigate to snapshots
  // else dit the device
  nextSection = () => {
    this.props.navigateToNext(this.state.deviceObj);
  }

  // disable user input for 'View Device'
  disableUserInput = () => {
    if(this.props.action === 'viewSnapshots') {
      return true;
    } else {
      return false;
    }
  }

  render() {
    return (
      <div className="config-management">
        <form className="config-management-form" autoComplete="off">
          <div className="config-collect-title">Config Collection Settings</div>
          <div className="schedule-time">
            <input
              type="checkbox"
              id="schedule"
              className="row-item-checkbox"
              onChange={this.onCheckBoxChange}
              disabled={this.disableUserInput()}
            />
            <label>Schedule At</label>
            {($('#schedule').prop('checked') || this.state.showScheduleAt) && (
              <input
                type="datetime-local"
                id="scheduleAt"
                className="schedule-at"
                onChange={(e) => this.saveConfigCollectTime(e)}
                value={this.state.scheduleAt}
                disabled={this.disableUserInput()}
              />
            )}
          </div>
          <div className="schedule-time">
            <input
              type="checkbox"
              id="periodic"
              className="row-item-checkbox"
              onChange={this.onCheckBoxChange}
              disabled={this.disableUserInput()}
            />
            <label>Periodic</label>
            { ($('#periodic').prop('checked') ||
              this.state.showPeriodicSchedule) && (
                <div className="schedule-time-cron">
                  <VunetCronTab
                    getCronInfo={this.saveConfigCollectSchedule}
                    cronString={this.state.periodicSchedule}
                    frequency={this.state.scheduleFrequency}
                  />
                </div>
              )
            }
          </div>
        </form>
        <VunetButton
          id="backBtn"
          className="secondary"
          text="Back"
          onClick={this.previousSection}
        />
        <VunetButton
          id="nextBtn"
          className="primary add-or-edit-continue"
          text={this.props.action === 'viewSnapshots' ? 'Next' : 'Save'}
          onClick={this.nextSection}
        />
      </div>
    );
  }
}
