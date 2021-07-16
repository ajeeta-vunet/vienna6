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
import './AddOrEditDevice.less';
import { DeviceDetails } from '../DeviceDetails/DeviceDetails';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { Notifier } from 'ui/notify';
import { DeviceConfigConstants } from '../../device_configuration_constants';
import { ConfigManagement } from '../ConfigManagement/ConfigManagement';
import { Snapshots } from '../Snapshots/Snapshots';
import { produce } from 'immer';

const notify = new Notifier({ location: 'DCM' });

export class AddOrEditDevice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSubSection:
        this.props.action === 'viewSnapshots' ? 'snapshots' : 'deviceDetails',
      // deviceObj is the payload for POST and PUT API calls of devices
      deviceObj: {
        device_name: '',
        device_address: '',
        device_family_name: '',
        collect_schedule_status: 'Disable',
        config_collection_settings: [
          { schedule_at: '', periodic_schedule: '' },
        ],
        config_upload_settings: [],
        firmware_upload_settings: [],
        config_policy: '',
        credentials: '',
      },
      deviceId: '',
    };
  }

  // if called this component to edit a device with deviceId,
  // fetch the details of that device
  componentDidMount() {
    if (this.props.deviceId) {
      const deviceId = this.props.deviceId;
      apiProvider.getAll(`dcm/device/${deviceId}/`).then((response) => {
        const deviceObj = produce(this.state.deviceObj, (draft) => {
          draft.device_name = response.device_details.device_name;
          draft.device_address = response.device_details.device_address;
          draft.device_family_name = response.device_details.device_family_name;
          draft.collect_schedule_status =
            response.device_details.collect_schedule_status;
          draft.config_collection_settings =
            response.device_details.config_collection_settings;
          draft.config_upload_settings =
            response.device_details.config_upload_settings;
          draft.firmware_upload_settings =
            response.device_details.firmware_upload_settings;
          draft.config_policy = response.device_details.config_policy;
          draft.credentials = response.device_details.credentials;
        });
        this.setState({ deviceObj, deviceId });
      });
    }
  }

  // receives the 'section' to navigate to
  navigateToPrevious = (section, deviceObj) => {
    if(this.state.currentSubSection === 'deviceDetails') {
      if(this.props.action === 'addDevice' || this.props.action === 'viewSnapshots') {
        this.props.displayDeviceListingPage();
      } else {
        // since 'Edit Device' is rendered in a different url, change the url to go to
        // 'Device Listing' page
        window.location.href =
        'vienna#' + DeviceConfigConstants.LANDING_PAGE_PATH;
      }
    } else if(this.state.currentSubSection === 'configManagement') {
      if(this.props.action === 'viewSnapshots') {
        this.setState({ currentSubSection: section });
      } else {
        // while switching between tabs during editing a device, save the details
        // from the current section and then navigate to the previous section
        this.setState({ deviceObj }, () => this.setState({ currentSubSection: section }));
      }
    } else {
      this.setState({ currentSubSection: section });
    }
  }

  // add a new device to the 'Devices' list/ edit an existing device
  navigateToNext = (deviceObj) => {
    // Add Device has only 'Device Details' section. Hence, when the user clicks
    // on Save in Add Device page, make an API call to add the device to the device list.
    if (this.props.action === 'addDevice') {
      const postBody = deviceObj;
      apiProvider
        .post('dcm/device/', postBody)
        .then((response) => {
          if(response.status === 200) {
            notify.info('Device added successfully');
          } else {
            notify.error(`${response.response.data['error-string']}`);
          }
        })
        .then(() => this.props.displayDeviceListingPage());
    } else if (this.state.currentSubSection === 'deviceDetails') {
      if(this.props.action === 'viewSnapshots') {
        this.setState({ currentSubSection: 'configManagement' });
      } else {
        // while switching between tabs during editing a device, save the details
        // from the current section and then navigate to the next section
        this.setState({ deviceObj }, () => this.setState({ currentSubSection: 'configManagement' }));
      }
    } else if (this.state.currentSubSection === 'configManagement') {
      if(this.props.action === 'viewSnapshots') {
        // if the component is rendered for viewing a device,
        // navigate to Snapshots section
        this.setState({ currentSubSection: 'snapshots' });
      }
      // if the component is rendered for editing a device, when user clicks
      // on Save button in Config Management section, make an API call to edit
      // the device
      else {
        const putBody = deviceObj;
        const url = `dcm/device/${this.props.deviceId}/`;
        apiProvider.put(url, putBody)
          .then((response) => {
            if(response.status === 200) {
              notify.info(`${putBody.device_name} edited successfully`);
            }
            else {
              notify.error(`${response.response.data['error-string']}`);
            }
          })
          .then(window.location.href =
            'vienna#' + DeviceConfigConstants.LANDING_PAGE_PATH);
      }
    } else if (this.state.currentSubSection === 'snapshots') {
      // if the user is in Snapshots section, a cancel button is rendered
      // instead of Save button to take the user to device listing screen
      this.props.displayDeviceListingPage();
    }
  };

  // display text content on 'next subSection' button conditionally
  displayContinueOrSave = () => {
    if(this.state.currentSubSection === 'snapshots') {
      // To return to 'DeviceListing' screen
      return 'Cancel';
    } else if(this.state.currentSubSection === 'configManagement' && this.props.action === 'viewSnapshots') {
      return 'Continue';
    } else if(this.props.action === 'addDevice' ||
    (this.state.currentSubSection === 'configManagement' && this.props.deviceId)) {
      // for 'Add' and 'Edit' device API calls
      return 'Save';
    } else {
      return 'Continue';
    }
  }

  // display title as Add, Edit or View Device
  displayTitle = () => {
    if(this.props.action === 'addDevice') {
      return 'Add Device';
    } else if(this.props.action === 'viewSnapshots') {
      return 'View Device';
    } else return 'Edit Device';
  }

  render() {
    return (
      <div className="dcm-add-or-edit-device">
        <h4>
          { this.displayTitle() }
        </h4>

        <div className="add-or-edit-sub-sections">
          <div
            className={`tab device-details ${
              this.state.currentSubSection === 'deviceDetails' && 'selected'
            }`}
          >
              Device Details
          </div>
          {/* Add Device only contains Device Details section */}
          {this.props.action !== 'addDevice' ? (
            <div
              className={`tab configManagement ${
                this.state.currentSubSection === 'configManagement' &&
                  'selected'
              }`}
            >
                Config Management
            </div>
          ) : null}
          {/* Only View Device contains a Snapshot section */}
          {this.props.action === 'viewSnapshots' ? (
            <div
              className={`tab snapshots ${
                this.state.currentSubSection === 'snapshots' && 'selected'
              }`}
            >
                Snapshots
            </div>
          ) : null}
        </div>
        {this.state.currentSubSection === 'deviceDetails' && (
          <DeviceDetails
            deviceObj={this.state.deviceObj}
            disable={this.props.action === 'viewSnapshots' && true}
            action={this.props.action}
            navigateToPrevious={this.navigateToPrevious}
            navigateToNext={this.navigateToNext}
          />
        )}
        {this.state.currentSubSection === 'configManagement' && (
          <ConfigManagement
            deviceObj={this.state.deviceObj}
            deviceId={this.state.deviceId}
            navigateToPrevious={this.navigateToPrevious}
            navigateToNext={this.navigateToNext}
            action={this.props.action}
          />
        )}
        {this.state.currentSubSection === 'snapshots' && (
          <Snapshots
            deviceId={this.props.deviceId}
            navigateToPrevious={this.navigateToPrevious}
            navigateToNext={this.navigateToNext}
          />
        )}
      </div>
    );
  }
}