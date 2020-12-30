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
import SingleAndMultipleVuMetric from './vu_metric_visualizations/single_metric_vis/single_vu_metric';
import HorizontalTableVuMetric from './vu_metric_visualizations/horizontal_table_vis/horizontal_table_vu_metric';
import VerticalTableVuMetric from './vu_metric_visualizations/vertical_table_vis/vertical_table_vu_metric';

class VuMetricVisualization extends Component {
  constructor(props) {
    super(props);
  }

  // This function will be used to display a single metric 
  generateSingleMetric = (model, visData, isEditorMode) => {
    return (
      <SingleAndMultipleVuMetric
        model={model}
        visData={visData}
        title={this.props.title}
        isEditorMode={isEditorMode}
        displayMode='singleMetric'
        Private={this.props.Private}
        getAppState={this.props.getAppState}
        timefilter={this.props.timefilter}
        config={this.props.config}
      />
    )
  }

  // This function will be used to display multiple metrics and we will be using same SingleAndMultipleVuMetric 
  // componenet here as the functionality is totally same
  generateMultiMetric = (model, visData, isEditorMode) => {
    return (
      <SingleAndMultipleVuMetric
        model={model}
        visData={visData}
        title={this.props.title}
        isEditorMode={isEditorMode}
        displayMode='multipleMetric'
        Private={this.props.Private}
        getAppState={this.props.getAppState}
        timefilter={this.props.timefilter}
        config={this.props.config}
      />

    )
  }

  // This function will be used to display horizontal table format
  generateHorizontalTable = (model, visData) => {
    return (
      <HorizontalTableVuMetric
        model={model}
        visData={visData}
        title={this.props.title}
        Private={this.props.Private}
        getAppState={this.props.getAppState}
        config={this.props.config}
      />
    )
  }

  generateVerticalTable = ((model, visData) => {
    return (
      <VerticalTableVuMetric
        model={model}
        visData={visData}
        Private={this.props.Private}
        getAppState={this.props.getAppState}
        timefilter={this.props.timefilter}
        config={this.props.config}
        filterInjectorForVerticalTable={this.props.filterInjectorForVerticalTable}
      />
    )
  });

  render() {
    const model = this.props.model;
    const visData = this.props.visData;
    const isEditorMode = this.props.isEditorMode;

    // This is the case when a user deletes a metric, so this gets deleted in model but 
    // visData still contains the deleted entry as api call was not mode , so we are filtering 
    // the visData accordindly taking in considertaion that no 2 metric labels are the same.  
    if (model.metrics.length < visData.length) {
      let metricNamesInModel = []
      model.metrics.map((metric) => {
        metricNamesInModel.push(metric.label);
      })
      let metricNamesInVisData = []
      visData.map((metric) => {
        let metricKey = Object.keys(metric);
        metricNamesInVisData.push(metricKey[0])
      })

      let difference = metricNamesInVisData.filter(metricName => !metricNamesInModel.includes(metricName));

      visData.map((metric) => {
        for (const [metricKey, metricData] of Object.entries(metric)) {
          difference.map((metricToDelete) => {
            if (metricToDelete === metricKey) {
              let indexOfMetricToDelete = _.indexOf(visData, metric)
              visData.splice(indexOfMetricToDelete, 1)
            }
          })
        }
      })
    }



    if (visData.length > 0) {
      if (model.metrics.length == 1 && !model.enableTableFormat) {
        return (
          <div
            className="vu-metric-single-visualization-container"
            style={{ "height": "100%", "width": "100%" }}
          >
            {this.generateSingleMetric(model, visData, isEditorMode)}
          </div>
        );
      }
      else if (model.metrics.length > 1 && !model.enableTableFormat) {
        return (
          <div className="vu-metric-multi-visualization-container">
            {this.generateMultiMetric(model, visData, isEditorMode)}
          </div>
        );
      }
      // The tabularformat for the old BMVs would be undefined. So show old BMVs in horizontal format by default
      else if (model.enableTableFormat && (model.tabularFormat === undefined || model.tabularFormat === 'horizontal')) {
        model.tabularFormat = 'horizontal';
        return (
          <div className="vu-metric-horizontal-table-container">
            {this.generateHorizontalTable(model, visData)}
          </div>
        )
      }
      else if (model.enableTableFormat && model.tabularFormat === 'vertical') {
        return (
          <div className="vu-metric-vertical-table-container">
            {this.generateVerticalTable(model, visData)}
          </div>
        )
      }

    }
    else {
      return (
        null
      )
    }

  }
}

VuMetricVisualization.propTypes = {
  title: PropTypes.string,
  model: PropTypes.object,
  visData: PropTypes.array,
  isEditorMode: PropTypes.bool,
  Private: PropTypes.func, // This will be used for going to reference link to prepare link information
  getAppState: PropTypes.func, // This will be used for going to reference link to prepare link information
  timefilter: PropTypes.object, // This will be used for going to reference link to prepare link information
  config: PropTypes.object, // This will be used to all the configurations from Manage Resources -> Advanced Settings
  filterInjectorForVerticalTable: PropTypes.func // This is angular $filter injectable which will be used in vertical table
};

export default VuMetricVisualization;