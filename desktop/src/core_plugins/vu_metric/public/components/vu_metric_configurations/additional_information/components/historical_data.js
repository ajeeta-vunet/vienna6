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
import ReactTooltip from 'react-tooltip';
import { VunetDataTable } from 'ui_framework/src/vunet_components/vunet_table/vunet_table';
import { VunetSwitch } from 'ui_framework/src/vunet_components/vunet_switch/vunet_switch';
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help'

class HistoricalData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showHistoricalDataTable: true,
      historicalDataHelp: false,
    }
  }

  // this function will be used to the fetch the values for historical Data
  fetchItemsForHistoricalData = () => {
    return new Promise((resolve) => resolve(this.props.model.historicalData));
  }

  // This will be used to delete the selected entries from the table
  deleteSelectedItemsForHistoricalData = (rows) => {
    let model = _.cloneDeep(this.props.model);
    rows.map((row) => {
      const indexToFind = model.historicalData.indexOf(row);
      model.historicalData.splice(indexToFind, 1)

    })
    this.props.onChange(model);
    return Promise.resolve('');
  }

  // This will be used on submit of historicl data
  onSubmitForHistoricalData = (event, historicalDataLabel, historicalData) => {
    let model = _.cloneDeep(this.props.model);
    let newHistoricalData = {};
    if (historicalData.type == 'interval') {
      newHistoricalData = {
        label: historicalData.label,
        type: historicalData.type,
        timeshiftMetric: '',
        intervalMetric: historicalData.intervalMetric,
        shiftUnit: '',
        shiftValue: ''
      }
    }
    else if (historicalData.type == 'timeshift' && historicalData.timeshiftMetric == 'Custom configuration') {
      newHistoricalData = {
        label: historicalData.label,
        type: historicalData.type,
        timeshiftMetric: historicalData.timeshiftMetric,
        intervalMetric: '',
        shiftUnit: historicalData.shiftUnit,
        shiftValue: historicalData.shiftValue
      }
    }
    else if (historicalData.type == 'timeshift' && historicalData.timeshiftMetric != 'Custom configuration') {
      newHistoricalData = {
        label: historicalData.label,
        type: historicalData.type,
        timeshiftMetric: historicalData.timeshiftMetric,
        intervalMetric: '',
        shiftUnit: '',
        shiftValue: ''
      }
    }

    if (event === 'add') {
      model.historicalData.push(newHistoricalData);
      this.props.onChange(model);
      return Promise.resolve(true);
    }

    else if (event == 'edit') {
      let historicalDataToFindIndexOf = {};

      model.historicalData.map((historicalData) => {
        if (historicalData.label == historicalDataLabel) {
          historicalDataToFindIndexOf = historicalData
        }
      })

      const indexOfData = model.historicalData.indexOf(historicalDataToFindIndexOf);

      model.historicalData.splice(indexOfData, 1, newHistoricalData)
      this.props.onChange(model);
      return Promise.resolve(true);
    }
  }

  // This function will be used to show hide historical data table
  showHideHistoricalDataTable = () => {
    this.setState(
      {
        showHistoricalDataTable: !this.state.showHistoricalDataTable
      }
    )
  }

  // This function will be used to check if the historical data label is unique or not
  validateHistoricalDataLabel = (key, value) => {
    return this.props.model.historicalData.find(historicalData => historicalData[key] === value) ? true : false;
  }

  // This function will be called when user switches the enable Historical Data Values With Percentage
  onHistDataValueWithPercentageSwitchChange = checked => {
    let model = _.cloneDeep(this.props.model);
    model.enableHistDataValueWithPercentage = checked;
    this.props.onChange(model);
  }

  // This function will be called when user switches the enable Historical Data Percentage
  onHistDataPercentageSwitchChange = checked => {
    let model = _.cloneDeep(this.props.model);
    model.enableHistDataPercentage = checked;
    this.props.onChange(model);
  }

  // THis function will be used to show the help block for historical data
  showHistoricalDataHelp = () => {
    this.setState(
      {
        historicalDataHelp: !this.state.historicalDataHelp
      }
    )
  }

  render() {

    const historicalDataMeta = {
      headers: ['Label', 'Type', 'Time Shift Metric', 'Interval Metric', 'Shift Value', 'Shift Unit'],
      rows: ['label', 'type', 'timeshiftMetric', 'intervalMetric', 'shiftValue', 'shiftUnit'],
      id: 'label',
      add: true,
      edit: true,
      title: 'Historical Data',
      selection: true,
      search: false,
      maxRows: 3,
      default: { type: 'timeshift', timeshiftMetric: 'Previous Window', intervalMetric: 'Previous Window', shiftUnit: 's' },
      table:
        [
          {
            key: 'label',
            label: 'Label *',
            type: 'text',
            name: 'label',
            validationCallback: this.validateHistoricalDataLabel,
            props: {
              required: true,
              pattern: '^.{2,25}$'
            },
            errorText: 'Historical Data Label should be unique and between 2-24 characters.'

          },
          {
            key: 'type',
            label: 'Historical Data Type',
            type: 'select',
            name: 'historicalDataType',
            options: [
              { key: 'timeshift', label: 'Time Shift', name: 'historicalDataType', value: 'timeshift' },
              { key: 'interval', label: 'Interval', name: 'historicalDataType', value: 'interval' }
            ],
            props: {
              required: true
            },
            rules: {
              name: 'historicalDataType_rule',
              options: [{
                value: 'timeshift',
                actions: [{
                  hide: ['intervalMetric']
                }]
              },
              {
                value: 'interval',
                actions: [{
                  hide: ['timeshiftMetric', 'shiftValue', 'shiftUnit']
                }]
              }
              ]
            }
          },
          {
            key: 'timeshiftMetric',
            label: 'Time Shift *',
            type: 'select',
            name: 'timeShift',
            options: [
              { key: 'pw', label: 'Previous Window', name: 'timeShift', value: 'Previous Window' },
              { key: 'stpd', label: 'Same Time Previous Day', name: 'timeShift', value: 'Same Time Previous Day' },
              { key: 'stdbpd', label: 'Same Time Day Before Previous Day', name: 'timeShift', value: 'Same Time Day Before Previous Day' },
              { key: 'stpw', label: 'Same Time Previous Week', name: 'timeShift', value: 'Same Time Previous Week' },
              { key: 'stpm', label: 'Same Time Previous Month', name: 'timeShift', value: 'Same Time Previous Month' },
              { key: 'stpy', label: 'Same Time Previous Year', name: 'timeShift', value: 'Same Time Previous Year' },
              { key: 'custom', label: 'Custom configuration', name: 'timeShift', value: 'Custom configuration' },
            ],
            props: {
              required: true
            },
            rules: {
              name: 'timeShift_rule',
              options: [{
                value: 'Previous Window',
                actions: [{
                  hide: ['shiftValue', 'shiftUnit']
                }]
              },
              {
                value: 'Same Time Previous Day',
                actions: [{
                  hide: ['shiftValue', 'shiftUnit']
                }]
              },
              {
                value: 'Same Time Day Before Previous Day',
                actions: [{
                  hide: ['shiftValue', 'shiftUnit']
                }]
              },
              {
                value: 'Same Time Previous Week',
                actions: [{
                  hide: ['shiftValue', 'shiftUnit']
                }]
              },
              {
                value: 'Same Time Previous Month',
                actions: [{
                  hide: ['shiftValue', 'shiftUnit']
                }]
              },
              {
                value: 'Same Time Previous Year',
                actions: [{
                  hide: ['shiftValue', 'shiftUnit']
                }]
              },
              {
                value: 'This Day',
                actions: [{
                  hide: ['shiftValue', 'shiftUnit']
                }]
              },
              ]
            }
          },
          {
            key: 'intervalMetric',
            label: 'Interval *',
            type: 'select',
            name: 'intervalMetric',
            options: [
              { key: 'Previous Window', label: 'Previous Window', name: 'intervalMetric', value: 'Previous Window' },
              { key: 'This Day', label: 'This Day', name: 'intervalMetric', value: 'This Day' },
              { key: 'This Week', label: 'This Week', name: 'intervalMetric', value: 'This Week' },
              { key: 'This Month', label: 'This Month', name: 'intervalMetric', value: 'This Month' },
              { key: 'This Year', label: 'This Year', name: 'intervalMetric', value: 'This Year' },
              { key: 'Previous Day', label: 'Previous Day', name: 'intervalMetric', value: 'Previous Day' },
              { key: 'Day Before Previous Day', label: 'Day Before Previous Day', name: 'intervalMetric', value: 'Day Before Previous Day' },
              { key: 'Previous Week', label: 'Previous Week', name: 'intervalMetric', value: 'Previous Week' },
              { key: 'Previous Month', label: 'Previous Month', name: 'intervalMetric', value: 'Previous Month' },
              { key: 'Previous Year', label: 'Previous Year', name: 'intervalMetric', value: 'Previous Year' },
              { key: 'Last 15 Minutes', label: 'Last 15 Minutes', name: 'intervalMetric', value: 'Last 15 Minutes' },
              { key: 'Last 30 Minutes', label: 'Last 30 Minutes', name: 'intervalMetric', value: 'Last 30 Minutes' },
              { key: 'Last 1 Hours', label: 'Last 1 Hours', name: 'intervalMetric', value: 'Last 1 Hours' },
              { key: 'Last 4 Hours', label: 'Last 4 Hours', name: 'intervalMetric', value: 'Last 4 Hours' },
              { key: 'Last 12 Hours', label: 'Last 12 Hours', name: 'intervalMetric', value: 'Last 12 Hours' },
              { key: 'Last 24 Hours', label: 'Last 24 Hours', name: 'intervalMetric', value: 'Last 24 Hours' },
              { key: 'Last 7 days', label: 'Last 7 days', name: 'intervalMetric', value: 'Last 7 days' },
              { key: 'Last 30 days', label: 'Last 30 days', name: 'intervalMetric', value: 'Last 30 days' },
              { key: 'Last 60 days', label: 'Last 60 days', name: 'intervalMetric', value: 'Last 60 days' },
              { key: 'Last 90 days', label: 'Last 90 days', name: 'intervalMetric', value: 'Last 90 days' },
              { key: 'Last 6 Months', label: 'Last 6 Months', name: 'intervalMetric', value: 'Last 6 Months' },
              { key: 'Last 1 Years', label: 'Last 1 Years', name: 'intervalMetric', value: 'Last 1 Years' },
              { key: 'Last 2 Years', label: 'Last 2 Years', name: 'intervalMetric', value: 'Last 2 Years' },
              { key: 'Last 5 Years', label: 'Last 5 Years', name: 'intervalMetric', value: 'Last 5 Years' },
              { key: 'Last 10 Years', label: 'Last 10 Years', name: 'intervalMetric', value: 'Last 10 Years' },
              { key: 'DTD', label: 'DTD', name: 'intervalMetric', value: 'DTD' },
              { key: 'WTD', label: 'WTD', name: 'intervalMetric', value: 'WTD' },
              { key: 'MTD', label: 'MTD', name: 'intervalMetric', value: 'MTD' },
              { key: 'YTD', label: 'YTD', name: 'intervalMetric', value: 'YTD' },
              { key: 'Next Window', label: 'Next Window', name: 'intervalMetric', value: 'Next Window' },
              { key: 'Next Day', label: 'Next Day', name: 'intervalMetric', value: 'Next Day' },
              { key: 'Day After Next Day', label: 'Day After Next Day', name: 'intervalMetric', value: 'Day After Next Day' },
              { key: 'Next Week', label: 'Next Week', name: 'intervalMetric', value: 'Next Week' },
              { key: 'Next Month', label: 'Next Month', name: 'intervalMetric', value: 'Next Month' },
              { key: 'Next Year', label: 'Next Year', name: 'intervalMetric', value: 'Next Year' },
              { key: 'Next 15 Minutes', label: 'Next 15 Minutes', name: 'intervalMetric', value: 'Next 15 Minutes' },
              { key: 'Next 30 Minutes', label: 'Next 30 Minutes', name: 'intervalMetric', value: 'Next 30 Minutes' },
              { key: 'Next 1 Hours', label: 'Next 1 Hours', name: 'intervalMetric', value: 'Next 1 Hours' },
              { key: 'Next 4 Hours', label: 'Next 4 Hours', name: 'intervalMetric', value: 'Next 4 Hours' },
              { key: 'Next 12 Hours', label: 'Next 12 Hours', name: 'intervalMetric', value: 'Next 12 Hours' },
              { key: 'Next 24 Hours', label: 'Next 24 Hours', name: 'intervalMetric', value: 'Next 24 Hours' },
              { key: 'Next 7 days', label: 'Next 7 days', name: 'intervalMetric', value: 'Next 7 days' },
              { key: 'Next 30 days', label: 'Next 30 days', name: 'intervalMetric', value: 'Next 30 days' },
              { key: 'Next 60 days', label: 'Next 60 days', name: 'intervalMetric', value: 'Next 60 days' },
              { key: 'Next 90 days', label: 'Next 90 days', name: 'intervalMetric', value: 'Next 90 days' },
              { key: 'Next 6 Months', label: 'Next 6 Months', name: 'intervalMetric', value: 'Next 6 Months' },
              { key: 'Next 1 Years', label: 'Next 1 Years', name: 'intervalMetric', value: 'Next 1 Years' },
              { key: 'Next 2 Years', label: 'Next 2 Years', name: 'intervalMetric', value: 'Next 2 Years' },
              { key: 'Next 5 Years', label: 'Next 5 Years', name: 'intervalMetric', value: 'Next 5 Years' },
              { key: 'Next 10 Years', label: 'Next 10 Years', name: 'intervalMetric', value: 'Next 10 Years' },
              { key: 'Same Time Previous Day', label: 'Same Time Previous Day', name: 'intervalMetric', value: 'Same Time Previous Day' },
              { key: 'Same Time Day Before Previous Day', label: 'Same Time Day Before Previous Day', name: 'intervalMetric', value: 'Same Time Day Before Previous Day' },
              { key: 'Same Time Previous Week', label: 'Same Time Previous Week', name: 'intervalMetric', value: 'Same Time Previous Week' },
              { key: 'Same Time Previous Month', label: 'Same Time Previous Month', name: 'intervalMetric', value: 'Same Time Previous Month' },
              { key: 'Same Time Previous Year', label: 'Same Time Previous Year', name: 'intervalMetric', value: 'Same Time Previous Year' },
            ],
            props: {
              required: true
            },
            rules: {
              name: 'interval_rule',
              options: [
                {
                  value: 'Previous Window',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'This Day',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'This Week',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'This Month',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'This Year',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Previous Day',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Day Before Previous Day',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Previous Week',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Previous Month',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Previous Year',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 15 Minutes',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 30 Minutes',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 1 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 4 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 12 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 24 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 7 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 30 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 60 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 90 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 6 Months',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 1 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 2 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 5 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Last 10 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'DTD',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'WTD',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'MTD',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'YTD',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next Window',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next Day',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Day After Next Day',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next Week',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next Month',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next Year',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 24 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 12 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 4 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 1 Hours',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 15 Minutes',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 30 Minutes',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 7 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 30 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 60 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 90 days',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 6 months',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 1 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 2 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 5 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Next 10 Years',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Same Time Previous Day',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Same Time Day Before Previous Day',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Same Time Previous Week',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Same Time Previous Month',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                },
                {
                  value: 'Same Time Previous Year',
                  actions: [{
                    hide: ['shiftValue', 'shiftUnit']
                  }]
                }
              ]
            }
          },
          {
            key: 'shiftValue',
            label: 'Shift Value *',
            type: 'text',
            name: 'shiftValue',
            props: {
              required: true
            }
          },
          {
            key: 'shiftUnit',
            label: 'Shift Unit *',
            type: 'select',
            name: 'shiftUnit',
            options: [
              { key: 's', label: 'Second', name: 'shiftUnit', value: 's' },
              { key: 'm', label: 'Minute', name: 'shiftUnit', value: 'm' },
              { key: 'h', label: 'Hour', name: 'shiftUnit', value: 'h' },
              { key: 'd', label: 'Day', name: 'shiftUnit', value: 'd' },
              { key: 'w', label: 'Week', name: 'shiftUnit', value: 'w' },
              { key: 'M', label: 'Month', name: 'shiftUnit', value: 'M' },
              { key: 'y', label: 'Year', name: 'shiftUnit', value: 'y' }
            ],
            props: {
              required: true
            }
          }
        ]
    };

    const historicalDataHelpMeta = {
      headerText: 'Helping Hand',
      referenceLink: '/vuDoc/user_guide/visualization.html#configuration-options',
      contentIntroduction: 'Add a number of historical data points to be displayed along with the metric value for selected time period. ' +
        'A maximum of 3 historical data points can be added.',
      contentList: [
        {
          description: 'The historical data points configured can be of two types: ',
          nestedContent: [
            {
              description: 'Time Shift',
              nestedContent: [
                {
                  title: 'Description',
                  description: 'Display metric value for a time period derived by shifting selected global time by an interval.' +
                    '\n </b><u><i> Example: </i></u></b>' +
                    '\n  If the global time selector is Jan 20th to Jan 27th, Time Shift configured as Previous Window would result ' +
                    'in historical data displayed for Jan 12th to Jan 19th.'
                },
                {
                  title: 'Trend Indicator',
                  description: 'Trend indicator arrow shows how the value for global time selected is faring against the value for Time Shifted Interval.'
                }
              ]
            },
            {
              description: 'Interval',
              nestedContent: [
                {
                  title: 'Description',
                  description: 'Display metric value for the time period configured. ' +
                    'The time period is calculated relative to the End Time in global time selector.' +
                    '\n </b><u><i> Example: </i></u></b>' +
                    '\n If the global time selector is Jan 20th to Feb 20th, Interval configured ' +
                    'as Previous Month would result in historical data displayed for Jan 1st to Jan 31st.'
                },
                {
                  title: 'Trend Indicator',
                  description: 'Trend indicator arrow shows how the value for configured Historical Interval is faring against its previous window.' +
                    '\n </b><u><i> Example: </i></u></b>' +
                    '\n If Interval is January 1st to January 31st,' +
                    ' the trend shows the comparison between Jan1st-Jan31st and Dec1st-Dec31st'
                }
              ]
            },
          ]
        }
      ]
    }

    return (
      <div className="historical-data-container">
        <div className="row historical-data-header-row">
          <div className="historical-data-expander-icon" onClick={() => this.showHideHistoricalDataTable()}>
            <i className={(this.state.showHistoricalDataTable ? 'icon-arrow-up' : 'icon-arrow-down')}></i>
          </div>
          <div className="historical-data-heading">
            Historical Data
            </div>
          <div className="historical-data-tooltip">
            <i className="historical-data-help-icon icon-help-blue"
              onClick={this.showHistoricalDataHelp}
              data-tip="Click the help icon to open the help section block" />
            <ReactTooltip />
          </div>
        </div>

        {
          this.state.historicalDataHelp &&
          (
            <VunetHelp
              metaData={historicalDataHelpMeta}
              onClose={this.showHistoricalDataHelp.bind(this)}
            />
          )
        }

        {this.state.showHistoricalDataTable &&
          (
            <div className="historical-data-table">
              <VunetDataTable
                fetchItems={this.fetchItemsForHistoricalData}
                deleteSelectedItems={this.deleteSelectedItemsForHistoricalData}
                metaItem={historicalDataMeta}
                onSubmit={this.onSubmitForHistoricalData}
              />
            </div>
          )
        }
        <div className="historical-data-settings">
          <div className="historical-data-in-percent">
            <VunetSwitch
              onChange={this.onHistDataPercentageSwitchChange.bind(this)}
              checked={this.props.model.enableHistDataPercentage}
            />
            <span className="hist-data-in-perecnt"> Display Historical Data in Percentages </span>
          </div>
          <div className="historical-data-value-and-percent">
            <VunetSwitch
              onChange={this.onHistDataValueWithPercentageSwitchChange.bind(this)}
              checked={this.props.model.enableHistDataValueWithPercentage}
            />
            <span className="hist-data-value-and-perecnt"> Display Historical Data Values and Percentages </span>
          </div>
        </div>

      </div>
    );
  }
}


HistoricalData.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  onChange: PropTypes.func, // This is the callback function for form changes to update the latest model to state
};

export default HistoricalData;