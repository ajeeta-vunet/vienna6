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
import Tooltip from '../../lib/tooltip';
import ReactTooltip from 'react-tooltip';
import BucketingTable from './components/bucketing_table';
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal'
import { vuMetricConstants } from '../../lib/vu_metric_constants';
import { goToReferenceLink } from '../../lib/vu_metric_utils';
import VuMetricHistoricalData from '../components/historical_data/vu_metric_historical_data';
import './horizontal_table_vu_metric.less';
import chrome from 'ui/chrome'
import moment from 'moment';

class HorizontalTableVuMetric extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisualizationSaved: false,
      actionConfirmationMessageModal: false,
      actionConfirmationModal: false
    }
  }

  componentDidMount() {
    // This has been done to disable the action buttons if the visualization is saved.
    // Action button will only be enabled if the visualization is saved.
    const currentRoute = window.location.href;
    if (!currentRoute.includes('/visualize/create?type=vu_metric')) {
      this.setState(
        {
          isVisualizationSaved: true
        }
      )
    }
  }

  // This will be used to set the trend color for historical data. If upward trend is green and coming values have downward
  // trend then upward trend values will be green and downward trend values will be red and if upward trend is red and coming values   
  // have downward trend then upward trend values will be red and downward trend values will be green and this is the table case so
  // the background color will be achieved using the same logic.
  getHistoricalDataTrendColor = (model, historicalDataObj, indexForMetric) => {
    let style = {};
    if (model.metrics[indexForMetric].bgColorEnabled) {
      // historicalDataObj.percentageChange != -1 has been done as the backend returns a value of -1 for percentageChange when no 
      // precentage value is there.
      if (historicalDataObj.percentageChange != -1) {
        if (historicalDataObj.icon == 'fa-caret-up') {
          if (model.metrics[indexForMetric].upTrendColor == 'green') {
            style = { backgroundColor: vuMetricConstants.COLOR_CONSTANTS.GREEN, color: vuMetricConstants.COLOR_CONSTANTS.WHITE }
          }
          else {
            style = { backgroundColor: vuMetricConstants.COLOR_CONSTANTS.RED, color: vuMetricConstants.COLOR_CONSTANTS.WHITE }
          }
        }
        else if (historicalDataObj.icon == 'fa-caret-down') {
          if (model.metrics[indexForMetric].upTrendColor == 'green') {
            style = { backgroundColor: vuMetricConstants.COLOR_CONSTANTS.RED, color: vuMetricConstants.COLOR_CONSTANTS.WHITE }
          }
          else {
            style = { backgroundColor: vuMetricConstants.COLOR_CONSTANTS.GREEN, color: vuMetricConstants.COLOR_CONSTANTS.WHITE }
          }
        }
      }
      else {
        style = { color: vuMetricConstants.COLOR_CONSTANTS.GREY }
      }
    }
    else {
      // historicalDataObj.percentageChange != -1 has been done as the backend returns a value of -1 for percentageChange when no 
      // precentage value is there.
      if (historicalDataObj.percentageChange != -1) {
        if (historicalDataObj.icon == 'fa-caret-up') {
          if (model.metrics[indexForMetric].upTrendColor == 'green') {
            style = { color: vuMetricConstants.COLOR_CONSTANTS.GREEN }
          }
          else {
            style = { color: vuMetricConstants.COLOR_CONSTANTS.RED }
          }
        }
        else if (historicalDataObj.icon == 'fa-caret-down') {
          if (model.metrics[indexForMetric].upTrendColor == 'green') {
            style = { color: vuMetricConstants.COLOR_CONSTANTS.RED }
          }
          else {
            style = { color: vuMetricConstants.COLOR_CONSTANTS.GREEN }
          }
        }
      }
      else {
        style = { color: vuMetricConstants.COLOR_CONSTANTS.GREY }
      }

    }
    return style;
  }

  // This function is used to prepare the inner most part of the JSON similar to output of BMV with aggregations. This will be used for following two cases:
  // 1. To display table headers
  // 2. To display 'N.A.' when there is no data for a metric.
  // Based on the input values recieved: 'fValue' and 'metricsetType' we prepare the JSON structure for a table header or metric without any results.
  prepareMetricSetForHeadersAndNoValue = (type, model) => {
    let metricObj = {}
    if (type === 'header') {
      metricObj = { formattedValue: "For Selected Time", success: true, rowType: 'headerRow' };
      if (model.actionButtonsData.length) {
        metricObj.actionButtonsColumnName = "Actions";
      }
      if (model.historicalData.length) {
        metricObj.historicalData = [];
        model.historicalData.map((historicalDataObj) => {
          metricObj.historicalData.push(
            { formattedValue: historicalDataObj.label, percentageChange: 'header' }
          )
        })
      }
    }
    // This case will be used when there is no data for the metric and buckets is empty array
    else if (type === 'N.A.') {
      metricObj = { formattedValue: "N.A." };
      if (model.historicalData.length) {
        metricObj.historicalData = [];
        model.historicalData.map((historicalDataObj) => {
          metricObj.historicalData.push(
            { formattedValue: 'N.A.', percentageChange: -1 }
          )
        })
      }
    }
    return metricObj;
  }

  // This function is used to prepare a JSON structure similar to the output of BMV with aggregations. This is used to
  //  prepare table headers or an empty row with 'N.A' values which can be used to display when any metric fails to get data.
  prepareHeadersAndNoValueForAggregation = (aggObjToIterate, metricObj, type, initialCOunt, aggregationsLength) => {
    const aggregationObject = {};
    const model = this.props.model;

    // If type is header set the
    // table header name else set 'N.A.'
    if (type === 'header') {

      // If custom label is configured for aggregations
      // display the custom label else display field name.
      if (model.aggregations[initialCOunt].customLabel &&
        model.aggregations[initialCOunt].customLabel !== '') {
        aggregationObject.key = model.aggregations[initialCOunt].customLabel;
      } else {
        aggregationObject.key = model.aggregations[initialCOunt].field;
      }
    } else {
      aggregationObject.key = 'N.A.';
    }
    aggObjToIterate.push(aggregationObject);
    initialCOunt = initialCOunt + 1;
    // Recursively call prepareBuckets() until
    // we reach the last inner most aggregation.
    if (initialCOunt < aggregationsLength) {
      aggregationObject.buckets = [];
      this.prepareHeadersAndNoValueForAggregation(aggregationObject.buckets, metricObj, type, initialCOunt, aggregationsLength);
    } else {

      // Add metric information in the inner
      // most aggregation bucket.
      aggregationObject.metric = metricObj;
    }
  }

  // This function is used to calculate the number of rows in a BM.
  getRowsCount = (dataset, metricCount) => {

    const utcRegex = new RegExp('\\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\\b');
    const timeFormat = this.props.config.get('dateFormat');

    // We iterate over each bucket in the dataset(list of buckets) and
    // check for sub buckets recursively. When no more sub buckets are
    // found, we increament the 'metricCount'. The metricCount tracks
    // the total number of rows in BM.
    if (dataset !== undefined) {
      dataset.forEach((item) => {
        // We test response to the check if this is a timestamp and if so
        // we would change the format to a standard time format set in Advance Settings under Manage Resources.
        if (utcRegex.test(item.key)) {
          const m = moment(item.key);
          item.key = m.local().format(timeFormat);
        }
        if (item.buckets && item.buckets.length > 0) {
          metricCount = this.getRowsCount(item.buckets, metricCount);
        } else {
          metricCount += 1;
        }
      });
      return metricCount;
    }
  };

  // This function prepares a historical data list with 'N.A'
  // values based on number of historical data configured.
  populateEmptyHistoricalDataValues = (historicalDataObj) => {
    this.props.model.historicalData.forEach(function (obj) {
      const dataObj = {};
      dataObj.label = obj.label;
      dataObj.formattedValue = 'N.A.';
      dataObj.percentageChange = -1;
      dataObj.icon = '';
      historicalDataObj.push(dataObj);
    });
  };

  // This function adds 'N.A' values for historical data for each aggregation.
  addEmptyHistoricalDataForAggregations = (dataset) => {

    // We iterate over each bucket in the dataset(list of buckets) and
    // check for sub buckets recursively. When no more sub buckets are
    // found, we add the historical data object with 'N.A.' values.
    dataset.forEach((item) => {
      if (item.buckets && item.buckets.length > 0) {
        this.addEmptyHistoricalDataForAggregations(item.buckets);
      } else {
        item.metric.historicalData = [];
        this.populateEmptyHistoricalDataValues(item.metric.historicalData);
      }
    });
  };

  // This function will be called in the case of table without buckets and will make the arguments to be sent to api call accordingly.
  confirmationToStartActionForTableWithoutBuckets = () => {
    this.setState({
      actionConfirmationModal: true
    })
  }

  // This function will be used to close the modal of confirmation to start the action
  actionConfirmationModalClose = () => {
    this.setState({
      actionConfirmationModal: false
    })
  }

  actionConfirmationMessageModalClose = () => {
    this.setState({
      actionConfirmationMessageModal: false
    })
  }

  actionConfirmationMessageModalSubmit = () => {
    this.setState({
      actionConfirmationMessageModal: false
    })
  }

  // THis function will be used to start the action and then to show the user a popup the action has been started
  actionConfirmationModalSubmit = (actionName, metricKey, metricData) => {
    let argrumentsToSend = {};
    let agrsToSendWithoutBuckets = {};
    agrsToSendWithoutBuckets.metricname = metricKey;
    agrsToSendWithoutBuckets.metricValue = metricData.formattedValue;
    agrsToSendWithoutBuckets.historcalData = metricData.historicalData;

    const urlBase = chrome.getUrlBase();

    argrumentsToSend.bmv = this.props.title;
    // This will return us an array of [username,userrole,userpermissions]
    const userInfo = chrome.getCurrentUser();
    argrumentsToSend.userName = userInfo[0];
    // Will only be used in tanle and bucketing cases 
    argrumentsToSend.args = agrsToSendWithoutBuckets;

    fetch(urlBase + '/rba/' + actionName + '/', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: JSON.stringify(argrumentsToSend)
    })
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            actionConfirmationMessageModal: true
          })
        }
      });

  }

  render() {
    const model = this.props.model;
    // do we really need a cloneDeep here
    const visData = _.cloneDeep(this.props.visData);

    const utcRegex = new RegExp('\\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\\b');

    const timeFormat = this.props.config.get('dateFormat');

    const actionConfirmationModalData = vuMetricConstants.ACTION_CONFIRMATION_MODAL_DATA;

    const actionConfirmationMessageModalData = vuMetricConstants.ACTION_CONFIRMATION_MESSAGE_MODAL_DATA;

    // metricRowCount will be used to count the number of rows
    let metricRowCount = 0;

    // Check if aggregations, historical data and action buttons are configured and get the length for the same.
    let aggregationsLength = 0;
    let historicalDataLength = 0;
    let actionButtonsLength = 0;

    if (model.aggregations.length) {
      aggregationsLength = model.aggregations.length;
    }

    if (model.historicalData.length) {
      historicalDataLength = model.historicalData.length;
    }
    if (model.actionButtonsData.length) {
      // If action button are configured the length will be 1 as we are calculating the length of columns(Action Buttons will come in 1 column)
      actionButtonsLength = 1;
    }

    // calculate the no of columns to set the width of each column  we are adding 2 at the end to
    // include the column headers 'Metric' and 'For selected time'.
    const noOfColumns = model.tabularFormat === 'vertical' ?
      aggregationsLength + (displayedMetrics * (historicalDataLength + 1)) :
      aggregationsLength + historicalDataLength + actionButtonsLength + 2;

    const columnWidth = (100 / (noOfColumns)) + '%';

    // Prepare historical datasets with 'N.A.' as values when the metrics
    // do not have any data in the selected time range.
    visData.forEach(function (metricData, index) {
      for (const key in metricData) {
        if (metricData.hasOwnProperty(key)) {
          // We test response to the check if this is a timestamp and if so
          // we would change the format to a standard time format set in Advance Settings under Manage Resources.
          if (utcRegex.test(metricData[key].formattedValue)) {
            const m = moment(metricData[key].formattedValue);
            metricData[key].formattedValue = m.local().format(timeFormat);
          }

          // Case when there are aggregations configured.
          if (model.aggregations && model.aggregations.length > 0) {

            // This is creating problems
            metricRowCount = this.getRowsCount(metricData[key].buckets, metricRowCount);

            if (!metricData[key].hasOwnProperty('buckets')) {
              metricData[key].buckets = [];
            }

            // If there are no buckets for this metric in
            // the response recieved or if there is no data for
            // this metric, create a row with 'N.A.'
            // values.
            if ((metricData[key].buckets && metricData[key].buckets.length === 0) || metricData[key].success === false) {
              let metricObj = this.prepareMetricSetForHeadersAndNoValue('N.A.', model);
              this.prepareHeadersAndNoValueForAggregation(metricData[key].buckets, metricObj, 'N.A.', 0, model.aggregations.length);

              // If latest value metric is selected , Fill historical data
              // with 'N.A.'. This is done as we do not support historical
              // data for 'latest value'.
            } else if (model.metrics[index].type === 'latest') {
              this.addEmptyHistoricalDataForAggregations(metricData[key].buckets);
            }
            // Case when there are no aggregations configured.
          }
          else {
            // If the bucketing is not present the metricRowCount will be equal to the number of metrics configured
            metricRowCount = this.props.model.metrics.length;

            // Prepare historical datasets with 'N.A.' as values when
            // the metrics do not have any data in the selected time range or
            // when 'latest value' metric is selected.
            if (metricData[key].success === false || model.metrics[index].type === 'latest') {
              metricData[key].historicalData = [];
              this.populateEmptyHistoricalDataValues(metricData[key].historicalData);
            }
          }
        }
      }
    }, this);

    //Here we are populating the header rows to be displayed with respect to the configuration of the table
    let tableHeaders = {};
    tableHeaders.Metric = {};
    tableHeaders.Metric.buckets = []
    if (visData.length && model.aggregations.length === 0) {
      let metricObj = this.prepareMetricSetForHeadersAndNoValue('header', model);
      tableHeaders.Metric = metricObj;
    }
    else if (visData.length && model.aggregations.length > 0) {
      let metricObj = this.prepareMetricSetForHeadersAndNoValue('header', model);
      this.prepareHeadersAndNoValueForAggregation(tableHeaders.Metric.buckets,
        metricObj,
        'header',
        0,
        aggregationsLength);
    }

    // This is the reason we need to clone the visData here
    visData.splice(0, 0, tableHeaders);

    // This model will be used for hide metric functionality because the visdata is having 1 more entry than
    // the number or metrics which is beacuse of the header row. Hence we create a model with 3 entries wherein the 
    // 1st entry defines the header row whose hideMetric is always false.
    let modelForHidingMetric = _.cloneDeep(model.metrics);
    modelForHidingMetric.unshift({
      hideMetric: false
    })


    return (
      <table className="vu-metric-horizontal-table">
        {
          visData.map((metric, index) => {
            for (const [metricKey, metricData] of Object.entries(metric)) {
              let indexForMetric = index-1;
              // This has been done because the header row with have index as 0 and index-1 will make indexForMetric -1
              // which will throw us an error hence we make indexForMetric as 0 even when index is -1, but this give rise to
              // a new problem that if we hide first metric the header row is always mapped to 0 indexForMetric hence hiding the 
              // metric at 0 index i.e the 1st configured metric will hide the header row
              if (indexForMetric === -1) {
                indexForMetric = 0;
              }
              return (
                <tr
                  className="vu-metric-data-rows"
                  key={index}>
                  {/* (!model.metrics[indexForMetric].hideMetric)  */}
                  {(!modelForHidingMetric[index].hideMetric) ?
                    (
                      <td className="vu-metric-table-metric-name-td" >
                        <table className="vu-metric-horizontal-sub-table vu-metric-horizontal-table-page-break">
                          <tr>
                            <td
                              width={columnWidth}
                              className="vu-metric-horizontal-table-td-metric-names">
                              <div className="vu-metric-label-description-and-link-container">
                                <span className="metric-name">{metricKey}</span>
                                {
                                  (model.metrics[indexForMetric].description && metricData.rowType !== 'headerRow') ?
                                    (
                                      <span className="metric-description-icon-container">
                                        <Tooltip
                                          placement='right'
                                          text={model.metrics[indexForMetric].description}>
                                          <i className="fa fa-question-circle metric-description-icon" ></i>
                                        </Tooltip>
                                      </span>
                                    )
                                    :
                                    null
                                }
                                {
                                  (model.metrics[indexForMetric].referenceLink.enabled && metricData.rowType !== 'headerRow') ?
                                    (
                                      <span
                                        className="metric-refernce-link-icon-container"
                                        onClick={() => goToReferenceLink(
                                          this.props.Private,
                                          this.props.getAppState,
                                          this.props.timefilter,
                                          model.metrics[indexForMetric].referenceLink,
                                          model.metrics[indexForMetric].filter
                                        )
                                        }>
                                        <i
                                          className="fa fa-arrow-circle-o-right metric-refernce-link-icon"
                                          aria-hidden="true">
                                        </i>
                                      </span>
                                    )
                                    :
                                    null
                                }
                              </div>
                              {metricData.rowType !== 'headerRow' &&
                                (
                                  <div className="vu-metric-goal-info-container">
                                    {model.metrics[indexForMetric].goalLabel}
                                  </div>
                                )
                              }
                            </td>
                          </tr>
                        </table>
                      </td>
                    )
                    :
                    null
                  }
                  {/* This will be used to display bucketing */}
                  {
                    (model.aggregations.length > 0 && !modelForHidingMetric[index].hideMetric) ?
                      (
                        <td
                          className="bucketing-td">

                          <BucketingTable
                            model={model}
                            indexForMetric={indexForMetric}
                            metricData={metricData}
                            metric={model.metrics[indexForMetric]}
                            columnWidth={columnWidth}
                            getHistoricalDataTrendColor={this.getHistoricalDataTrendColor.bind(this)}
                            title={this.props.title}
                          />
                        </td>
                      )
                      :
                      null
                  }

                  {/* This td will be used to display the metric formatted value when there is no buckets */}

                  {
                    (model.aggregations.length === 0 && !modelForHidingMetric[index].hideMetric) ?
                      (
                        <td
                          className="vu-metric-table-metric-value-td"
                          width={columnWidth}
                          style={model.metrics[indexForMetric].bgColorEnabled && metricData.formattedValue !== 'For Selected Time' ? { backgroundColor: metricData.color, color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : { color: metricData.color }}
                        >
                          {metricData.success ?
                            (
                              <span >{metricData.formattedValue}</span>
                            )
                            :
                            (
                              <span >N.A</span>
                            )
                          }
                        </td>
                      )
                      :
                      null
                  }

                  {/* This will be used to show historical Data */}
                  {
                    (model.aggregations.length === 0 && model.historicalData.length && metricData.historicalData != undefined && !modelForHidingMetric[index].hideMetric) ?
                      (
                        metricData.historicalData.map((historicalDataObj) => {
                          return (
                            <td
                              className='vu-metric-table-historical-data-td'
                              style={this.getHistoricalDataTrendColor(model, historicalDataObj, indexForMetric)}
                              width={columnWidth}
                            >
                              <VuMetricHistoricalData
                                model={model}
                                historicalDataObj={historicalDataObj}
                                indexForMetric={indexForMetric}
                              />
                            </td>
                          )
                        })
                      )
                      :
                      null
                  }

                  {/* This will be used to display action buttons when in horizonatl table format and no buckets */}
                  {
                    (model.aggregations.length <= 0 && model.actionButtonsData.length > 0 && !modelForHidingMetric[index].hideMetric) ?
                      (
                        <td
                          width={columnWidth}
                          className="action-buttons-td hide-action-buttons-in-report"
                        // style={model.actionButtonsData.length > 2 ? { width: 40 + 'rem' } : { width: 27 + 'rem' }}
                        >
                          {metricData.actionButtonsColumnName}
                          {
                            (!metricData.actionButtonsColumnName) ?
                              (
                                model.actionButtonsData.map((actionButton) => {
                                  {
                                    return (
                                      <div className="">
                                        <button
                                          className="single-action-button"
                                          disabled={!this.state.isVisualizationSaved}
                                          style={{ backgroundColor: actionButton.actionColor, fontSize: model.textFontSize, border: '1px solid ' + actionButton.actionColor }}
                                          onClick={() => this.confirmationToStartActionForTableWithoutBuckets()}
                                          data-tip={actionButton.actionName}
                                        >
                                          {actionButton.actionName}
                                          <ReactTooltip />
                                        </button>
                                        <VunetModal
                                          showModal={this.state.actionConfirmationModal}
                                          onClose={this.actionConfirmationModalClose.bind(this)}
                                          data={actionConfirmationModalData}
                                          onSubmit={this.actionConfirmationModalSubmit.bind(this, actionButton.actionName, metricKey, metricData)}
                                        />
                                        <VunetModal
                                          showModal={this.state.actionConfirmationMessageModal}
                                          onClose={this.actionConfirmationMessageModalClose.bind(this)}
                                          data={actionConfirmationMessageModalData}
                                          onSubmit={this.actionConfirmationMessageModalSubmit.bind()}
                                        />
                                      </div>
                                    )
                                  }

                                })
                              )
                              :
                              null

                          }

                        </td>
                      )
                      : null
                  }

                </tr>
              )
            }
          })
        }
      </table>
    )
  }
}

HorizontalTableVuMetric.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  visData: PropTypes.array, // This is array retured by the api
  title: PropTypes.string, // This represent the name of the visualization
  Private: PropTypes.func, // This will be used for going to reference link to prepare link information
  getAppState: PropTypes.func, // This will be used for going to reference link to prepare link information
  timefilter: PropTypes.object, // This will be used for going to reference link to prepare link information
  config: PropTypes.object, // This will be used to all the configurations from Manage Resources -> Advanced Settings
};

export default HorizontalTableVuMetric;