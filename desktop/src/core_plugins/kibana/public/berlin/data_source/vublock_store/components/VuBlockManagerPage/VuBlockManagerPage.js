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

import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import './VuBlockManagerPage.less';
import { BasicDetails } from '../BasicDetailsTab/BasicDetails';
import { GetStarted } from '../GetStartedTab/GetStarted';
import { Storyboards } from '../StoryboardsTab/Storyboards';
import { Fields } from '../FieldsTab/Fields';
import { GoldenSignals } from '../GoldenSignalsTab/GoldenSignals';
import { AlertRules } from '../AlertRulesTab/AlertRules';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { VuBlockStoreConstants } from '../../vublock_store_constants';
import { VunetLoader } from 'ui_framework/src/vunet_components/VunetLoader/VunetLoader';

export class VuBlockManagerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadError: false,
      currentTabId: 'basic_details',
      showDetails: false,
      vuBlockName: '',
      iconTitle: 'others.png'
    };

    this.tabs = [
      {
        id: 'basic_details',
        name: 'Basic Details',
      },
      {
        id: 'get_started',
        name: 'Get Started',
      },
      {
        id: 'storyboards',
        name: 'Storyboards',
      },
      {
        id: 'fields',
        name: 'Fields',
      },
      {
        id: 'golden_signals',
        name: 'Golden Signals',
      },
      {
        id: 'alert_rules',
        name: 'Alert Rules',
      },
    ];

    this.landingTab = 'basic_details';
    this.updateVuBlockName = this.updateVuBlockName.bind(this);
  }

  // Callback that is used to change the VuBlock Name when it is changed
  updateVuBlockName = (name) => {
    this.setState({
      vuBlockName: name
    });
  }

  // this function is used to handle the tab changes.
  onTabChange = (id) => {
    if(id !== this.state.currentTabId) {
      this.setState({
        currentTabId: id,
      });
    }
  };

  componentDidMount() {
    apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/${this.props.vuBlockId}`)
      .then((data) => {
        this.setState({
          vuBlockName: data.name,
          loading: false
        });
      })
      .catch(() => {
        this.setState({
          loadError: true
        });
      });

    apiProvider.getAll(`${VuBlockStoreConstants.VUBLOCK_STORE_BASE_PATH}/${this.props.vuBlockId}/${VuBlockStoreConstants.VUBLOCK_ICON}`)
      .then((data) => {
        this.setState({
          vuBlockName: data.name,
          loading: false
        });
      });
  }

  render() {
    const tabStyle = {
      backgroundColor: '#FFFFFF'
    };

    return (
      <div className="vublock-manager-container">
        {
          this.state.loading && !this.state.loadError &&
          (
            <div className="load-status">
              <VunetLoader />
            </div>
          )
        }
        { !this.state.loading &&
          (
            <div>
              <div className="vublock-header-wrapper">
                <h1 className="kuiTitle">
                  {this.state.vuBlockName}
                </h1>
              </div>
              <div className="vublock-manager-tabs-wrapper">
                <VunetTab
                  tabs={this.tabs}
                  landingTab={this.landingTab}
                  switchTab={this.onTabChange}
                  tabStyle={tabStyle}
                />
              </div>
              <hr className="vublock-store-divider" />
              <div className="vublock-manager-tabs-content">
                {/* display the respective tab according the id */}
                {this.state.currentTabId === 'basic_details' && (
                  <BasicDetails
                    vuBlockId={this.props.vuBlockId}
                    updateVuBlockName={this.updateVuBlockName}
                  />
                )}
                {this.state.currentTabId === 'get_started' && (
                  <GetStarted
                    vuBlockId={this.props.vuBlockId}
                    editable="true"
                  />
                )}
                {this.state.currentTabId === 'storyboards' && (
                  <Storyboards
                    vuBlockId={this.props.vuBlockId}
                    editable="true"
                  />
                )}
                {this.state.currentTabId === 'fields' && (
                  <Fields
                    vuBlockId={this.props.vuBlockId}
                    editable="true"
                  />
                )}
                {this.state.currentTabId === 'golden_signals' && (
                  <GoldenSignals
                    vuBlockId={this.props.vuBlockId}
                    editable="true"
                  />
                )}
                {this.state.currentTabId === 'alert_rules' && (
                  <AlertRules
                    vuBlockId={this.props.vuBlockId}
                    editable="true"
                  />
                )}
              </div>
            </div>
          )
        }
        {
          this.state.loading && this.state.loadError &&
          (
            <div className="load-status">
              Seems like the VuBlock you&#39;re looking for does not exist!
              <br />
              Click&nbsp;<a href="/app/vienna#/berlin/data_source/vuBlock_Store">here</a>&nbsp;to go back to the VuBlock store.
            </div>
          )
        }
      </div>
    );
  }
}

VuBlockManagerPage.propTypes = {};
