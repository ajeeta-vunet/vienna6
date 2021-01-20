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
// import PropTypes from 'prop-types';

import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import { Topologies } from './Topologies';
import { store } from '../store';
import { Provider } from 'react-redux';

export class DiscoveryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listOfScans: this.props.listOfScans,
      currentTabId: 'topologies',
      showDetails: false,
    };

    this.tabs = [
      {
        id: 'topologies',
        name: 'Topologies',
      },
      {
        id: 'scheduled_scan',
        name: 'Scheduled Scan',
      }
    ];

    this.landingTab = 'topologies';
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      listOfScans: newProps.listOfScans
    });
  }

  //this function is used to handle the tab changes.
  onTabChange = (id) => {
    this.setState({
      currentTabId: id,
    });
  };

  render() {

    return (
      <Provider store={store}>
        <div className="event-details">
          <div className="discovery-tabs-wrapper">
            <VunetTab
              tabs={this.tabs}
              landingTab={this.landingTab}
              switchTab={this.onTabChange}
            />
          </div>
          {/* Tabs Body */}
          <div className="content-body">
            {/* display the respective tab according the id */}
            {this.state.currentTabId === 'topologies' && (
              <Topologies
                credList={this.props.credList}
                sourceIpAddressList={this.props.sourceIpAddressList}
              />
            )}
            {this.state.currentTabId === 'scheduled_scan' && (
              <div>Yet to be implemented.</div>
            )}
          </div>
        </div>
      </Provider>
    );
  }
}

DiscoveryPage.propTypes = {
};