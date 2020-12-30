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
import VuMetricHistoricalDataPercentage from '../../components/historical_data_percentage/vu_metric_historical_data_percentage'
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal';
import { vuMetricConstants } from '../../../lib/vu_metric_constants';
import chrome from 'ui/chrome';

class BucketingTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisualizationSaved: false
    };
  }

  componentDidMount() {
    // This has been done to disable the action buttons if the visualization is saved.
    // Action button will only be enabled if the visualization is saved.
    const currentRoute = window.location.href;
    if (!currentRoute.includes('/visualize/create?type=business_metric')) {
      this.setState(
        {
          isVisualizationSaved: true
        }
      );
    }
  }

  confirmationToStartActionForTableWithBuckets = () => {
    this.setState({
      actionConfirmationModal: true
    });
  }

  // This function will be used to close the modal of confirmation to start the action
  actionConfirmationModalClose = () => {
    this.setState({
      actionConfirmationModal: false
    });
  }

  actionConfirmationMessageModalClose = () => {
    this.setState({
      actionConfirmationMessageModal: false
    });
  }

  actionConfirmationMessageModalSubmit = () => {
    this.setState({
      actionConfirmationMessageModal: false
    });
  }

  // THis function will be used to start the action and then to show the user a popup the action has been started
  actionConfirmationModalSubmit = (actionName, bucket, metricData, metric) => {
    const argrumentsToSend = {};
    let subBucketValueToSend = bucket.key;
    let bucketValueToSend = metricData.key;

    if (bucketValueToSend === undefined) {
      subBucketValueToSend = null;
      bucketValueToSend = bucket.key;
    }
    const bucketArgsToSend = {};
    bucketArgsToSend.bucket = bucketValueToSend;
    bucketArgsToSend.subBucket = subBucketValueToSend;
    bucketArgsToSend.metricname = metric.label;
    bucketArgsToSend.metricValue = bucket.metric.formattedValue;
    bucketArgsToSend.historcalData = bucket.metric.historicalData;

    const urlBase = chrome.getUrlBase();

    argrumentsToSend.bmv = this.props.title;
    // This will return us an array of [username,userrole,userpermissions]
    const userInfo = chrome.getCurrentUser();
    argrumentsToSend.userName = userInfo[0];
    // Will only be used in tanle and bucketing cases
    argrumentsToSend.args = bucketArgsToSend;

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
          });
        }
      });

  }

  render() {

    const model = this.props.model;
    const metricData = this.props.metricData;
    const metric = this.props.metric;
    const indexForMetric = this.props.indexForMetric;
    const columnWidth = this.props.columnWidth;
    const getHistoricalDataTrendColor = this.props.getHistoricalDataTrendColor;

    const actionConfirmationModalData = vuMetricConstants.ACTION_CONFIRMATION_MODAL_DATA;

    const actionConfirmationMessageModalData = vuMetricConstants.ACTION_CONFIRMATION_MESSAGE_MODAL_DATA;

    return (
      metricData.buckets ?
        (
          <table className="bucketing-table">
            {
              metricData.buckets.map((bucket, index) => {
                return (

                  // We have given key to tr as bucket.key assuming that there will be no duplicate bucket keys.
                  <tr
                    className="single-bucketing-row"
                    key={index}
                  >

                    {/* This td is for the bucketing key */}
                    <td
                      className="vu-metric-bucket-key"
                      width={columnWidth}
                    >
                      {bucket.key}
                    </td>

                    {/* this td will have the bucketing table again as this is a recursive call */}
                    {
                      bucket.buckets &&
                      (
                        <td className="vu-metric-recursive-bucket-table-tb">
                          <BucketingTable
                            model={model}
                            indexForMetric={indexForMetric}
                            metricData={bucket}
                            metric={model.metrics[indexForMetric]}
                            columnWidth={columnWidth}
                            getHistoricalDataTrendColor={getHistoricalDataTrendColor.bind(this)}
                            title={this.props.title}
                          />
                        </td>
                      )
                    }

                    {/* THis will be used to show the formatted value of the bucket */}
                    {
                      bucket.metric &&
                      (
                        <td
                          width={columnWidth}
                          className="vu-metric-bucket-formatted-value-td"
                          // metricData.buckets[0].metric.rowType !== 'headerRow' check has been added to prevent the
                          // header row from getting the white text color on enable background
                          style={(metric.bgColorEnabled && metricData.buckets[0].metric.rowType !== 'headerRow' && bucket.metric.formattedValue !== 'N.A.')
                            ? { backgroundColor: bucket.metric.color, color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : { color: bucket.metric.color }}
                        >
                          {bucket.metric.formattedValue}
                        </td>
                      )
                    }

                    {/* THis will be used to show historical data in the case of bucketing */}
                    {
                      (!bucket.buckets && bucket.metric.historicalData && bucket.metric.historicalData != undefined) ?
                        (
                          bucket.metric.historicalData.map((historicalDataObj, indexOfHisoricalData) => {
                            return (
                              <td
                                width={columnWidth}
                                key={indexOfHisoricalData}
                                className="vu-metric-bucket-historical-data-td"
                                style={getHistoricalDataTrendColor(model, historicalDataObj, indexForMetric)}
                              >
                                {/* Display formatted values */}
                                {
                                  (!model.enableHistDataPercentage || model.enableHistDataValueWithPercentage) ?
                                    (
                                      <span className="vumetric-horizontal-table-historical-data-value">
                                        <i
                                          className={"vumetric-horizontal-table-historical-data-value-icon fa " + historicalDataObj.icon}
                                          aria-hidden="true">
                                        </i>
                                        <span>{historicalDataObj.formattedValue}</span>
                                      </span>
                                    )
                                    :
                                    null
                                }
                                {/* Display historical data values in percentage */}
                                {
                                  (model.enableHistDataPercentage || model.enableHistDataValueWithPercentage) ?
                                    (
                                      <VuMetricHistoricalDataPercentage
                                        model={model}
                                        historicalDataObj={historicalDataObj}
                                      />
                                    )
                                    :
                                    null
                                }
                              </td>
                            );
                          })
                        )
                        :
                        null
                    }

                    {/* This will be used to display action buttons when in horizonatl table format and buckets scenario */}
                    {
                      (!bucket.buckets && model.actionButtonsData.length > 0) ?
                        (
                          <td
                            className="action-buttons-td hide-action-buttons-in-report"
                            width={columnWidth}
                          >
                            {bucket.metric.actionButtonsColumnName}
                            {
                              (!bucket.metric.actionButtonsColumnName) ?
                                (
                                  model.actionButtonsData.map((actionButton, indexForActionButton) => {
                                    return (
                                      <div
                                        className=""
                                        key={indexForActionButton}
                                      >
                                        <button
                                          className="single-action-button"
                                          disabled={!this.state.isVisualizationSaved}
                                          style={{ backgroundColor: actionButton.actionColor, fontSize: model.textFontSize, border: '1px solid ' + actionButton.actionColor }}
                                          onClick={() => this.confirmationToStartActionForTableWithBuckets(actionButton.actionName)}
                                          data-tip={actionButton.actionName}
                                        >
                                          {actionButton.actionName}
                                          <ReactTooltip />
                                        </button>
                                        <VunetModal
                                          showModal={this.state.actionConfirmationModal}
                                          onClose={this.actionConfirmationModalClose.bind(this)}
                                          data={actionConfirmationModalData}
                                          onSubmit={this.actionConfirmationModalSubmit.bind(this, actionButton.actionName, bucket, metricData, metric)}
                                        />
                                        <VunetModal
                                          showModal={this.state.actionConfirmationMessageModal}
                                          onClose={this.actionConfirmationMessageModalClose.bind(this)}
                                          data={actionConfirmationMessageModalData}
                                          onSubmit={this.actionConfirmationMessageModalSubmit.bind()}
                                        />
                                      </div>

                                    );
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
                );
              })
            }
          </table>
        )
        :
        null
    );


  }
}

BucketingTable.propTypes = {
  model: PropTypes.object,
  indexForMetric: PropTypes.number,
  metricData: PropTypes.object,
  metric: PropTypes.object,
  columnWidth: PropTypes.string,
  getHistoricalDataTrendColor: PropTypes.func,
  title: PropTypes.string
};

export default BucketingTable;