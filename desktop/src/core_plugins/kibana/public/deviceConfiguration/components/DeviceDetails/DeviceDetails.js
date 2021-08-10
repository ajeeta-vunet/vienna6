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
import './DeviceDetails.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { produce } from 'immer';

export class DeviceDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceFamilyList: [],
      credentials: [],
      deviceObj: this.props.deviceObj,
      errorObj: {
        device_name: false,
        device_family_name: false,
        credentials: false
      },
      errorMessage: {
        device_name: 'Device name cannot be empty!',
        device_family_name: 'Select a device family from the dropdown!',
        credentials: 'Select credentials to be used!'
      },
      invalidIP: '',
    };
  }

  componentDidMount() {
    // get the list of device families for a device
    const getDeviceFamilies = apiProvider.getAll('dcm/family/');
    // get the list of credentials to choose from
    const getCredentials = apiProvider.getAll('credentials/ssh/');
    Promise.all([getDeviceFamilies, getCredentials]).then((values) => {
      const deviceFamilyList = values[0].device_family.map(
        (deviceFamily) => deviceFamily.device_family_name
      );
      const credentials = values[1].creds.map(cred => cred.name);
      this.setState({ deviceFamilyList, credentials, deviceObj: this.props.deviceObj });
    });
  }

  // to save the details entered by the user locally as well as in the
  // parent component as API requests are made in the parent component(addOrEditDevice)
  storeDeviceDetails = (e) => {
    if (e.target.id === 'device_address') {
      // conduct IP validation
      const deviceObj = produce(this.state.deviceObj, (draft) => {
        draft.device_address = e.target.value;
      });
      if (
        e.target.value.match(
          '^(([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)\\.){3}([1-9]?\\d|1\\d\\d|25[0-5]|2[0-4]\\d)$'
        ) === null
      ) {
        this.setState({
          invalidIP: 'Please provide valid IP address',
          deviceObj
        });
      } else {
        this.setState({
          invalidIP: '',
          deviceObj
        });
      }
    } else {
      const deviceObj = produce(this.state.deviceObj, (draft) => {
        draft[e.target.id] = e.target.value;
      });
      if(deviceObj[e.target.id].length === 0) {
        const errorObj = produce(this.state.errorObj, (draft) => {
          draft[e.target.id] = true;
        });
        this.setState({ errorObj, deviceObj });
      } else {
        this.setState({ deviceObj });
      }
    }
  };

  // to navigate back to 'Device Listing' screen
  previousSection = () => {
    this.props.navigateToPrevious();
  }

  // to go to 'Config Management' section if the action is either 'View Device' or
  // if the component is rendered for editing the device
  nextSection = () => {
    this.props.navigateToNext(this.state.deviceObj);
  }

  // since all the fields in 'Device Details' are mandatory, Save/Continue button
  // will be disabled even if atleast one input field is left empty
  disableSaveButton = () => {
    if (this.state.deviceObj.device_name.trim().length < 1 ||
        this.state.deviceObj.device_address.length < 1 ||
        this.state.deviceObj.device_family_name.length < 1 ||
        this.state.deviceObj.credentials.length < 1 ||
        this.state.invalidIP.length > 0
    ) {
      return true;
    }
    else {
      return false;
    }
  };

  render() {
    return (
      <div className="dcm-device-details">
        <form className="dcm-device-details-form" autoComplete="off">
          <div>
            <label htmlFor="deviceName">Device Name</label>
            <input
              type="text"
              id="device_name"
              value={this.state.deviceObj.device_name}
              onChange={(e) => this.storeDeviceDetails(e)}
              disabled={this.props.disable && true}
            />
            {/* show error message if device_name is empty */}
            {
              this.state.errorObj.device_name &&
              <div className="error-message">
                {this.state.errorMessage.device_name}
              </div>
            }
          </div>
          <div>
            <label htmlFor="deviceIP">IP Address</label>
            <input
              type="text"
              id="device_address"
              value={this.state.deviceObj.device_address}
              onChange={(e) => this.storeDeviceDetails(e)}
              // IP field is not editable unless the user is adding a new device
              disabled={this.props.action !== 'addDevice' && true}
            />
            {/* show error message if the IP is invalid */}
            {
              this.state.invalidIP !== '' &&
              <div className="error-message">
                {this.state.invalidIP}
              </div>
            }
          </div>
          <div>
            <label htmlFor="device_family_name">Device Family</label>
            <select
              id="device_family_name"
              onChange={(e) => this.storeDeviceDetails(e)}
              disabled={this.props.disable && true}
            >
              {this.props.action === 'addDevice' ?
                <option value="">Select</option> :
                // if this section is rendered by Edit Device, populate
                // the input values appropriately
                <option value={this.state.deviceObj.device_family_name}>
                  {this.state.deviceObj.device_family_name}
                </option>
              }
              {this.state.deviceFamilyList.map((deviceFamily) => (
                <option key={deviceFamily} value={deviceFamily}>
                  {deviceFamily}
                </option>
              ))}
            </select>
            {/* show error message if device_family is not selected */}
            {
              this.state.errorObj.device_family_name &&
              <div className="error-message">
                {this.state.errorMessage.device_family_name}
              </div>
            }
          </div>
          <div>
            <label htmlFor="credentials">Credentials</label>
            <select
              id="credentials"
              onChange={(e) => this.storeDeviceDetails(e)}
              disabled={this.props.disable && true}
            >
              {this.props.action === 'addDevice' ?
                <option value="">Select</option> :
                <option value={this.state.deviceObj.credentials}>
                  {this.state.deviceObj.credentials}
                </option>
              }
              {this.state.credentials.map((credential) => (
                <option key={credential} value={credential}>
                  {credential}
                </option>
              ))}
            </select>
            {/* show error message if credentials is not selected */}
            {
              this.state.errorObj.credentials &&
              <div className="error-message">
                {this.state.errorMessage.credentials}
              </div>
            }
          </div>
        </form>
        <VunetButton
          id="backBtn"
          className="secondary"
          data-text="Cancel"
          onClick={this.previousSection}
        />
        <VunetButton
          disabled={this.disableSaveButton()}
          id="nextBtn"
          className="primary add-or-edit-continue"
          data-text={this.props.action === 'addDevice' ? 'Save' : 'Next'}
          onClick={this.nextSection}
        />
      </div>
    );
  }
}
