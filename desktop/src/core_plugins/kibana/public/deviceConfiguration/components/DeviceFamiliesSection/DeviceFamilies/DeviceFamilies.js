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
import './DeviceFamilies.less';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import ReactTooltip from 'react-tooltip';
import { produce } from 'immer';
import { Notifier } from 'ui/notify';
import { ConfirmationModal } from '../../ConfirmationModal/ConfirmationModal';
import { AddOrEditDeviceFamily } from '../AddOrEditDeviceFamily/AddOrEditDeviceFamily';
import { generateHeading } from '../../../../event/utils/vunet_format_name';

const notify = new Notifier({ location: 'Device Families' });

export class DeviceFamilies extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSection: 'deviceFamiliesList',
      deviceFamilies: [],
      searchString: '',
      selectedItems: [],
      selectAll: false,
      showDeleteConfirmationForSingleFamily: false,
      showDeleteConfirmationForSelectedFamilies: false,
      deleteConfirmationMessage: '',
      deviceFamilyIdForRowActions: '',
      sortColumn: '',
      sortOrder: '',
    };
  }

  componentDidMount() {
    apiProvider
      .getAll('dcm/family/')
      .then((data) => this.setState({ deviceFamilies: data.device_family }));
  }

  // when user starts typing in the search box
  searchDeviceFamilies = (e) => {
    const searchString = e.target.value;
    apiProvider
      .getAll('dcm/family/')
      .then((data) => {
        return data.device_family.filter(
          (family) =>
            family.device_family_name
              .toLowerCase()
              .includes(searchString.toLowerCase()) ||
            family.vendor.toLowerCase().includes(searchString.toLowerCase()) ||
            family.model.toLowerCase().includes(searchString.toLowerCase()) ||
            family.configuration_management_type
              .toLowerCase()
              .includes(searchString.toLowerCase())
        );
      })
      .then((response) => {
        this.setState({ searchString: searchString, deviceFamilies: response });
      });
  };

  // when user clicks on the sort icon in the table header
  sortTable = (sortColumn) => {
    let sortOrder = 'ascending';
    // if the table is already sorted on the sortColumn, check whether
    // it is sorted on ascending or descending order
    if (sortColumn === this.state.sortColumn) {
      if (this.state.sortOrder === 'ascending') {
        sortOrder = 'descending';
      }
    }
    const updatedDeviceFamilies = this.state.deviceFamilies;
    if (sortOrder === 'ascending') {
      updatedDeviceFamilies.sort((a, b) =>
        a[sortColumn] > b[sortColumn] ? 1 : -1
      );
    } else {
      updatedDeviceFamilies.sort((a, b) =>
        a[sortColumn] < b[sortColumn] ? 1 : -1
      );
    }
    this.setState(
      { deviceFamilies: updatedDeviceFamilies, sortColumn, sortOrder },
      () =>
        notify.info(
          ` Sorted in ${sortOrder} order of ${generateHeading(sortColumn)}`
        )
    );
  };

  // Add new Device Family, Delete existing family etc.
  onTableAction = (action) => {
    if (action === 'deleteDeviceFamilies') {
      if (this.state.selectedItems.length > 0) {
        this.setState({
          showDeleteConfirmationForSelectedFamilies: true,
          deleteConfirmationMessage: `Are you sure you'd want to delete selected Device Families?`,
        });
      } else {
        notify.info('Select one or more Device Families to delete!');
      }
    } else if (action === 'addDeviceFamily') {
      this.setState({ currentSection: 'addDeviceFamily' });
    }
  };

  // When user clicks on delete, edit or view in table row
  onRowAction = (action, id, deviceFamilyName) => {
    if (action === 'delete') {
      this.setState({
        deviceFamilyIdForRowActions: id,
        showDeleteConfirmationForSingleFamily: true,
        deleteConfirmationMessage:
          `Are you sure you'd want to delete ` + deviceFamilyName + '?',
      });
    } else if (action === 'edit') {
      this.setState({
        deviceFamilyIdForRowActions: id,
        currentSection: 'editDeviceFamily',
      });
    }
  };

  // to select all Device Families when user clicks on the checkbox in table header.
  selectAllFamilies = (e) => {
    if (e.target.checked) {
      const updatedItems = this.state.deviceFamilies.map((item) => item.id);
      this.setState({ selectedItems: updatedItems, selectAll: true });
    } else {
      // de-select all the devices in the list
      this.setState({ selectedItems: [], selectAll: false });
    }
  };

  // to select a device when user clicks on the checkbox in the table row
  selectSingleFamily = (e, id) => {
    if (e.target.checked) {
      const selectedItems = produce(this.state.selectedItems, (draft) => {
        draft.push(id);
      });
      this.setState({ selectedItems }, () => {
        // if all the devices in the list are selected one after the other,
        // select the multi-select checkbox in the table header
        if (
          this.state.selectedItems.length === this.state.deviceFamilies.length
        ) {
          this.setState({ selectAll: true });
        }
      });
    } else {
      // remove the unselected item from the selectedItems array
      const updatedItems = this.state.selectedItems.filter(
        (item) => item !== id
      );
      this.setState({
        ...this.state,
        selectedItems: updatedItems,
        selectAll: false,
      });
    }
  };

  // When user clicks on delete during confirmation for a single Device Family
  deleteSingleFamily = () => {
    apiProvider
      .remove('dcm/family/' + this.state.deviceFamilyIdForRowActions + '/', '')
      .then((response) => {
        if (response.status === 200) {
          notify.info('Device Family deleted successfully');
          this.updateDeviceFamiliesAfterDeletion();
        } else {
          notify.info(`${response.response.data['error-string']}`);
        }
      });
  };

  // When user clicks on delete during confirmation for selected Device Families
  deleteSelectedFamilies = () => {
    const deletePromise = this.state.selectedItems.map((item) =>
      apiProvider.remove('dcm/family/' + item + '/', '')
    );
    Promise.all(deletePromise).then((response) => {
      if (response[response.length - 1].status === 200) {
        notify.info('Successfully deleted selected Device Families');
        this.updateDeviceFamiliesAfterDeletion();
      } else {
        notify.error(`${response.response.data['error-string']}`);
      }
    });
  };

  // when user clicks on Cancel during confirmation
  cancelDeleteOperation = () => {
    this.setState({
      showDeleteConfirmationForSingleFamily: false,
      showDeleteConfirmationForSelectedFamilies: false,
      deviceFamilyIdForRowActions: '',
    });
  };

  updateDeviceFamiliesAfterDeletion = () => {
    apiProvider.getAll('dcm/family/').then((data) =>
      this.setState({
        deviceFamilies: data.device_family,
        selectedItems: [],
        selectAll: false,
        showDeleteConfirmationForSingleFamily: false,
        showDeleteConfirmationForSelectedFamilies: false,
        deleteConfirmationMessage: '',
        deviceFamilyIdForRowActions: '',
      })
    );
  };

  // to navigate back to Device Families listing page from Add Device Family operation
  showDeviceFamiliesPage = () => {
    apiProvider.getAll('dcm/family/').then((data) =>
      this.setState({
        deviceFamilies: data.device_family,
        currentSection: 'deviceFamiliesList',
        deviceFamilyIdForRowActions: '',
      })
    );
  };

  render() {
    return (
      <div className="dcm-device-families-wrapper">
        {this.state.currentSection === 'deviceFamiliesList' && (
          <div className="device-families">
            <h4>Device Families</h4>

            <div className="dcm-device-families-actions">
              <input
                value={this.state.searchString}
                onChange={(e) => this.searchDeviceFamilies(e)}
                type="text"
                placeholder="Search"
                className="search-input"
                spellCheck="false"
              />
              <VunetButton
                className="table-action-secondary add-device-family"
                data-text="Add"
                id="addDevice"
                onClick={() => this.onTableAction('addDeviceFamily')}
                disabled={this.state.selectedItems.length > 0}
              />
              <div
                data-tip={
                  this.state.selectedItems.length === 0
                    ? 'Select items to delete'
                    : ''
                }
              >
                <ReactTooltip />
                <VunetButton
                  className="table-action-secondary"
                  data-text="Delete"
                  id="deleteDevice"
                  onClick={() => this.onTableAction('deleteDeviceFamilies')}
                  disabled={this.state.selectedItems.length === 0}
                />
              </div>
            </div>

            <div className="device-families-table-container">
              <table className="table device-families-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        className="multi-check"
                        type="checkbox"
                        checked={this.state.selectAll}
                        onChange={(e) => this.selectAllFamilies(e)}
                      />
                    </th>
                    <th>
                      Device Family
                      <i
                        className="fa fa-sort-amount-desc sort-icon"
                        onClick={() => this.sortTable('device_family_name')}
                      />
                    </th>
                    <th>
                      Vendor
                      <i
                        className="fa fa-sort-amount-desc sort-icon"
                        onClick={() => this.sortTable('vendor')}
                      />
                    </th>
                    <th>
                      Model
                      <i
                        className="fa fa-sort-amount-desc sort-icon"
                        onClick={() => this.sortTable('model')}
                      />
                    </th>
                    <th>
                      Config Management Type
                      <i
                        className="fa fa-sort-amount-desc sort-icon"
                        onClick={() =>
                          this.sortTable('configuration_management_type')
                        }
                      />
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.deviceFamilies.map((eachDeviceFamily) => (
                    <tr key={eachDeviceFamily.id}>
                      <td>
                        <input
                          className="single-check"
                          type="checkbox"
                          checked={this.state.selectedItems.includes(
                            eachDeviceFamily.id
                          )}
                          onChange={(e) =>
                            this.selectSingleFamily(e, eachDeviceFamily.id)
                          }
                        />
                      </td>
                      <td>{eachDeviceFamily.device_family_name}</td>
                      <td>{eachDeviceFamily.vendor}</td>
                      <td>{eachDeviceFamily.model}</td>
                      <td>{eachDeviceFamily.configuration_management_type}</td>
                      <td className="device-families-table-actions">
                        <div className="row-actions-icon" data-tip={'Delete'}>
                          <ReactTooltip />
                          <i
                            className="fa fa-trash"
                            onClick={() =>
                              this.onRowAction(
                                'delete',
                                eachDeviceFamily.id,
                                eachDeviceFamily.device_family_name
                              )
                            }
                          />
                        </div>
                        <div className="row-actions-icon" data-tip={'Edit'}>
                          <ReactTooltip />
                          <i
                            className="fa fa-pencil"
                            onClick={() =>
                              this.onRowAction('edit', eachDeviceFamily.id)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* show confirmation message for deleting single device */}
        {this.state.showDeleteConfirmationForSingleFamily && (
          <ConfirmationModal
            confirmationMessage={this.state.deleteConfirmationMessage}
            confirmButtonText="Yes, Delete"
            action="Delete"
            cancelAction={this.cancelDeleteOperation}
            confirmAction={this.deleteSingleFamily}
          />
        )}
        {/* show confirmation message for deleting selected devices */}
        {this.state.showDeleteConfirmationForSelectedFamilies && (
          <ConfirmationModal
            confirmationMessage={this.state.deleteConfirmationMessage}
            confirmButtonText="Yes, Delete"
            action="Delete"
            cancelAction={this.cancelDeleteOperation}
            confirmAction={this.deleteSelectedFamilies}
          />
        )}
        {this.state.currentSection === 'addDeviceFamily' && (
          <AddOrEditDeviceFamily
            showDeviceFamiliesPage={this.showDeviceFamiliesPage}
          />
        )}
        {this.state.currentSection === 'editDeviceFamily' && (
          <AddOrEditDeviceFamily
            deviceFamilyId={this.state.deviceFamilyIdForRowActions}
            showDeviceFamiliesPage={this.showDeviceFamiliesPage}
          />
        )}
      </div>
    );
  }
}
