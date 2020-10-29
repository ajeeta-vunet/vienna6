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
import Tooltip from '../../lib/tooltip';
import VuMetricHistoricalData from '../components/historical_data/vu_metric_historical_data'
import { VunetModal } from 'ui_framework/src/vunet_components/vunet_modal/vunet_modal'
import { vuMetricConstants } from '../../lib/vu_metric_constants';
import { goToReferenceLink } from '../../lib/vu_metric_utils';
import chrome from 'ui/chrome'
import moment from 'moment';
import '../single_metric_vis/single_vu_metric.less'

class SingleAndMultipleVuMetric extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisualizationSaved: false,
      actionConfirmationModal: false,
      actionConfirmationMessageModal: false
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
  // have downward trend then upward trend values will be red and downward trend values will be green
  getHistoricalDataTrendColor = (model, historicalDataObj, indexForMetric) => {
    let style = {};
    if (model.metrics[indexForMetric].bgColorEnabled) {
      style = { color: vuMetricConstants.COLOR_CONSTANTS.WHITE };
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

  // This will be used to generate single historical data container
  generateSingleHistoricalData = (model, historicalDataObj, indexForMetric) => {
    return (
      <div
        key={historicalDataObj.label}
        // + (model.metrics[indexForMetric].upTrendColor == 'green' ? 'upward-trend-green' : 'upward-trend-red')
        className="single-historical-data-container"
        style={this.getHistoricalDataTrendColor(model, historicalDataObj, indexForMetric)}
      >
        <VuMetricHistoricalData
          model={model}
          historicalDataObj={historicalDataObj}
          indexForMetric={indexForMetric}
        />
        <div
          className="historical-data-label">
          {historicalDataObj.label}
        </div>
      </ div >
    )
  }

  // THis fucntion will be used to render a single action button 
  generateSingleActionButton = (model, actionButton) => {
    return (
      <button
        key={actionButton.actionName}
        className="single-action-button"
        disabled={!this.state.isVisualizationSaved}
        style={{ backgroundColor: actionButton.actionColor, fontSize: model.textFontSize + 'pt', border: '1px solid ' + actionButton.actionColor }}
        onClick={() => this.openActionConfirmationModal()}
        data-tip={actionButton.actionName}
      >
        {actionButton.actionName}
        <ReactTooltip />
      </button>
    )
  }

  // This function will be used to initiate the action on click of a action button
  openActionConfirmationModal = () => {
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
  actionConfirmationModalSubmit = (actionName) => {
    let argrumentsToSend = {};
    const urlBase = chrome.getUrlBase();

    argrumentsToSend.bmv = this.props.title;
    // This will return us an array of [username,userrole,userpermissions]
    const userInfo = chrome.getCurrentUser();
    argrumentsToSend.userName = userInfo[0];
    // Will only be used in tanle and bucketing cases 


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
    const visData = this.props.visData;
    const isEditorMode = this.props.isEditorMode;
    const displayMode = this.props.displayMode;

    const actionConfirmationModalData = vuMetricConstants.ACTION_CONFIRMATION_MODAL_DATA;

    const actionConfirmationMessageModalData = vuMetricConstants.ACTION_CONFIRMATION_MESSAGE_MODAL_DATA;

    const utcRegex = new RegExp('\\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z\\b');

    const timeFormat = this.props.config.get('dateFormat');

    visData.forEach((metricData, index) => {
      for (const key in metricData) {
        if (metricData.hasOwnProperty(key)) {
          // We test response to the check if this is a timestamp and if so
          // we would change the format to a standard time format set in Advance Settings under Manage Resources.
          if (utcRegex.test(metricData[key].formattedValue)) {
            const m = moment(metricData[key].formattedValue);
            metricData[key].formattedValue = m.local().format(timeFormat);
          }
        }
      }
    });

    // This functoin is used to render a metric container both in the cases of single metric
    // scenario and multiple metric scenario
    const generateSingleMetricContainer = (model, metricData, indexForMetric) => {
      if (!model.metrics[indexForMetric].hideMetric) {
        return (
          <div
            className="single-vu-metric-container"
            key={indexForMetric} // metricData.label was the key before we chnaged to indexForMetric
            style={model.metrics[indexForMetric].bgColorEnabled ? { backgroundColor: metricData.color, color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : {}}>
            <div className="label-and-value-conatiner"
              onClick={() => {
                model.metrics[indexForMetric].referenceLink.enabled ?
                  goToReferenceLink(
                    this.props.Private,
                    this.props.getAppState,
                    this.props.timefilter,
                    model.metrics[indexForMetric].referenceLink,
                    model.metrics[indexForMetric].filter
                  )
                  :
                  null
              }
              }
              style={model.metrics[indexForMetric].referenceLink.enabled ? { cursor: 'pointer' } : {}} >
              {metricData.success ?
                (
                  <div
                    className="row vu-metric-formatted-value"
                    style={model.metrics[indexForMetric].bgColorEnabled ?
                      { fontSize: model.fontSize + 'pt' }
                      :
                      { fontSize: model.fontSize + 'pt', color: metricData.color }
                    }
                  >
                    {metricData.formattedValue}
                  </div>
                )
                :
                (
                  <div
                    // ng-style="{'padding': (vis.params.fontSize * noDataContainerConstant) +'pt'}"
                    className="no-results-found-container">
                    <i
                      // ng-style="{'font-size': (vis.params.fontSize * noDataIconConstant) +'pt'}"
                      style={model.metrics[indexForMetric].bgColorEnabled ? { color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : {}}
                      aria-hidden="true"
                      className="icon-no-results-found">
                    </i>
                    <div
                      className="no-results-message"
                      style={model.metrics[indexForMetric].bgColorEnabled ? { color: vuMetricConstants.COLOR_CONSTANTS.WHITE } : {}}>
                      No Results Found
                </div>
                  </div>
                )
              }

              <div className="row vu-metric-label-and-description-container">
                <div
                  className="vu-metric-label"
                  style={model.metrics[indexForMetric].bgColorEnabled ? { color: vuMetricConstants.COLOR_CONSTANTS.WHITE, fontSize: model.textFontSize + 'pt' } : { fontSize: model.textFontSize + 'pt' }}>
                  {model.metrics[indexForMetric].label}
                </div>
                {model.metrics[indexForMetric].description &&
                  (
                    <div className="description-help-container">
                      <Tooltip
                        placement='bottom'
                        text={model.metrics[indexForMetric].description}>
                        <i className="description-help icon-help-blue" ></i>
                      </Tooltip>
                    </div>
                  )
                }

              </div>
            </div>

            {/* GOAL ROW  CONATINER */}

            {model.metrics[indexForMetric].goalLabel &&
              (
                <div
                  className="row vu-metric-goal-label"
                  style={{ fontSize: model.textFontSize - 3 + 'pt' }}
                >
                  {model.metrics[indexForMetric].goalLabel}
                </div>
              )
            }

            {/* HISTORICAL DATA CONTAINER */}

            {(model.historicalData.length && metricData.historicalData != undefined) ?
              (
                <div
                  className="row vu-metric-historical-data"
                >
                  {
                    metricData.historicalData.map((historicalDataObj) => {
                      return (
                        this.generateSingleHistoricalData(model, historicalDataObj, indexForMetric)
                      )
                    })
                  }
                </div>
              )
              :
              null

            }

            {/* ACTION BUTTONS CONTAINER FOR SINGLE METRIC SCENARIO */}

            {(model.actionButtonsData.length && displayMode === 'singleMetric') ?
              (
                <div className="row vu-metric-action-buttons">
                  {
                    model.actionButtonsData.map((actionButton) => {
                      return (
                        <div className="">
                          {this.generateSingleActionButton(model, actionButton)}
                          <VunetModal
                            showModal={this.state.actionConfirmationModal}
                            onClose={this.actionConfirmationModalClose.bind(this)}
                            data={actionConfirmationModalData}
                            onSubmit={this.actionConfirmationModalSubmit.bind(this, actionButton.actionName)}
                          />
                          <VunetModal
                            showModal={this.state.actionConfirmationMessageModal}
                            onClose={this.actionConfirmationMessageModalClose.bind(this)}
                            data={actionConfirmationMessageModalData}
                            onSubmit={this.actionConfirmationMessageModalSubmit.bind()}
                          />
                        </div>

                      )
                    })
                  }
                </div>
              )
              :
              null

            }

          </div>
        )
      }
    }

    // This will be rendered if there is single metric scenario
    const generateSingleMetricBlock = () => {
      return (
        <div className={"single-vu-metric-container-wrapper " + (isEditorMode ? 'vu-metric-in-config' : 'vu-metric-in-dashboard')} >
          {
            visData.map((metric) => {
              for (const [metricKey, metricData] of Object.entries(metric)) {
                let indexForMetric = _.indexOf(visData, metric);
                return (
                  generateSingleMetricContainer(model, metricData, indexForMetric)
                )
              }
            })
          }
        </div>
      )
    }

    // This will be rendered if there is multiple metric scenario. This has been created differently for multi metric
    // scenario beacuse the action buttons placement is different for single and multi metric cases 
    const generateMultiMetricBlock = () => {
      return (
        <div className={"single-vu-metric-container-wrapper multi-vu-metric-with-action-buttons " + (isEditorMode ? 'vu-metric-in-config' : 'vu-metric-in-dashboard')}>
          <div className="multi-metric-outer-container">
            {
              visData.map((metric) => {
                for (const [metricKey, metricData] of Object.entries(metric)) {
                  let indexForMetric = _.indexOf(visData, metric);
                  return (
                    generateSingleMetricContainer(model, metricData, indexForMetric)
                  )
                }
              })
            }

            {/* ACTION BUTTONS CONTAINER FOR MULTIPLE METRIC SCENARIO */}

            {
              model.actionButtonsData.length ?
                (
                  <div className="vu-metric-action-buttons">
                    {
                      model.actionButtonsData.map((actionButton, indexOfActionButtons) => {
                        return (
                          <div
                            className=""
                            key={indexOfActionButtons}>
                            {this.generateSingleActionButton(model, actionButton)}
                            <VunetModal
                              showModal={this.state.actionConfirmationModal}
                              onClose={this.actionConfirmationModalClose.bind(this)}
                              data={actionConfirmationModalData}
                              onSubmit={this.actionConfirmationModalSubmit.bind(this, actionButton.actionName)}
                            />
                            <VunetModal
                              showModal={this.state.actionConfirmationMessageModal}
                              onClose={this.actionConfirmationMessageModalClose.bind(this)}
                              data={actionConfirmationMessageModalData}
                              onSubmit={this.actionConfirmationMessageModalSubmit.bind()}
                            />
                          </div>
                        )
                      })
                    }
                  </div>
                )
                :
                null
            }
          </div>
        </div>
      )
    }


    // We have rendering both the single or multi metric blocks according to the displayMode sent in the props.
    if (displayMode === 'singleMetric') {
      return (
        generateSingleMetricBlock()
      )
    }

    else if (displayMode === 'multipleMetric')
      return (
        generateMultiMetricBlock()
      )

  }
}

SingleAndMultipleVuMetric.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  visData: PropTypes.array, // This is array retured by the api
  title: PropTypes.string, // This represent the name of the visualization
  isEditorMode: PropTypes.bool, // This represents if visualization has to been rendered in editor mode (i.e. with configurations)
  displayMode: PropTypes.string, // This will be used to distinguish between single and multi metric
  Private: PropTypes.func, // This will be used for going to reference link to prepare link information
  getAppState: PropTypes.func, // This will be used for going to reference link to prepare link information
  timefilter: PropTypes.object, // This will be used for going to reference link to prepare link information
};

export default SingleAndMultipleVuMetric;