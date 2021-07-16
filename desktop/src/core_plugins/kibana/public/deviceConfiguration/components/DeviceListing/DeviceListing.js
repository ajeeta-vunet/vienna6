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
import './DeviceListing.less';
import $ from 'jquery';
import { generateHeading } from '../../../event/utils/vunet_format_name';
import { produce } from 'immer';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import Pagination from 'react-js-pagination';
import { Notifier } from 'ui/notify';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { FilterBar } from '../../../discovery/components/FilterBar/FilterBar';
import { Summary } from '../Summary/Summary';
import { AddOrEditDevice } from '../AddOrEditDevice/AddOrEditDevice';
import { ImportDevices } from '../ImportDevices/ImportDevices';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';

// to notify the user on success/failure of operations like add, edit, delete etc.
const notify = new Notifier({ location: 'DCM' });

export class DeviceListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSection: 'deviceListing',
      selectedItems: [],
      deviceListing: [],
      currentPage: 1,
      totalNumberOfDevices: 0,
      search_string: '',
      sort_string: {},
      deviceDetailsSummary: this.props.deviceDetailsSummary,
      filterObject: {},
      showImportDevices: false,
      importFile: '',
      deviceIdForRowActions: '',
      showDeleteConfirmationForSingleDevice: false,
      showDeleteConfirmationForSelectedDevices: false,
      deleteConfirmationMessage: ''
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      deviceDetailsSummary: newProps.deviceDetailsSummary,
    });
  }

  // to get the default list of devices
  componentDidMount() {
    const postBody = {
      scroll_id: 0,
      size: 10,
      sort_string: {},
      search_string: '',
      filter: {},
    };
    apiProvider.post('/dcm/device/', postBody).then((data) => {
      this.setState({
        deviceListing: data.device_list,
        totalNumberOfDevices: data.no_of_nodes,
      });
    });
  }

  componentDidUpdate() {
    // this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  // 'Add Device', 'Delete Multiple Devices' and 'Import' functionalities
  onTableAction = (action) => {
    if (action === 'addDevice') {
      this.setState({
        currentSection: 'addDevice',
      });
    } else if (action === 'deleteDevices') {
      if(this.state.selectedItems.length > 0) {
        this.setState({
          showDeleteConfirmationForSelectedDevices: true,
          deleteConfirmationMessage: `Are you sure you'd want to delete selected devices?`
        });
      } else {
        notify.info('Select one or more devices to delete!');
      }
    } else if (action === 'importDevices') {
      this.setState({ showImportDevices: true });
    }
    // else if (action === 'collectConfig') {
    //   const requestBody = {
    //     configuration_collector_message: 'Daily commit message',
    //   };
    //   apiProvider
    //     .post('dcm/device/40/collection/snapshot/', requestBody)
    //     .then((response) => {
    //       console.log(response);
    //     });
    // }
  };

  // When user clicks on delete, edit or view in table row
  onRowAction = (action, id, deviceNameForDelete) => {
    if(action === 'delete') {
      this.setState({
        deviceIdForRowActions: id,
        showDeleteConfirmationForSingleDevice: true,
        deleteConfirmationMessage: `Are you sure you'd want to delete ` + deviceNameForDelete + '?'
      });
    } else if(action === 'view') {
      this.setState({ deviceIdForRowActions: id, currentSection: 'viewSnapshots' });
    } else if(action === 'edit') {
      window.location.href = 'vienna#/deviceConfiguration/devices/device/' + id;
    }
  }

  // when user clicks on Cancel during confirmation
  cancelDeleteOperation = () => {
    this.setState({
      showDeleteConfirmationForSingleDevice: false,
      showDeleteConfirmationForSelectedDevices: false,
      deviceIdForRowActions: ''
    });
  }

  // When user clicks on delete during confirmation for a single device
  deleteSingleDevice = () => {
    apiProvider.remove('dcm/device/' + this.state.deviceIdForRowActions + '/', '')
      .then((response) => {
        if(response.status === 200) {
          notify.info('Device deleted successfully');
          this.updateDevicesAfterDeletion();
        } else {
          notify.error(`${response.response.data['error-string']}`);
        }
      });
  }

  // // When user clicks on delete during confirmation for selected devices
  deleteSelectedDevices = () => {
    const deletePromise = this.state.selectedItems.map((item) =>
      apiProvider.remove('dcm/device/' + item + '/', '')
    );
    Promise.all(deletePromise).then((response) =>{
      if(response[response.length - 1].status === 200) {
        notify.info('Successfully deleted selected devices');
        this.updateDevicesAfterDeletion();
      } else {
        notify.error(`${response.response.data['error-string']}`);
      }
    });
  }

  // to get updated list of devices after deletion
  updateDevicesAfterDeletion = () => {
    const postBody = {
      scroll_id: 0,
      size: 10,
      sort_string: '',
      search_string: '',
      filter: this.state.filterObject,
    };
    apiProvider.post('/dcm/device/', postBody).then((data) => {
      const postBodyForSummary = {
        fields: [
          'device_family_name',
          'collect_schedule_status',
          'device_name',
          'device_address',
        ],
      };
      // get updated details for summary component
      apiProvider
        .post('/dcm/device/unique/', postBodyForSummary)
        .then((deviceDetailsSummary) => {
          this.setState(
            {
              deviceDetailsSummary: deviceDetailsSummary,
              deviceListing: data.device_list,
              totalNumberOfDevices: data.no_of_nodes,
              selectedItems: [],
              deviceIdForRowActions: '',
              currentPage: 1,
              showDeleteConfirmationForSingleDevice: false,
              showDeleteConfirmationForSelectedDevices: false
            }, () => {
              $('.single-check').each(function () {
                this.checked = false;
              });
            }
          );
        });
    });
  }

  // to select all devices when user clicks on the checkbox in table header.
  selectAll = (e) => {
    if (e.target.checked) {
      $('.single-check').each(function () {
        this.checked = true;
      });
      const updatedItems = this.state.deviceListing.map((item) => item.id);
      this.setState({ selectedItems: updatedItems });
    } else {
      // de-select all the devices in the list
      $('.single-check').each(function () {
        this.checked = false;
      });
      const newState = { ...this.state, selectedItems: [] };
      this.setState(newState);
    }
  };

  // to select a device when user clicks on the checkbox in the table row
  selectSingleDevice = (e, id) => {
    if (e.target.checked) {
      const selectedItems = produce(this.state.selectedItems, (draft) => {
        draft.push(id);
      });
      this.setState({ selectedItems }, () => {
        // if all the devices in the list are selected one after the other,
        // select the multi-select checkbox in the table header
        if (
          this.state.selectedItems.length === this.state.deviceListing.length
        ) {
          $('.multi-check').each(function () {
            this.checked = true;
          });
        }
      });
    } else {
      // de-select the multi-select checkbox in the table header
      $('.multi-check').each(function () {
        this.checked = false;
      });
      // remove the unselected item from the selectedItems array
      const updatedItems = this.state.selectedItems.filter(
        (item) => item !== id
      );
      this.setState({ ...this.state, selectedItems: updatedItems });
    }
  };

  // sort the table when user clicks on the sort icon in the table header of relevant column
  sortTable = (param) => {
    const sortSelected = {
      sort_column: param,
      sort_method: 'asc',
    };
    // check if the table is already sorted
    if (Object.keys(this.state.sort_string).length > 0) {
      // if true, check if it is sorted on the clicked column
      if (this.state.sort_string.sort_column === param) {
        // if true, check if it's ascending and if true, sort it on descending now
        if (this.state.sort_string.sort_method === 'asc') {
          sortSelected.sort_method = 'des';
        }
      }
    }
    // if the table is not sorted or sorted on descending order of the selected column,
    // sort it in the ascending order of selected column.
    this.setState({ sort_string: sortSelected });
    // along with sorting, check if there is a search string
    const searchString = $('.search-input').val();
    const postBody = {
      scroll_id: 0,
      size: 10,
      sort_string: sortSelected,
      search_string: searchString,
      filter: this.state.filterObject,
    };
    // API call to fetch devices in sorted order
    apiProvider.post('/dcm/device/', postBody).then((data) => {
      this.setState(
        {
          deviceListing: data.device_list,
          currentPage: 1,
          totalNumberOfDevices: data.no_of_nodes,
        },
        () =>
          notify.info(
            `Devices sorted in ${
              sortSelected.sort_method === 'asc' ? 'ascending' : 'descending'
            } order based on ${sortSelected.sort_column}`
          )
      );
    });
  };

  // called when user interacts with pagination component
  // currentPage is the page that the user wants to navigate to
  handlePageChange = (currentPage) => {
    const searchString = $('.search-input').val();
    const postBody = {
      scroll_id: (currentPage - 1) * 10,
      size: 10,
      sort_string: this.state.sort_string,
      search_string: searchString,
      filter: this.state.filterObject,
    };
    // fetch the devices for the currentPage
    apiProvider.post('/dcm/device/', postBody).then((data) => {
      this.setState({
        deviceListing: data.device_list,
        totalNumberOfDevices: data.no_of_nodes,
        currentPage: currentPage,
      });
    });
  };

  // when user starts typing in search-box
  searchDevices = (e) => {
    const searchString = e.target.value;
    if (searchString !== '') {
      const postBody = {
        scroll_id: 0,
        size: 10,
        sort_string: this.state.sort_string,
        search_string: searchString,
        filter: this.state.filterObject,
      };
      apiProvider.post('/dcm/device/', postBody).then((data) => {
        this.setState({
          deviceListing: data.device_list,
          totalNumberOfDevices: data.no_of_nodes,
          currentPage: 1,
          search_String: searchString
        });
      });
    } else {
      // if search box is empty i.e. when user clears the search-box,
      // fetch the default list of devices.
      const postBody = {
        scroll_id: 0,
        size: 10,
        sort_string: '',
        search_string: '',
        filter: this.state.filterObject,
      };
      apiProvider.post('/dcm/device/', postBody).then((data) => {
        this.setState({
          deviceListing: data.device_list,
          totalNumberOfDevices: data.no_of_nodes,
        });
      });
    }
  };

  handleFilter = (filterValue, filterField) => {
    let updatedfilterObject = this.state.filterObject;
    // Check if filter with 'filterField' exists in filterObject and filterValue received is not empty.
    // If filterValue is empty then the 'cancel' filter button is clicked.
    if (_.has(this.state.filterObject, filterField) && filterValue !== '') {
      // Check if filtered value exists in the array of filters
      const filterValueIndex =
        this.state.filterObject[filterField].indexOf(filterValue);
      // If filterValue exists remove it as user is clicking on the same widget
      // for the second time.
      if (filterValueIndex > -1) {
        updatedfilterObject = produce(this.state.filterObject, (draft) => {
          draft[filterField].splice(filterValueIndex, 1);
          //Delete property if there are no filters to be applied on this property
          if (draft[filterField].length === 0) delete draft[filterField];
        });
        // If filterValue does not exist, add it as user is clicking on the same widget
        // for the first time.
      } else {
        updatedfilterObject = produce(this.state.filterObject, (draft) => {
          draft[filterField].push(filterValue);
        });
      }
    }
    // If 'filterField' does not exist in filterObject, add it and update the
    // filterValue in its array.
    else if (filterValue !== '') {
      updatedfilterObject = produce(this.state.filterObject, (draft) => {
        draft[filterField] = [filterValue];
      });
    }
    const postBody = {
      scroll_id: 0,
      size: 10,
      sort_string: this.state.sort_string,
      search_string: this.state.searchString,
      filter: updatedfilterObject,
    };
    apiProvider.post('/dcm/device/', postBody).then((data) => {
      this.setState({
        deviceListing: data.device_list,
        totalNumberOfDevices: data.no_of_nodes,
        filterObject: updatedfilterObject
      });
    });
  };

  clearAllFilter = () => {
    const postBody = {
      scroll_id: 0,
      size: 10,
      sort_string: '',
      search_string: '',
      filter: {},
    };
    // to get the default list of devices
    apiProvider.post('/dcm/device/', postBody).then((data) => {
      this.setState(
        {
          deviceListing: data.device_list,
          totalNumberOfDevices: data.no_of_nodes,
          filterObject: {},
          currentPage: 1,
        },
        () => notify.info('All filters cleared')
      );
    });
  };

  // passed to the children components to get back to Device Listing screen
  // For eg. to get back to device listing screen after adding a new device
  // in Add Device section
  displayDeviceListingPage = () => {
    const postBody = {
      scroll_id: 0,
      size: 10,
      sort_string: {},
      search_string: '',
      filter: {},
    };
    // to get the updated list of devices
    apiProvider.post('/dcm/device/', postBody).then((response) => {
      const postBodyForSummary = {
        fields: [
          'device_family_name',
          'collect_schedule_status',
          'device_name',
          'device_address',
        ],
      };
      apiProvider
        .post('/dcm/device/unique/', postBodyForSummary)
        .then((data) => {
          this.setState({
            deviceDetailsSummary: data,
            deviceListing: response.device_list,
            totalNumberOfDevices: response.no_of_nodes,
            currentPage: 1,
            currentSection: 'deviceListing',
            selectedItems: []
          });
        });
    });
  };

  // when user clicks on Cancel button during Import operation
  cancelImport = () => {
    this.setState({ showImportDevices: false });
  }

  render() {
    return (
      <div className="dcm-devices">
        {this.state.currentSection === 'deviceListing' && (
          <div className="dcm-device-listing">

            <h4>Device Listing</h4>

            <div className="dcm-device-actions">
              <input
                value={this.state.searchString}
                onChange={(e) => this.searchDevices(e)}
                type="text"
                placeholder="Search"
                className="search-input"
              />
              <VunetButton
                className="table-action-secondary addDevice"
                text="Add"
                id="addDevice"
                onClick={() => this.onTableAction('addDevice')}
              />
              <VunetButton
                className="table-action-secondary"
                text="Delete"
                id="deleteDevice"
                onClick={() => this.onTableAction('deleteDevices')}
              />
              <VunetButton
                className="table-action-secondary"
                text="Import"
                id="importDevices"
                onClick={() => this.setState({ showImportDevices: true })}
              />
              {/* <VunetButton
                className="table-action-secondary"
                text="Collect Config"
                id="collectConfig"
                onClick={this.onTableAction}
              /> */}
            </div>

            <div className="filters">
              <FilterBar
                filterObject={this.state.filterObject}
                handleFilter={this.handleFilter}
                clearAllFilter={this.clearAllFilter}
              />
            </div>

            <div className="summary-and-devices">
              <div className="dcm-summary-container">
                <Summary
                  summaryDetails={this.state.deviceDetailsSummary}
                  handleFilter={this.handleFilter}
                  filterObject={this.state.filterObject}
                />
              </div>

              <div className="dcm-table-container">
                <table className="table dcm-devices-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          className="multi-check"
                          type="checkbox"
                          onChange={(e) => this.selectAll(e)}
                        />
                      </th>
                      <th>
                        {generateHeading('Device Name ')}
                        <i
                          className="fa fa-sort-amount-desc sort-icon"
                          onClick={() => this.sortTable('device_name')}
                        />
                      </th>
                      <th>
                        {generateHeading('Address ')}
                        <i
                          className="fa fa-sort-amount-desc sort-icon"
                          onClick={() => this.sortTable('device_address')}
                        />
                      </th>
                      <th>
                        {generateHeading('Device Family ')}
                        <i
                          className="fa fa-sort-amount-desc sort-icon"
                          onClick={() => this.sortTable('device_family_name')}
                        />
                      </th>
                      <th>
                        {generateHeading('Collect Schedule ')}
                        <i
                          className="fa fa-sort-amount-desc sort-icon"
                          onClick={() =>
                            this.sortTable('collect_schedule_status')
                          }
                        />
                      </th>
                      <th>{generateHeading('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.deviceListing.map((eachDevice) => (
                      <tr key={eachDevice.id}>
                        <td>
                          <input
                            className="single-check"
                            type="checkbox"
                            onChange={(e) =>
                              this.selectSingleDevice(e, eachDevice.id)
                            }
                          />
                        </td>
                        <td>{eachDevice.device_name}</td>
                        <td>{eachDevice.device_address}</td>
                        <td>{eachDevice.device_family_name}</td>
                        <td>{eachDevice.collect_schedule_status}</td>
                        <td className="dcm-table-actions">
                          <div className="row-actions-icon" data-tip={'Delete'}>
                            <ReactTooltip />
                            <i
                              className="fa fa-trash"
                              onClick={() =>
                                this.onRowAction('delete', eachDevice.id, eachDevice.device_name)
                              }
                            />
                          </div>
                          <div className="row-actions-icon" data-tip={'Edit'}>
                            <ReactTooltip />
                            <i
                              className="fa fa-pencil"
                              onClick={() =>
                                this.onRowAction('edit', eachDevice.id)
                              }
                            />
                          </div>
                          <div className="row-actions-icon" data-tip={'Snapshots'}>
                            <ReactTooltip />
                            <i
                              className="fa fa-eye"
                              onClick={() =>
                                this.onRowAction('view', eachDevice.id)
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

            <div className="pagination">
              <Pagination
                hideDisabled
                activePage={this.state.currentPage}
                itemsCountPerPage={10}
                totalItemsCount={this.state.totalNumberOfDevices}
                onChange={this.handlePageChange}
              />
            </div>
          </div>
        )}
        {/* when user clicks on Add Device */}
        {this.state.currentSection === 'addDevice' && (
          <AddOrEditDevice
            action="addDevice"
            displayDeviceListingPage={this.displayDeviceListingPage}
          />
        )}
        {/* when user views a device */}
        {this.state.currentSection === 'viewSnapshots' && (
          <AddOrEditDevice
            action="viewSnapshots"
            displayDeviceListingPage={this.displayDeviceListingPage}
            deviceId={this.state.deviceIdForRowActions}
          />
        )}
        {/* when user clicks on Import button */}
        {this.state.showImportDevices && (
          <ImportDevices
            cancelImport={this.cancelImport}
            importDevices={this.importDevices}
            displayDeviceListingPage={this.displayDeviceListingPage}
          />
        )}
        {/* show confirmation message for deleting a single device*/}
        {this.state.showDeleteConfirmationForSingleDevice &&
          <DeleteConfirmationModal
            confirmationMessage={this.state.deleteConfirmationMessage}
            cancelDeleteOperation={this.cancelDeleteOperation}
            deleteDevice={this.deleteSingleDevice}
          />
        }
        {/* show confirmation message for deleting selected devices*/}
        {this.state.showDeleteConfirmationForSelectedDevices &&
          <DeleteConfirmationModal
            confirmationMessage={this.state.deleteConfirmationMessage}
            cancelDeleteOperation={this.cancelDeleteOperation}
            deleteDevice={this.deleteSelectedDevices}
          />
        }
      </div>
    );
  }
}
