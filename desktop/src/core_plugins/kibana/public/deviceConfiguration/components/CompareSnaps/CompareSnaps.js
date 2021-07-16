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
import './CompareSnaps.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { apiProvider } from '../../../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';

export class CompareSnaps extends Component {
  state = {
    snapData: '',
  };

  // get the diff between selected snapshots
  componentDidMount() {
    const url = `dcm/device/${this.props.deviceId}/collection/snapshot/` +
    `${this.props.snapshots[0].id}/?datatype=diff&id=${this.props.snapshots[1].id}`;
    apiProvider.getAll(url).then((response) => {
      this.setState({ snapData: response });
    });
  }

  render() {
    return (
      <div className="compare-snapshots">
        <VunetButton
          className="table-action-secondary"
          text="<-"
          id="backToSnaps"
          onClick={this.props.snapshotListing}
        />
        <div className="snap-data">
          <pre>{this.state.snapData}</pre>
        </div>
      </div>
    );
  }
}
