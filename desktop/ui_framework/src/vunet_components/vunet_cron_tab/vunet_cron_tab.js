
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './_index.less';
import CronBuilder from './lib/cronbuilder';

// This component helps user to build cron expressions. We have built this component on top of
// npm package: cron builder. We take the user inputs and then use the cron builder class and its
// methods to generate the cron expression.
export class VunetCronTab extends Component {

  constructor(props) {
    super(props);
    this.state = {

      // Display the date time pickers inputs
      // according to the  schedule frequency selected.
      operationCronDict: {
        showMinutePicker: false,
        showHourPicker: false,
        showDayPicker: false,
        showWeekPicker: false,
        showMonthPicker: false,
      },

      // Maintain the user selected time values in state.
      minuteSelectedList: [],
      hourSelectedList: [],
      daySelectedList: [],
      weekSelectedList: [],
      monthSelectedList: [],
    };

    // Initializing refs for all the select
    // components. This is needed to highlight
    // selected values in date time picker select boxes
    // for a given cron expression.
    this.frequencyRef = undefined;
    this.minuteRef = undefined;
    this.hourRef = undefined;
    this.dayRef = undefined;
    this.weekRef = undefined;
    this.monthRef = undefined;
    this.yearRef = undefined;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.frequency !== nextProps.frequency) {

      // If cronstring is received as props,
      // display the crontab with date and timepickers
      // highlighted with selected values.
      if (nextProps.cronString !== undefined &&
        nextProps.cronString !== '') {

        // cron string will be in the following format:
        // < * * * * * >.
        // Here the first star represents minute values
        // second represents hour values.
        // third represents day values.
        // fourth represents month values.
        // fifth represents week values.
        // Example cron expressions:
        // schedule job daily at 12 PM:  0 0 * * *
        // schedule job every sunday at 9 AM and 6PM : 0 9,18 * * 0
        const cronString = nextProps.cronString;

        // Get the values from cron expression and populate them
        // in state
        const cronValues = cronString && cronString.split(' ');
        this.setState({
          selectedFrequency: nextProps.frequency,
          minuteSelectedList: cronValues && cronValues[0].split(',') || [],
          hourSelectedList: cronValues && cronValues[1].split(',') || [],
          daySelectedList: cronValues && cronValues[2].split(',') || [],
          monthSelectedList: cronValues && cronValues[3].split(',') || [],
          weekSelectedList: cronValues && cronValues[4].split(',') || []
        }, () => {

          // Show the date time pickers as per the schedule frequency
          // selected.
          this.updateCronSelection(this.state.selectedFrequency);
        });

        // When no cron expression is provided to the component,
        // Use schedule frequency as 'day' by default.
      } else {
        this.updateCronSelection('day');
        this.prepareCronExpression();
      }
    }
  }

  componentDidUpdate() {

    // When cron expression is received as props
    // we render the date time pickers according to the schedule
    // frequency received and highlight the values in the select box
    // as per the cron expression
    if (this.state.selectedFrequency) {
      const selectedOptionObj = this.frequencyOptionsList.find((row) => {
        return row.value === this.state.selectedFrequency;
      });
      if (this.frequencyRef) {
        this.frequencyRef[selectedOptionObj.index].selected = true;
      }
    }

    // Hightlight the selected values in select box
    this.highlightValueSelection(this.state.minuteSelectedList, this.minuteRef, this.minuteOptionsList);
    this.highlightValueSelection(this.state.hourSelectedList, this.hourRef, this.hourOptionsList);
    this.highlightValueSelection(this.state.daySelectedList, this.dayRef, this.dayOptionsList);
    this.highlightValueSelection(this.state.monthSelectedList, this.monthRef, this.monthOptionsList);
    this.highlightValueSelection(this.state.weekSelectedList, this.weekRef, this.weekOptionsList);
  }

  // This is an option list used by
  // frequency select box
  frequencyOptionsList = [

    // We have to get this list as props and use whatever frequency values we need
    // as per the requirements. Currently we only need the following

    // { label: 'Minute', value: 'minute', index: 0 },
    // { label: 'Hour', value: 'hour', index: 1 },
    { label: 'Day', value: 'day', index: 0 },
    { label: 'Week', value: 'week', index: 1 },
    { label: 'Month', value: 'month', index: 2 },
    { label: 'Year', value: 'year', index: 3 }
  ]

  // This is an options list used by
  // minute picker select box.
  minuteOptionsList = [
    { label: '0', value: 0, index: 0 },
    { label: '5', value: 5, index: 1 },
    { label: '10', value: 10, index: 2 },
    { label: '15', value: 15, index: 3 },
    { label: '20', value: 20, index: 4 },
    { label: '25', value: 25, index: 5 },
    { label: '30', value: 30, index: 6 },
    { label: '35', value: 35, index: 7 },
    { label: '40', value: 40, index: 8 },
    { label: '45', value: 45, index: 9 },
    { label: '50', value: 50, index: 10 },
    { label: '55', value: 55, index: 11 }
  ];

  // This is an options list used by
  // hour picker select box.
  hourOptionsList = [
    { label: '0', value: 0, index: 0 },
    { label: '1', value: 1, index: 1 },
    { label: '2', value: 2, index: 2 },
    { label: '3', value: 3, index: 3 },
    { label: '4', value: 4, index: 4 },
    { label: '5', value: 5, index: 5 },
    { label: '6', value: 6, index: 6 },
    { label: '7', value: 7, index: 7 },
    { label: '8', value: 8, index: 8 },
    { label: '9', value: 9, index: 9 },
    { label: '10', value: 10, index: 10 },
    { label: '11', value: 11, index: 11 },
    { label: '12', value: 12, index: 12 },
    { label: '13', value: 13, index: 13 },
    { label: '14', value: 14, index: 14 },
    { label: '15', value: 15, index: 15 },
    { label: '16', value: 16, index: 16 },
    { label: '17', value: 17, index: 17 },
    { label: '18', value: 18, index: 18 },
    { label: '19', value: 19, index: 19 },
    { label: '20', value: 20, index: 20 },
    { label: '21', value: 21, index: 21 },
    { label: '22', value: 22, index: 22 },
    { label: '23', value: 23, index: 23 }
  ];

  // This is an options list used by
  // day picker select box.
  dayOptionsList = [
    { label: '1st', value: 1, index: 0 },
    { label: '2nd', value: 2, index: 1 },
    { label: '3rd', value: 3, index: 2 },
    { label: '4th', value: 4, index: 3 },
    { label: '5th', value: 5, index: 4 },
    { label: '6th', value: 6, index: 5 },
    { label: '7th', value: 7, index: 6 },
    { label: '8th', value: 8, index: 7 },
    { label: '9th', value: 9, index: 8 },
    { label: '10th', value: 10, index: 9 },
    { label: '11th', value: 11, index: 10 },
    { label: '12th', value: 12, index: 11 },
    { label: '13th', value: 13, index: 12 },
    { label: '14th', value: 14, index: 13 },
    { label: '15th', value: 15, index: 14 },
    { label: '16th', value: 16, index: 15 },
    { label: '17th', value: 17, index: 16 },
    { label: '18th', value: 18, index: 17 },
    { label: '19th', value: 19, index: 18 },
    { label: '20th', value: 20, index: 20 },
    { label: '21st', value: 21, index: 21 },
    { label: '22nd', value: 22, index: 22 },
    { label: '23rd', value: 23, index: 23 },
    { label: '24th', value: 24, index: 24 },
    { label: '25th', value: 25, index: 25 },
    { label: '26th', value: 26, index: 26 },
    { label: '27th', value: 27, index: 27 },
    { label: '28th', value: 28, index: 28 },
    { label: '29th', value: 29, index: 29 },
    { label: '30th', value: 30, index: 30 },
    { label: '31th', value: 31, index: 31 },
  ]

  // This is an options list used by
  // week picker select box.
  weekOptionsList = [
    { label: 'Sunday', value: 0, index: 0 },
    { label: 'Monday', value: 1, index: 1 },
    { label: 'Tuesday', value: 2, index: 2 },
    { label: 'Wednesday', value: 3, index: 3 },
    { label: 'Thursday', value: 4, index: 4 },
    { label: 'Friday', value: 5, index: 5 },
    { label: 'Saturday', value: 6, index: 6 }
  ]

  // This is an options list used by
  // month picker select box.
  monthOptionsList = [
    { label: 'January', value: 1, index: 0 },
    { label: 'Febrauary', value: 2, index: 1 },
    { label: 'March', value: 3, index: 2 },
    { label: 'April', value: 4, index: 3 },
    { label: 'May', value: 5, index: 4 },
    { label: 'June', value: 6, index: 5 },
    { label: 'July', value: 7, index: 6 },
    { label: 'August', value: 8, index: 7 },
    { label: 'September', value: 9, index: 8 },
    { label: 'October', value: 10, index: 9 },
    { label: 'November', value: 11, index: 10 },
    { label: 'December', value: 12, index: 11 },
  ];

  // This function highlights the options in a select box
  // based on the values in the selectedList. The following
  // are the arguments received by this function:
  // selectedList: List of values that are to be highlighted in select box.
  // refObject   : Reference to the select box whose options are to be highlighted.
  // optionsList : All the options of select box.
  highlightValueSelection = (selectedList, refObject, optionsList) => {

    selectedList && selectedList.map((value) => {
      const optionObj = optionsList.find((obj) => {
        return obj.value.toString() === value;
      });
      if (refObject && optionObj !== undefined) {
        refObject[optionObj.index].selected = true;
      }
    });
  }

  // This function returns an option tag using the 'label' and 'value'
  // keys present in the object('item') passed as argument
  getOption = function (item, keyPrefix) {
    return <option key={keyPrefix + item.label} value={item.value}>{item.label}</option>;
  };

  // Display the minute picker select box
  renderMinutePicker = () => {
    return (
      <div className="time-picker-container form-control-wrapper">
        <select
          className="form-control"
          id="minute"
          name="minute"
          ref={select => { this.minuteRef = select; }}
          onChange={(e) => { this.updateScheduleConfiguration(e.target.options, 'minute'); }}
          multiple
        >
          {this.minuteOptionsList.map((item) => {
            return this.getOption(item, 'minute');
          })}
        </select>
      </div>
    );
  }

  // Display the hour picker select box
  renderHourPicker = () => {
    return (
      <div className="time-picker-container">
        <div className="supporting-words"> at </div>
        <div className="form-control-wrapper">
          <select
            className="form-control"
            id="hour"
            name="hour"
            ref={select => { this.hourRef = select; }}
            onChange={(e) => { this.updateScheduleConfiguration(e.target.options, 'hour'); }}
            multiple
          >
            {this.hourOptionsList.map((item) => {
              return this.getOption(item, 'hour');
            })}
          </select>
        </div>
      </div>
    );
  }

  // Display the day picker select box
  renderDayPicker = () => {
    return (
      <div className="time-picker-container">
        <div className="supporting-words"> on the </div>
        <div className="form-control-wrapper">
          <select
            className="form-control"
            id="day"
            name="day"
            ref={select => { this.dayRef = select; }}
            onChange={(e) => { this.updateScheduleConfiguration(e.target.options, 'day'); }}
            multiple
          >
            {this.dayOptionsList.map((item) => {
              return this.getOption(item, 'day');
            })}
          </select>
        </div>
      </div>
    );
  }

  // Display the week picker select box
  renderWeekPicker = () => {
    return (
      <div className="time-picker-container">
        <div className="supporting-words"> on </div>
        <div className="form-control-wrapper">
          <select
            className="form-control"
            id="week"
            name="week"
            ref={select => { this.weekRef = select; }}
            onChange={(e) => { this.updateScheduleConfiguration(e.target.options, 'week'); }}
            multiple
          >
            {this.weekOptionsList.map((item) => {
              return this.getOption(item, 'week');
            })}
          </select>
        </div>
      </div>
    );
  }

  // Display the month picker select box
  renderMonthPicker = () => {
    return (
      <div className="time-picker-container">
        <div className="supporting-words"> of </div>
        <div className="form-control-wrapper">
          <select
            className="form-control"
            id="month"
            name="month"
            ref={select => { this.monthRef = select; }}
            onChange={(e) => { this.updateScheduleConfiguration(e.target.options, 'month'); }}
            multiple
          >
            {this.monthOptionsList.map((item) => {
              return this.getOption(item, 'month');
            })}
          </select>
        </div>
      </div>
    );
  }

  // This function takes care of displaying
  // appropriate date / time pickers as per the
  // schedule frequency selected.
  displayDateTimePicker = (
    selectedFrequency,
    displayMinuteFlag,
    displayHourFlag,
    displayDayFlag,
    displayWeekFlag,
    displayMonthFlag) => {
    const operationCronDictCopy = {};
    operationCronDictCopy.showMinutePicker = displayMinuteFlag;
    operationCronDictCopy.showHourPicker = displayHourFlag;
    operationCronDictCopy.showDayPicker = displayDayFlag;
    operationCronDictCopy.showWeekPicker = displayWeekFlag;
    operationCronDictCopy.showMonthPicker = displayMonthFlag;
    operationCronDictCopy.selectedFrequency = selectedFrequency;

    this.setState({
      operationCronDict: operationCronDictCopy
    });
  }

  // This function generates the cron expression using the CronBuilder
  // class and its methods (cron builder npm pacakge).
  prepareCronExpression = () => {
    const cronExp = new CronBuilder();
    this.state.minuteSelectedList.length && cronExp.set('minute', this.state.minuteSelectedList);
    this.state.hourSelectedList.length && cronExp.set('hour', this.state.hourSelectedList);
    this.state.daySelectedList.length && cronExp.set('dayOfTheMonth', this.state.daySelectedList);
    this.state.weekSelectedList.length && cronExp.set('dayOfTheWeek', this.state.weekSelectedList);
    this.state.monthSelectedList.length && cronExp.set('month', this.state.monthSelectedList);
    const cronInfoObj = {};
    cronInfoObj.cronString = cronExp.build();
    cronInfoObj.scheduleFrequency = this.state.selectedFrequency;
    this.props.getCronInfo(cronInfoObj, this.props.jobName, 'cronTab');
  }

  // This function updates the selected values list in the state
  updateSelectedValues = (selectedValuesList, unitOfTime) => {

    switch (unitOfTime) {

      case 'minute':
        this.setState({ minuteSelectedList: selectedValuesList },
          () => { this.prepareCronExpression(); });
        break;

      case 'hour':
        this.setState({ hourSelectedList: selectedValuesList },
          () => { this.prepareCronExpression(); });
        break;

      case 'day':
        this.setState({ daySelectedList: selectedValuesList },
          () => { this.prepareCronExpression(); });
        break;

      case 'week':
        this.setState({ weekSelectedList: selectedValuesList },
          () => { this.prepareCronExpression(); });
        break;

      case 'month':
        this.setState({ monthSelectedList: selectedValuesList },
          () => { this.prepareCronExpression(); });
        break;

      default:
        return null;
    }
  }

  // This function is called when any changes are done on
  // any of the select boxes of date time picker UI. This function
  // takes two arguments:
  // options    : List containing DOM objects of all options
  // unitOfTime : The date / time picker select box which is updated in UI
  updateScheduleConfiguration = (options, unitOfTime) => {
    let selectedValuesList = [];

    // get the latest selected values from all the options in select.
    selectedValuesList = [...options].filter(o => o.selected).map(o => o.value);

    // update the selectedvalues list in the state
    this.updateSelectedValues(selectedValuesList, unitOfTime);
  }

  // This function decides which date / time picker should be displayed
  // based on schedule frequency selected.
  updateCronSelection = (selectedFrequency) => {
    switch (selectedFrequency) {

      case 'minute':
        this.displayDateTimePicker(selectedFrequency, false, false, false, false, false);
        break;

      case 'hour':
        this.displayDateTimePicker(selectedFrequency, true, false, false, false, false);
        break;

      case 'day':
        this.displayDateTimePicker(selectedFrequency, true, true, false, false, false);
        break;

      case 'week':
        this.displayDateTimePicker(selectedFrequency, true, true, false, true, false);
        break;

      case 'month':
        this.displayDateTimePicker(selectedFrequency, true, true, true, false, false);
        break;

      case 'year':
        this.displayDateTimePicker(selectedFrequency, true, true, true, false, true);
        break;

      default:
        return null;
    }
  }

  // This is called when scheduled frequency is updated.
  // Here we reset selected values and re render the date
  // time pickers as per schedule selected.
  handleCronSelection = (selectedFrequency) => {

    this.minuteRef = undefined;
    this.hourRef = undefined;
    this.dayRef = undefined;
    this.weekRef = undefined;
    this.monthRef = undefined;
    this.yearRef = undefined;

    // reset selected values when the scheduled
    // frequency is updated.
    this.setState({
      minuteSelectedList: [],
      hourSelectedList: [],
      daySelectedList: [],
      weekSelectedList: [],
      monthSelectedList: [],
      operationCronDict: {},
      selectedFrequency: selectedFrequency
    }, () => {
      this.updateCronSelection(selectedFrequency);
    });
  }

  render() {
    return (
      <div className="cron-tab-container">
        <div className="supporting-words"> Every </div>
        <div className="form-control-wrapper">
          <select
            className="form-control cron-select"
            name="cronSelect"
            ref={select => { this.frequencyRef = select; }}
            onChange={(e) => { this.handleCronSelection(e.target.value); }}
          >
            {this.frequencyOptionsList.map((item) => {
              return this.getOption(item, 'frequency');
            })}
          </select>
        </div>

        <div>{this.state.operationCronDict.showDayPicker && this.renderDayPicker()}</div>
        <div>{this.state.operationCronDict.showMonthPicker && this.renderMonthPicker()}</div>
        <div>{this.state.operationCronDict.showWeekPicker && this.renderWeekPicker()}</div>
        <div>
          {this.state.operationCronDict.showHourPicker && this.renderHourPicker()}
        </div>
        <div>
          {(this.state.operationCronDict.selectedFrequency !== 'hour' &&
            this.state.operationCronDict.selectedFrequency !== 'minute') && ':'}
        </div>
        <div>{this.state.operationCronDict.showMinutePicker && this.renderMinutePicker()}</div>
        <div>
          {this.state.operationCronDict.selectedFrequency === 'hour' && 'past the hour'}
        </div>
      </div>
    );
  }
}

VunetCronTab.propTypes = {
  // Use this callback function to receive the cron expression
  // for the schedule configured.
  getCronString: PropTypes.func,

  // Pass this prop to get the name of the job in the above callback
  // function passed as props
  jobName: PropTypes.string,

  // Use this to configure defaults or load crontab UI for
  //particular configuration
  frequency: PropTypes.string,
  cronString: PropTypes.string
};