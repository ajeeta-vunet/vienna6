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
import { VunetHelp } from 'ui_framework/src/vunet_components/vunet_help/vunet_help';
import { vuMetricConstants } from '../../../lib/vu_metric_constants'

class ConfigureThresholds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configureThresholdsHelp: false,
      resetThresholdsIfFieldTypeChange: false,
      removeConfiguredThresholds: false,

    }
    this.storedMinValue;
  }

  // This is being done as we need to delete all the configured threshold if the field type changes
  componentWillReceiveProps(nextProps) {
    this.setState({
      removeConfiguredThresholds: false
    })
    // '' fieltype will happen when type is count so we can assume this '' fieltype equal to number
    if ((this.props.metric.fieldType === '' && nextProps.metric.fieldType === 'string') ||
      (this.props.metric.fieldType === 'string' && nextProps.metric.fieldType === '') ||
      (this.props.metric.fieldType === 'string' && nextProps.metric.fieldType === 'number') ||
      (this.props.metric.fieldType === 'number' && nextProps.metric.fieldType === 'string')) {
      this.setState({
        removeConfiguredThresholds: true
      })
      // let rows = _.cloneDeep(this.props.model.metrics[this.props.index].threshold)
      // this.deleteSelectedItemsForThresholds(rows);
      // this.fetchItemsForThresholds();
      // this.forceUpdate();
    }
  }

  //This function will be called when user switches the  toggle enable auto baselining
  enableAutoBaselineSwitchChange = checked => {
    const model = _.cloneDeep(this.props.model);
    const metric = _.cloneDeep(this.props.metric);
    metric.enableAutoBaseLining = checked;
    model.metrics.splice(this.props.index, 1, metric);
    this.props.onChange(model);
  }

  //This function will be called when user switches the enable background color toggle
  enableBackgroundColorSwitchChange = checked => {
    const model = _.cloneDeep(this.props.model);
    const metric = _.cloneDeep(this.props.metric);
    metric.bgColorEnabled = checked;
    model.metrics.splice(this.props.index, 1, metric);
    this.props.onChange(model);
  }

  // this function will be used to the fetch the values for thresholds
  fetchItemsForThresholds = () => {
    return new Promise((resolve) => resolve(this.props.model.metrics[this.props.index].threshold));
  }

  // This will be used to delete the selected entries from the table
  deleteSelectedItemsForThresholds = (rows) => {
    const model = _.cloneDeep(this.props.model);
    const metric = _.cloneDeep(this.props.metric);
    rows.map((row) => {
      const indexToFind = metric.threshold.indexOf(row);
      model.metrics[this.props.index].threshold.splice(indexToFind, 1)
      this.props.onChange(model);
    })
    return Promise.resolve('');
  }

  // This will be used on submit of thresholds table
  onSubmitForThresholds = (event, thresholdId, thresholdData) => {
    const model = _.cloneDeep(this.props.model);
    const metric = _.cloneDeep(this.props.metric);

    let newThreshold = {}
    if (thresholdData.comparison != 'Range') {
      newThreshold = {
        label: thresholdData.label,
        comparison: thresholdData.comparison,
        value: thresholdData.value,
        interval: thresholdData.interval,
        intervalUnit: thresholdData.intervalUnit,
        color: thresholdData.color,
        severity: thresholdData.severity,
        insights: thresholdData.insights
      }
    }
    else if (thresholdData.comparison == 'Range') {
      newThreshold = {
        label: thresholdData.label,
        comparison: thresholdData.comparison,
        valueMin: thresholdData.valueMin,
        valueMax: thresholdData.valueMax,
        interval: thresholdData.interval,
        intervalUnit: thresholdData.intervalUnit,
        color: thresholdData.color,
        severity: thresholdData.severity,
        insights: thresholdData.insights
      }
    }

    if (event === 'add') {
      metric.threshold.push(newThreshold);
      model.metrics.splice(this.props.index, 1, metric);
      this.props.onChange(model);
      return Promise.resolve(true);
    }
    else if (event == 'edit') {
      let thresholdDataToFindIndexOf = {};
      metric.threshold.map((thresholdData) => {
        if (thresholdData.label == thresholdId) {
          thresholdDataToFindIndexOf = thresholdData;
        }
      })
      const indexOfData = metric.threshold.indexOf(thresholdDataToFindIndexOf)

      metric.threshold.splice(indexOfData, 1, newThreshold);
      model.metrics.splice(this.props.index, 1, metric);
      this.props.onChange(model);
      return Promise.resolve(true);
    }
  }

  // This function will be used to check if the threshold label is unique or not
  validateThresholdLabel = (key, value) => {
    return this.props.metric.threshold.find(actionButton => actionButton[key] === value) ? true : false;
  }

  //Function to store min value so that it can be compared
  storeMinValueToCheck = (key, data) => {
    // The validation callback always return us a string but here we need a number comparison hence we convert the same to a number
    this.storedMinValue = Number(data);
  };

  validateMinMaxValue = (key, data) => {
    // The validation callback always return us a string but here we need a number comparison hence we convert the same to a number
    if (this.storedMinValue < Number(data)) {
      return false;
    }
    else {
      return true;
    }
  }

  // THis function will be used to show the help block for configure thresholds
  showConfigureThresholdsHelp = () => {
    this.setState(
      {
        configureThresholdsHelp: !this.state.configureThresholdsHelp
      }
    )
  }

  render() {

    let thresholdsMeta = {
      headers: ['Label', 'Comparison', 'Value', 'Min Value', 'Max Value', 'Color', 'Alert', 'Insights'],
      rows: ['label', 'comparison', 'value', 'valueMin', 'valueMax', 'color', 'severity', 'insights'],
      id: 'label',
      add: true,
      edit: true,
      title: 'Thresholds',
      selection: true,
      search: false,
      forceUpdate: false,
      default: { comparison: '==', intervalUnit: '', color: vuMetricConstants.COLOR_CONSTANTS.GREEN, severity: 'None' },
      table:
        [
          {
            key: 'label',
            label: 'Label *',
            type: 'text',
            name: 'label',
            validationCallback: this.validateThresholdLabel,
            props: {
              required: true,
              pattern: '^.{2,25}$'
            },
            errorText: 'Threshold Label should be unique and between 2-24 characters.'
          },
          {
            key: 'comparison',
            label: 'Comparison *',
            type: 'select',
            name: 'comparison',
            options: [
              { key: 'equalTo', label: 'Equal to', name: 'comparison', value: '==' },
              { key: 'notEqualTo', label: 'Not equal to', name: 'comparison', value: '!=' },
              { key: 'lessThan', label: 'Less Than', name: 'comparison', value: '<' },
              { key: 'lessThanEqualTo', label: 'Less Than Equal To', name: 'comparison', value: '<=' },
              { key: 'greaterThan', label: 'Greater Than', name: 'comparison', value: '>' },
              { key: 'greaterThanEqualTo', label: 'Greater Than Equal To', name: 'comparison', value: '>=' },
              { key: 'range', label: 'Range', name: 'comparison', value: 'Range' },
            ],
            props: {
              required: true,
            },
            rules: {
              name: 'comparison_rule',
              options: [{
                value: '==',
                actions: [{
                  hide: ['valueMin', 'valueMax']
                }]
              },
              {
                value: '!=',
                actions: [{
                  hide: ['valueMin', 'valueMax']
                }]
              },
              {
                value: '<',
                actions: [{
                  hide: ['valueMin', 'valueMax']
                }]
              },
              {
                value: '<=',
                actions: [{
                  hide: ['valueMin', 'valueMax']
                }]
              },
              {
                value: '>',
                actions: [{
                  hide: ['valueMin', 'valueMax']
                }]
              },
              {
                value: '>=',
                actions: [{
                  hide: ['valueMin', 'valueMax']
                }]
              },
              {
                value: 'Range',
                actions: [{
                  hide: ['value']
                }]
              }
              ]
            }
          },
          {
            key: 'value',
            label: 'Comparison Value *',
            type: 'number',
            name: 'value',
            props: {
              required: true
            }
          },
          {
            key: 'valueMin',
            label: 'Min Value *',
            type: 'number',
            name: 'minValue',
            validationCallback: this.storeMinValueToCheck,
            props: {
              required: true
            }
          },
          {
            key: 'valueMax',
            label: 'Max Value *',
            type: 'number',
            name: 'maxValue',
            validationCallback: this.validateMinMaxValue,
            props: {
              required: true
            },
            errorText: `Maximun value must be greater than minimun value .`
          },
          {
            key: 'interval',
            label: 'Interval Value',
            type: 'number',
            name: 'intervalValue',
            helpText: 'Interval to be used for time scaling of threshold.'
          },
          {
            key: 'intervalUnit',
            label: 'Interval Unit',
            type: 'select',
            name: 'intervalUnit',
            helpText: 'Unit of interval specified for time scaling of threshold.',
            options: [
              { key: '', label: '', name: 'intervalUnit', value: '' },
              { key: 'second', label: 'Second', name: 'intervalUnit', value: 's' },
              { key: 'minute', label: 'Minute', name: 'intervalUnit', value: 'm' },
              { key: 'hour', label: 'Hour', name: 'intervalUnit', value: 'h' },
              { key: 'day', label: 'Day', name: 'intervalUnit', value: 'd' },
              { key: 'week', label: 'Week', name: 'intervalUnit', value: 'w' },
              { key: 'month', label: 'Month', name: 'intervalUnit', value: 'm' },
              { key: 'year', label: 'Year', name: 'intervalUnit', value: 'y' },
              { key: 'custom', label: 'Custom', name: 'intervalUnit', value: 'custom' }
            ],
          },
          {
            key: 'color',
            label: 'Color',
            type: 'select',
            name: 'color',
            props: {
              required: true
            },
            options: [
              { key: 'green', label: 'Green', name: 'color', value: vuMetricConstants.COLOR_CONSTANTS.GREEN },
              { key: 'red', label: 'Red', name: 'color', value: vuMetricConstants.COLOR_CONSTANTS.RED },
              { key: 'orange', label: 'Orange', name: 'color', value: vuMetricConstants.COLOR_CONSTANTS.ORANGE },
              { key: 'yellow', label: 'Yellow', name: 'color', value: vuMetricConstants.COLOR_CONSTANTS.YELLOW }
            ],
          },
          {
            key: 'insights',
            label: 'Insights',
            type: 'text',
            name: 'insights',
            helpText: 'Insights text that will be displayed when the metric value matches this condition.'
          },
          {
            key: 'severity',
            label: 'Alert',
            type: 'select',
            name: 'alert',
            props: {
              required: true
            },
            options: [
              { key: 'None', label: 'None', name: 'alert', value: 'None' },
              { key: 'information', label: 'Information', name: 'alert', value: 'information' },
              { key: 'warning', label: 'Warning', name: 'alert', value: 'warning' },
              { key: 'error', label: 'Error', name: 'alert', value: 'error' },
              { key: 'critical', label: 'Critical', name: 'alert', value: 'critical' }
            ],
          }
        ]
    };

    if (this.state.removeConfiguredThresholds) {
      let model = _.cloneDeep(this.props.model);
      model.metrics[this.props.index].threshold = [];
      this.props.onChange(model);
      thresholdsMeta.forceUpdate = true;
    }

    // Why are we doing this beacasue if the field type of the metric is string we dont dont provide an option of
    // range for comparison and the input type also becomes text when field type is string not a number
    if (this.props.metric.fieldType == 'string' && this.props.metric.type != 'cardinality') {
      thresholdsMeta.table[1].options.splice(6, 1);
      thresholdsMeta.table[2].type = "text";
    }

    const configureThresholdsHelpMeta = {
      headerText: 'Helping Hand',
      referenceLink: '/vuDoc/user_guide/visualization.html#configuration-options',
      contentIntroduction: ' Configure thresholds for the metric. Based on the thresholds, the following controls are available:' +
        '\n <b> ☞ Control the color of metric displayed</b>' +
        '\n <b> ☞ Control the insights text displayed</b>' +
        '\n <b> ☞ Control generation of alerts</b>' +
        '\n While configuring thresholds entries, time scaling can be optionally enabled. For example, for a count metric, if the ' +
        'threshold configured is 600 for 60 minutes, then a threshold of 10 will be applied if time selected for display is 1 minute.' +
        '\n <b> ☞ The thresholds configured are checked in sequence. The first matching threshold is used by the system.</b>',
      contentList: [
        {
          title: 'Auto baseline',
          description: 'When auto baselining is enabled for a metric, the system will identify normal and abnormal values of the metric automatically.' +
            'This relieves the user from having to configure static thresholds. The baseline values are derived dynamically by applying statistical ' +
            'and machine learning models on the past data.'
        }
      ]
    }

    return (
      <div className="configure-thresholds">
        <div className="configure-thresholds-heading-row row">
          <div className="configure-thresholds-heading">
            <div className="configure-thresholds-number">
              03.
            </div>
            <div className="configure-thresholds-title-container">
              <span className="configure-thresholds-header-title"> Configure Thresholds </span>
              <i className="configure-thresholds-help-icon icon-help-blue"
                onClick={this.showConfigureThresholdsHelp}
                data-tip="Click the help icon to open the help section block" />
              <ReactTooltip />
            </div>
          </div>
          <div className="enable-background-color">
            <div className="enable-background-color-switch">
              <VunetSwitch
                onChange={this.enableBackgroundColorSwitchChange.bind(this)}
                checked={this.props.metric.bgColorEnabled} />
            </div>
            <span className="enable-background-color-text"> Enable Background Theme </span>
          </div>

          <div className="auto-baselining">
            <div className="auto-baselining-switch">
              <VunetSwitch
                onChange={this.enableAutoBaselineSwitchChange.bind(this)}
                checked={this.props.metric.enableAutoBaseLining} />
            </div>
            <span className="auto-baselining-text"> Auto Baselining </span>
          </div>
        </div>

        {
          this.state.configureThresholdsHelp &&
          (
            <VunetHelp
              metaData={configureThresholdsHelpMeta}
              onClose={this.showConfigureThresholdsHelp.bind(this)}
            />
          )
        }

        <div className="configure-thresholds-table">
          <VunetDataTable
            fetchItems={this.fetchItemsForThresholds}
            deleteSelectedItems={this.deleteSelectedItemsForThresholds}
            metaItem={thresholdsMeta}
            onSubmit={this.onSubmitForThresholds}
          />
        </div>
      </div>
    );
  }

}

ConfigureThresholds.propTypes = {
  metric: PropTypes.object,
  onChange: PropTypes.func,
  index: PropTypes.number,
  model: PropTypes.object
};

export default ConfigureThresholds;