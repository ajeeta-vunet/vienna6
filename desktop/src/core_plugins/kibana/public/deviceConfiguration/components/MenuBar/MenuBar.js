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
import './MenuBar.less';
import { DeviceConfigConstants } from '../../device_configuration_constants';

// To navigate to various sections in DCM such as 'Device Families', 'Policies', 'Dashboards' etc.
// 'Devices' section is shown by default
export class MenuBar extends Component {
  navigateTo = (e) => {
    if (e.target.id === 'devices') {
      window.location.href =
        'vienna#' + DeviceConfigConstants.LANDING_PAGE_PATH;
    }
    // else if(e.target.id === 'deviceFamilies'){
    // window.location.href = 'vienna#' +
    // DeviceConfigConstants.DEVICE_FAMILIES;
    // }
  };

  render() {
    return (
      <div className="dcm-tabs-section" onClick={(e) => this.navigateTo(e)}>
        <div
          id="devices"
          className={`individual-tab devices ${
            this.props.currentSection === 'devices' ? 'selected-tab' : null
          }`}
        >
          Devices
        </div>
      </div>
    );
  }
}
