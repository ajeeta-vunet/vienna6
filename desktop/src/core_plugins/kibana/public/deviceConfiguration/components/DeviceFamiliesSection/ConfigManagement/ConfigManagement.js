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

import React, { Component } from 'react';
import './ConfigManagement.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { produce } from 'immer';

export class ConfigManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configManagementDetails: this.props.configManagement,
    };
  }

  // when user starts filling the form
  saveConfigCollectionInfo = (e) => {
    const configManagementDetails = produce(
      this.state.configManagementDetails,
      (draft) => {
        draft.config_collection_info[0][e.target.id] = e.target.value;
      }
    );
    this.setState({ configManagementDetails });
  };

  // navigate to the previous section
  previousSection = () => {
    this.props.navigateToPrevious(this.state.configManagementDetails);
  };

  // when user clicks on Continue/Save button
  nextSection = () => {
    this.props.navigateToNext(this.state.configManagementDetails);
  };

  render() {
    return (
      <div className="device-families-config-management">
        <form className="config-management-form" autoComplete="off">
          <div className="config-collect-title">Config Collection Info</div>
          <div className="startup-config-wrapper">
            <label>Startup Configuration</label>
            <textarea
              id="startup_cfg"
              className="startup-config"
              onChange={(e) => this.saveConfigCollectionInfo(e)}
              value={
                this.state.configManagementDetails.config_collection_info[0]
                  .startup_cfg
              }
            />
          </div>
          <div className="running-config-wrapper">
            <label>Running Configuration</label>
            <textarea
              id="running_cfg"
              className="running-config"
              onChange={(e) => this.saveConfigCollectionInfo(e)}
              value={
                this.state.configManagementDetails.config_collection_info[0]
                  .running_cfg
              }
            />
          </div>
        </form>
        <VunetButton
          className="secondary"
          data-text="Back"
          onClick={this.previousSection}
        />
        <VunetButton
          className="primary add-or-edit-continue"
          data-text="Save"
          onClick={this.nextSection}
        />
      </div>
    );
  }
}
