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

// To navigate to 'Device Families', 'Policies', 'Dashboards' etc.
export class MenuBar extends Component {
  navigateTo = (section) => {
    if (section === 'devices') {
      window.location.href =
        'vienna#' + DeviceConfigConstants.LANDING_PAGE_PATH;
    }
    else if(section === 'deviceFamilies') {
      window.location.href = 'vienna#' +
        DeviceConfigConstants.DEVICE_FAMILIES;
    }
  };

  render() {
    return (
      <div className="dcm-tabs-section">
        <div
          id="devices"
          className={`individual-tab devices ${
            this.props.currentSection === 'devices' ? 'selected-tab' : null
          }`}
          onClick={() => this.navigateTo('devices')}
        >
          Devices
        </div>
        <div
          id="deviceFamilies"
          className={`individual-tab devices ${
            this.props.currentSection === 'deviceFamilies' ? 'selected-tab' : null
          }`}
          onClick={() => this.navigateTo('deviceFamilies')}
        >
          Device Families
        </div>
      </div>
    );
  }
}
