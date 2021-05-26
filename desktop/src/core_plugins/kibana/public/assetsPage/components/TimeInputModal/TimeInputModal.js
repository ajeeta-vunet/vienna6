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

import React from 'react';
import './TimeInputModal.less';
import { generateHeading } from '../../../event/utils/vunet_format_name';
import moment from 'moment';
export class TimeInputModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      withinFlag: true,
      betweenFlag: false,
      withinTimeFrameValue: 15,
      withinTimeFrameOption: 'minutes',
      fromTime: new Date().toISOString().slice(0, 16),
      toTime: new Date().toISOString().slice(0, 16),
      appliedTimeFilter: '',
    };
  }

  //this function is called when the withIn radio button is clicked.
  enableWithinInput = () => {
    if (!this.state.withinFlag) {
      this.setState({ withinFlag: true, betweenFlag: false });
    }
  };

  //this function is called when the between radio button is clicked.
  enableBetweenInput = () => {
    if (!this.state.betweenFlag) {
      this.setState({ withinFlag: false, betweenFlag: true });
    }
  };

  //this function is called when the withIn time is entered.
  handleWithinTimeFrameValue = (e) => {
    const value = e.target.value;
    this.setState({ withinTimeFrameValue: value });
  };

  //this method is called when a 'select' timeFrame option is entered.
  handleWithinTimeFrameOption = (e) => {
    const value = e.target.value;
    this.setState({ withinTimeFrameOption: value });
  };

  //this method is called when a 'from' time is entered.
  handleFromTime = (e) => {
    const value = e.target.value;
    this.setState({ fromTime: value });
  };

  //this method is called when a 'to' time is entered.
  handleToTime = (e) => {
    const value = e.target.value;
    this.setState({ toTime: value });
  };

  //this method is used to calculate the start time when withIn input
  //of time field.
  dateAfterSubtracted = (range, amount) => {
    const now = new Date();

    if (range === 'years') {
      return now.setFullYear(now.getFullYear() - amount);
    } else if (range === 'months') {
      return now.setMonth(now.getMonth() - amount);
    } else if (range === 'weeks') {
      amount = amount * 7;
      return now.setDate(now.getDate() - amount);
    } else if (range === 'days') {
      return now.setDate(now.getDate() - amount);
    } else if (range === 'hours') {
      return now.setHours(now.getHours() - amount);
    } else if (range === 'minutes') {
      return now.setMinutes(now.getMinutes() - amount);
    } else {
      return null;
    }
  };

  //this method is used to handle the submit button
  //and call 'applyTimeFilter' method to apply the time filter.
  handleSubmit = () => {
    let startDateTime;
    let endDateTime;
    let appliedTimeFilter;
    if (this.state.withinFlag) {
      startDateTime = moment(
        new Date(
          this.dateAfterSubtracted(
            this.state.withinTimeFrameOption,
            this.state.withinTimeFrameValue
          )
        )
      )
        .format()
        .slice(0, -6)
        .replace('T', ' ');
      endDateTime = moment(new Date()).format().slice(0, -6).replace('T', ' ');

      appliedTimeFilter =
        generateHeading(this.props.timeFilter) +
        ' : Last ' +
        this.state.withinTimeFrameValue +
        ' ' +
        this.state.withinTimeFrameOption;
    } else {
      startDateTime = moment(this.state.fromTime).format();
      endDateTime = moment(this.state.toTime).format();
      appliedTimeFilter =
        generateHeading(this.props.timeFilter) +
        ' : ' +
        startDateTime +
        ' to ' +
        endDateTime;
    }

    this.props.applyTimeFilter(startDateTime, endDateTime, appliedTimeFilter);
    this.setState({ appliedTimeFilter });
  };

  //this function is used to display the time input form.
  renderTimeInputOptions = () => {
    return (
      <div className="time-input-form">
        <div className="within-time-input">
          <input
            checked={this.state.withinFlag}
            type="radio"
            id="within-last"
            name="time-input"
            value="within-last"
            onClick={() => this.enableWithinInput()}
          />
          <label htmlFor="within-last">
            Within the last
            <input
              disabled={!this.state.withinFlag}
              type="number"
              value={this.state.withinTimeFrameValue}
              onChange={(e) => this.handleWithinTimeFrameValue(e)}
            />
            <select
              disabled={!this.state.withinFlag}
              onChange={(event) => this.handleWithinTimeFrameOption(event)}
              value={this.state.withinTimeFrameOption}
            >
              <option>minutes</option>
              <option>hours</option>
              <option>days</option>
              <option>weeks</option>
              <option>months</option>
              <option>years</option>
            </select>
          </label>
        </div>
        <div className="between-time-input">
          <input
            type="radio"
            id="between"
            name="time-input"
            value="between"
            onClick={() => this.enableBetweenInput()}
          />
          <label htmlFor="between">
            Between
            <input
              disabled={!this.state.betweenFlag}
              type="datetime-local"
              max={moment().local().format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => this.handleFromTime(e)}
            />
            and
            <input
              disabled={!this.state.betweenFlag}
              type="datetime-local"
              max={moment().local().format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => this.handleToTime(e)}
            />
          </label>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="time-input-wrapper">
        <div className="title">{generateHeading(this.props.timeFilter)}</div>
        {this.renderTimeInputOptions()}
        <div className="actions">
          <input
            className="import-cancel-button"
            type="button"
            value="Cancel"
            onClick={() => this.props.cancelTimeModal()}
          />
          <input
            className="import-submit-button"
            type="button"
            value="Submit"
            id="submitButton"
            onClick={() => this.handleSubmit()}
          />
        </div>
      </div>
    );
  }
}
