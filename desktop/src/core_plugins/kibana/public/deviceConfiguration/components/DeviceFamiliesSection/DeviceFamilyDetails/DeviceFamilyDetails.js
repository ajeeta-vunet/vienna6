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
import './DeviceFamilyDetails.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { produce } from 'immer';

export class DeviceFamilyDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceFamilyDetails: this.props.deviceFamilyDetails,
      configManagementTypes: ['ssh', 'telnet', 'netconf'],
      errorObj: {
        device_family_name: {
          isError: false,
          errorText: 'Device Family name cannot be empty!',
        },
        vendor: {
          isError: false,
          errorText: 'Please provide the name of the vendor',
        },
        model: {
          isError: false,
          errorText: 'Please provide model name',
        },
        configuration_management_type: {
          isError: false,
          errorText: 'Please select a Configuration Management Type',
        },
      },
    };
  }

  // when user starts to fill the form
  storeDeviceFamilyDetails = (e) => {
    const deviceFamilyDetails = produce(
      this.state.deviceFamilyDetails,
      (draft) => {
        draft[e.target.id] = e.target.value;
      }
    );
    if (deviceFamilyDetails[e.target.id].length === 0) {
      const errorObj = produce(this.state.errorObj, (draft) => {
        draft[e.target.id].isError = true;
      });
      this.setState({ errorObj, deviceFamilyDetails });
    } else {
      const errorObj = produce(this.state.errorObj, (draft) => {
        draft[e.target.id].isError = false;
      });
      this.setState({ errorObj, deviceFamilyDetails });
    }
  };

  // to navigate back to 'Device Family Listing' screen
  previousSection = () => {
    this.props.navigateToPrevious();
  };

  // to go to next section if the action is 'editDeviceFamily',
  // else add a new Device Family
  nextSection = () => {
    this.props.navigateToNext(this.state.deviceFamilyDetails);
  };

  // disable the Save button until all mandatory input fields are filled
  disableSaveButton = () => {
    if (
      this.state.deviceFamilyDetails.device_family_name.length < 1 ||
      this.state.deviceFamilyDetails.vendor.length < 1 ||
      this.state.deviceFamilyDetails.model.length < 1 ||
      this.state.deviceFamilyDetails.configuration_management_type.length < 1
    ) {
      return true;
    } else return false;
  };

  render() {
    return (
      <div className="dcm-device-family-details">
        <form className="dcm-device-family-details-form" autoComplete="off">
          <div>
            <label htmlFor="device_family_name">Device Family</label>
            <input
              type="text"
              id="device_family_name"
              value={this.state.deviceFamilyDetails.device_family_name}
              onChange={(e) => this.storeDeviceFamilyDetails(e)}
              // for editing Device Family, user shouldn't be allowed to edit
              // Family Name
              disabled={this.props.action === 'editDeviceFamily' ? true : false}
            />
            {/* show error message if 'Device Family Name' is empty */}
            {this.state.errorObj.device_family_name.isError && (
              <div className="error-message">
                {this.state.errorObj.device_family_name.errorText}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="vendor">Vendor</label>
            <input
              type="text"
              id="vendor"
              value={this.state.deviceFamilyDetails.vendor}
              onChange={(e) => this.storeDeviceFamilyDetails(e)}
            />
            {/* show error message if 'Vendor' is empty */}
            {this.state.errorObj.vendor.isError && (
              <div className="error-message">
                {this.state.errorObj.vendor.errorText}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              value={this.state.deviceFamilyDetails.model}
              onChange={(e) => this.storeDeviceFamilyDetails(e)}
            />
            {/* show error message if 'Model' is empty */}
            {this.state.errorObj.model.isError && (
              <div className="error-message">
                {this.state.errorObj.model.errorText}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="configuration_management_type">
              Config Management Type
            </label>
            <select
              id="configuration_management_type"
              onChange={(e) => this.storeDeviceFamilyDetails(e)}
            >
              {this.props.action === 'addDeviceFamily' ? (
                <option value="">Select</option>
              ) : (
                <option
                  value={
                    this.state.deviceFamilyDetails.configuration_management_type
                  }
                >
                  {this.state.deviceFamilyDetails.configuration_management_type}
                </option>
              )}
              {/* configuration management types are hardcoded with ssh, netconf and telnet */}
              {this.state.configManagementTypes.map((configManagementType) => (
                <option key={configManagementType} value={configManagementType}>
                  {configManagementType}
                </option>
              ))}
            </select>
            {/* show error message if 'Config Management' is empty */}
            {this.state.errorObj.configuration_management_type.isError && (
              <div className="error-message">
                {this.state.errorObj.configuration_management_type.errorText}
              </div>
            )}
          </div>
        </form>
        <VunetButton
          className="secondary"
          data-text="Cancel"
          onClick={this.previousSection}
        />
        <VunetButton
          className="primary add-or-edit-continue"
          data-text={this.props.action === 'addDeviceFamily' ? 'Save' : 'Continue'}
          disabled={this.disableSaveButton()}
          onClick={this.nextSection}
        />
      </div>
    );
  }
}
