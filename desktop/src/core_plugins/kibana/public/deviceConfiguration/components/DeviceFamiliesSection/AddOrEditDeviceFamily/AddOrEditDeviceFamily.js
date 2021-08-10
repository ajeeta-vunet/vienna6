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
import './AddOrEditDeviceFamily.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { DeviceFamilyDetails } from '../DeviceFamilyDetails/DeviceFamilyDetails';
import { ConfigManagement } from '../ConfigManagement/ConfigManagement';
import { VunetLoader } from 'ui_framework/src/vunet_components/VunetLoader/VunetLoader';
import { produce } from 'immer';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'Device Families' });

export class AddOrEditDeviceFamily extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSubSection: 'deviceFamilyDetails',
      deviceFamilyObj: {
        // to be passed to DeviceFamilyDetails component
        device_family_details: {
          device_family_name: '',
          vendor: '',
          model: '',
          configuration_management_type: '',
          firmware_management_type: 'ssh',
        },
        // to be passed to ConfigManagement component
        config_management: {
          config_collection_info: [{ startup_cfg: '', running_cfg: '' }],
          config_push_info: [{ config_push_commands: '' }],
        },
        // to be passed to FirmwareManagement component
        firmware_management: {
          firmware_upgrade_info: [{ firmware_upgrade_commands: '' }],
        },
      },
      // If an id for Device Family is received as a prop, render this component
      // for editing the Device Family with the received id, else add new family
      action: this.props.deviceFamilyId
        ? 'editDeviceFamily'
        : 'addDeviceFamily',
      // for editing the device family, fetch the details of the family and then
      // set loading as false
      loading: this.props.deviceFamilyId ? true : false,
    };
  }

  componentDidMount() {
    if (this.props.deviceFamilyId) {
      // fetch the details of the Device Family
      const deviceFamilyId = this.props.deviceFamilyId;
      apiProvider.getAll(`dcm/family/${deviceFamilyId}/`).then((response) => {
        const deviceFamilyObj = produce(this.state.deviceFamilyObj, (draft) => {
          draft.device_family_details.device_family_name =
            response.device_family.device_family_name;
          draft.device_family_details.vendor = response.device_family.vendor;
          draft.device_family_details.model = response.device_family.model;
          draft.device_family_details.configuration_management_type =
            response.device_family.configuration_management_type;
          draft.device_family_details.firmware_management_type =
            response.device_family.firmware_management_type;
          draft.config_management.config_collection_info =
            response.device_family.config_collection_info;
          draft.config_management.config_push_info =
            response.device_family.config_push_info;
          draft.firmware_management.firmware_upgrade_info =
            response.device_family.firmware_upgrade_info;
        });
        this.setState({ deviceFamilyObj, deviceFamilyId, loading: false });
      });
    }
  }

  // when user clicks on Back button. Takes an object with current section details
  navigateToPrevious = (currentSubSectionDetails) => {
    if (this.state.currentSubSection === 'deviceFamilyDetails') {
      this.props.showDeviceFamiliesPage();
    } else if (this.state.currentSubSection === 'configManagement') {
      const deviceFamilyObj = produce(this.state.deviceFamilyObj, (draft) => {
        draft.config_management = currentSubSectionDetails;
      });
      this.setState({ deviceFamilyObj }, () =>
        this.setState({ currentSubSection: 'deviceFamilyDetails' })
      );
    }
  };

  // when user clicks on Continue button. Takes an object with current section details
  navigateToNext = (currentSubSectionDetails) => {
    if (this.state.currentSubSection === 'deviceFamilyDetails') {
      const deviceFamilyObj = produce(this.state.deviceFamilyObj, (draft) => {
        draft.device_family_details = currentSubSectionDetails;
      });
      // update the deviceFamily object
      this.setState({ deviceFamilyObj }, () => {
        // if the component is called for Add operation, make an API call
        if (!this.props.deviceFamilyId) {
          const postBody = {
            ...this.state.deviceFamilyObj.device_family_details,
            ...this.state.deviceFamilyObj.config_management,
            ...this.state.deviceFamilyObj.firmware_management,
          };
          apiProvider
            .post('dcm/family/', postBody)
            .then((response) => {
              if (response.status === 200) {
                notify.info('New Device Family added successfully');
              } else {
                notify.error(`${response.response.data['error-string']}`);
              }
            })
            .then(() => this.props.showDeviceFamiliesPage());
        } else {
          // if the component is rendered for Edit operation, navigate to next section
          this.setState({ currentSubSection: 'configManagement' });
        }
      });
    } else if (this.state.currentSubSection === 'configManagement') {
      const deviceFamilyObj = produce(this.state.deviceFamilyObj, (draft) => {
        draft.config_management = currentSubSectionDetails;
      });
      // update the deviceFamily object and make a PUT API call
      this.setState({ deviceFamilyObj }, () => {
        const putBody = {
          ...this.state.deviceFamilyObj.device_family_details,
          ...this.state.deviceFamilyObj.config_management,
          ...this.state.deviceFamilyObj.firmware_management,
        };
        const url = `dcm/family/${this.props.deviceFamilyId}/`;
        apiProvider
          .put(url, putBody)
          .then((response) => {
            if (response.status === 200) {
              notify.info(`${putBody.device_family_name} edited successfully`);
            } else {
              notify.error(`${response.response.data['error-string']}`);
            }
          })
          // post completion of the API call, go back to Device Families listing page
          .then(() => this.props.showDeviceFamiliesPage());
      });
    }
  };

  // to show either Add/Edit Device Family
  displayTitle = () => {
    if (this.props.deviceFamilyId) {
      return 'Edit Device Family';
    } else return 'Add Device Family';
  };

  render() {
    return (
      <div className="add-or-edit-device-families-wrapper">
        {this.state.loading && <VunetLoader />}
        <h4>{this.displayTitle()}</h4>

        <div className="add-or-edit-sub-sections">
          <div
            className={`tab device-family-details ${
              this.state.currentSubSection === 'deviceFamilyDetails' &&
              'selected'
            }`}
          >
            Device Family Details
          </div>
          {/* Show Config Management section only for 'Edit Device Family' */}
          {this.props.deviceFamilyId && (
            <div
              className={`tab config-management ${
                this.state.currentSubSection === 'configManagement' &&
                'selected'
              }`}
            >
              Config Management
            </div>
          )}
        </div>
        {this.state.currentSubSection === 'deviceFamilyDetails' &&
          !this.state.loading && (
            <DeviceFamilyDetails
              action={this.state.action}
              deviceFamilyDetails={
                this.state.deviceFamilyObj.device_family_details
              }
              navigateToPrevious={this.navigateToPrevious}
              navigateToNext={this.navigateToNext}
            />
          )}
        {this.state.currentSubSection === 'configManagement' &&
          !this.state.loading && (
            <ConfigManagement
              action={this.state.action}
              configManagement={this.state.deviceFamilyObj.config_management}
              navigateToPrevious={this.navigateToPrevious}
              navigateToNext={this.navigateToNext}
            />
          )}
      </div>
    );
  }
}
