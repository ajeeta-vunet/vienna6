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
import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import ConfigureMetricsTab from './vu_metric_configurations/configure_metrics/configure_metrics_tab';
import ConfigureGroupsTab from './vu_metric_configurations/configure_groups/configure_groups_tab'
import AdditionalInformationTab from './vu_metric_configurations/additional_information/additional_information_tab';
import SetThemeTab from './vu_metric_configurations/set_theme/set_theme_tab'
import { vuMetricConstants } from './lib/vu_metric_constants';
import PropTypes from 'prop-types';

const configureMetrics = 'Configure Metrics';
const configureGroups = 'Configure Groups';
const additionalInformation = 'Add More Data';
const setTheme = 'Set Theme';

class VuMetricPanelConfig extends Component {
  constructor(props) {
    super(props);
    // Data for tabs component
    this.tabs = [{
      id: configureMetrics,
      name: configureMetrics
    },
    {
      id: configureGroups,
      name: configureGroups
    },
    {
      id: additionalInformation,
      name: additionalInformation
    },
    {
      id: setTheme,
      name: setTheme
    }];

    // Mentioning the default landing tab
    this.landingTab = configureMetrics;

    // initialise default states
    this.state = {
      currentTabId: configureMetrics,
    };

  }

  // Set the id of the selected tab to display its contents
  onTabChange = id => {
    this.setState({
      currentTabId: id
    });
  };

  // This function will return the component of the particular tabs
  vuMetricTabsContent = () => {
    if (this.state.currentTabId == configureMetrics) {
      return (
        <ConfigureMetricsTab
          model={this.props.model}
          errorModel={this.props.errorModel}
          onChange={this.props.onChange}
          onErrorChange={this.props.onErrorChange}
          vis={this.props.vis}
          disablePreviewButtonIfSameLabelExists={this.props.disablePreviewButtonIfSameLabelExists}
          disablePreviewButtonIfErrorInSavedSearchFound={this.props.disablePreviewButtonIfErrorInSavedSearchFound}
          filterInjectorForSavedSearch={this.props.filterInjectorForSavedSearch}
        />
      )
    }
    else if (this.state.currentTabId == configureGroups) {
      return (
        <ConfigureGroupsTab
          model={this.props.model}
          errorModel={this.props.errorModel}
          onChange={this.props.onChange}
          onErrorChange={this.props.onErrorChange}
          vis={this.props.vis}
        />
      )
    }
    else if (this.state.currentTabId == additionalInformation) {
      return (
        <AdditionalInformationTab
          model={this.props.model}
          onChange={this.props.onChange}
        />
      )
    }
    else if (this.state.currentTabId == setTheme) {
      return (
        <SetThemeTab
          model={this.props.model}
          onChange={this.props.onChange}
          savedObjectsProvider={this.props.vis.API.savedObjectsClient}
          vis={this.props.vis}
        />
      )
    }
  }


  render() {
    return (
      <div className="vu-metric-config-wrapper">
        <div className="vu-metric-config-header row">
          <div className="header-tabs col-sm-12">
            <VunetTab
              tabs={this.tabs}
              landingTab={this.landingTab}
              switchTab={this.onTabChange.bind(this)}
              tabStyle={{ backgroundColor: vuMetricConstants.COLOR_CONSTANTS.WHITE }}
            />
          </div>
        </div>
        <div className="vu-metric-config-tabs">
          {this.vuMetricTabsContent()}

        </div>
      </div>
    );
  }
}

VuMetricPanelConfig.propTypes = {
  model: PropTypes.object, //  This is the parameters object 
  errorModel: PropTypes.object, // This is the errro handler object
  onChange: PropTypes.func, // This is the callback function for form changes to update the latest model to state
  onErrorChange: PropTypes.func, // This is the callback function to update the error handler object
  vis: PropTypes.object, // This will be used for API's like savedObjectsClient to get dashboards,search,index etc.
  disablePreviewButtonIfSameLabelExists: PropTypes.func, // This will be used to check if same label exists and disable preview button 
  disablePreviewButtonIfErrorInSavedSearchFound: PropTypes.func, // This will be used to check if there is an error is search found 
  filterInjectorForSavedSearch: PropTypes.func // This is angular $filter injectable which will be used in saved search
};

export default VuMetricPanelConfig;