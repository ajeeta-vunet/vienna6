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
import './Snapshots.less';
import { VunetButton } from 'ui_framework/src/vunet_components/vunet_button/vunet_button';
import { generateHeading } from '../../../event/utils/vunet_format_name';
import $ from 'jquery';
import { produce } from 'immer';
import Pagination from 'react-js-pagination';
import { apiProvider } from 'ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { ViewSnapshot } from '../ViewSnapshot/ViewSnapshot';
import { CompareSnaps } from '../CompareSnaps/CompareSnaps';
import { Notifier } from 'ui/notify';
import ReactTooltip from 'react-tooltip';
import { VunetLoader } from 'ui_framework/src/vunet_components/VunetLoader/VunetLoader';

const notify = new Notifier({ location: 'Snapshots' });

export class Snapshots extends Component {
  state={
    currentSection: 'snapshots',
    snapshotId: '',
    snapList: [],
    search_string: '',
    sort_string: {},
    selectedItems: [],
    snapsToCompare: [],
    currentPage: 1,
    totalNumberOfDevices: 0,
    loading: true
  };

  componentDidMount() {
    const id = this.props.deviceId;
    const postBody = {
      scroll_id: 0,
      size: 10,
      sort_string: {
        sort_column: 'date',
        sort_method: 'des',
      },
      search_string: '',
      action: 'get_list'
    };
    const url = `dcm/device/${id}/collection/snapshot/`;
    // to get the default list of snapshots
    apiProvider.post(url, postBody).then((data) => {
      if(data.configurations.length > 0) {
        const snapList = data.configurations.map((snaps) => (
          snaps
        ));
        this.setState({
          snapList,
          totalNumberOfDevices: data.no_of_nodes,
          loading: false
        });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  componentDidUpdate() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  searchSnaps = (e) => {
    const search = e.target.value;
    const id = this.props.deviceId;
    const url = `dcm/device/${id}/collection/snapshot/`;
    this.setState({ search_string: search });
    if (search !== '') {
      const postBody = {
        scroll_id: 0,
        size: 10,
        sort_string: this.state.sort_string,
        search_string: search,
        action: 'get_list'
      };
      apiProvider.post(url, postBody).then((data) => {
        if(data.configurations.length > 0) {
          const snapList = data.configurations.map((snaps) => (
            snaps
          ));
          this.setState({
            snapList,
            totalNumberOfDevices: data.no_of_nodes,
            currentPage: 1
          });
        } else{
          this.setState({ snapList: [], totalNumberOfDevices: 0, currentPage: 1 });
        }
      });
    } else {
      // if search box is empty i.e. when user clears the search-box,
      // fetch the default list of snapshots.
      const postBody = {
        scroll_id: 0,
        size: 10,
        sort_string: '',
        search_string: ''
      };
      apiProvider.post(url, postBody).then((data) => {
        if(data.configurations.length > 0) {
          const snapList = data.configurations.map((snaps) => (
            snaps
          ));
          this.setState({
            snapList,
            totalNumberOfDevices: data.no_of_nodes,
          });
        }
      });
    }
  }

  selectSingleDevice = (e, snap) => {
    // if the snap is checked, add it to the selected items
    if (e.target.checked) {
      const selectedItems = produce(this.state.selectedItems, (draft) => {
        draft.push(snap);
      });
      this.setState({ selectedItems }, () => {
        // if all the snaps are selected one after the other, select the
        // select-all checkbox in the table header.
        if (
          this.state.selectedItems.length === this.state.snapList.length
        ) {
          $('.multi-check').each(function () {
            this.checked = true;
          });
        }
      });
    } else {
      // if the snap is unchecked, remove it from selected items
      // as well as uncheck select-all checkbox in the table header.
      $('.multi-check').each(function () {
        this.checked = false;
      });
      const updatedItems = this.state.selectedItems.filter(
        (item) => item !== snap
      );
      this.setState({ ...this.state, selectedItems: updatedItems });
    }
  };

  selectAll = (e) => {
    // if checked, select all the individual checkboxes
    // and push all the snaps to selectedItems
    if (e.target.checked) {
      $('.single-check').each(function () {
        this.checked = true;
      });
      const updatedItems = this.state.snapList.map((snap) => snap);
      this.setState({ selectedItems: updatedItems });
    } else {
      // if unchecked, make all individual checkboxes unchecked
      // and empty the selectedItems array.
      $('.single-check').each(function () {
        this.checked = false;
      });
      const newState = { ...this.state, selectedItems: [] };
      this.setState(newState);
    }
  };

  onTableAction = (e) => {
    const snap = e.target.id;
    if(snap.startsWith('view')) {
      this.setState({ snapshotId: snap.substring(4) }, () =>
        this.setState({ currentSection: 'viewSnapshot' }));
    } else if(snap === 'compare') {
      this.setState({ currentSection: 'compareSnapshots' });
    }
    // else if(snap.startsWith('delete')) {
    //   console.log('Delete Snap', snap.substring(6));
    // }
  }

  // select snaps to compare
  compareSnaps = (snap) => {
    const selectedSnap = snap;
    if(this.state.snapsToCompare.length === 2) {
      // left shift elements in snapsToCompare by 1 and add the selected snap in the end
      const updatedCompareSnaps = [this.state.snapsToCompare[1], selectedSnap];
      this.setState({ snapsToCompare: updatedCompareSnaps });
    } else {
      // add the selected snap in the end
      const updatedCompareSnaps = [...this.state.snapsToCompare, selectedSnap];
      this.setState({ snapsToCompare: updatedCompareSnaps });
    }
  }

  // called when user interacts with the pagination component.
  handlePageChange = (currentPage) => {
    const id = this.props.deviceId;
    const url = `dcm/device/${id}/collection/snapshot/`;
    const searchString = $('.search-input').val();
    const postBody = {
      scroll_id: (currentPage - 1) * 10,
      size: 10,
      sort_string: this.state.sort_string,
      search_string: searchString,
      action: 'get_list'
    };
    // fetch the snapshots for the currentPage
    apiProvider.post(url, postBody).then((data) => {
      const snapList = data.configurations.map((snaps) => (
        snaps
      ));
      this.setState({
        snapList,
        totalNumberOfDevices: data.no_of_nodes,
        currentPage: currentPage,
      });
    });
  };

  // passed as props to children components to navigate back to snapshot listing.
  snapshotListing = () => {
    this.setState({ currentSection: 'snapshots' });
  }

  // to sort the snapshots when the user clicks on sort icon in the table header
  sortSnaps = (param) => {
    const sortSelected = {
      sort_column: param,
      sort_method: 'asc',
    };
    // check if the table is already sorted
    if (Object.keys(this.state.sort_string).length > 0) {
      // if true, check if it is sorted on the clicked column
      if (this.state.sort_string.sort_column === param) {
        // if true, check if it's ascending and if true, sort it on descending
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
      action: 'get_list'
    };
    const id = this.props.deviceId;
    const url = `dcm/device/${id}/collection/snapshot/`;
    // API call to fetch devices in sorted order
    apiProvider.post(url, postBody).then((data) => {
      const snapList = data.configurations.map((snaps) => (
        snaps
      ));
      this.setState({
        snapList,
        totalNumberOfDevices: data.no_of_nodes,
      }, () => notify.info(`Successfully sorted in ${sortSelected.sort_method} order of date`));
    });
  }

  previousSection = () => {
    this.props.navigateToPrevious('configManagement');
  }

  nextSection = () => {
    this.props.navigateToNext();
  }

  render() {
    return(
      <div className="dcm-snapshots-wrapper">
        {
          this.state.currentSection === 'snapshots' && !this.state.loading &&
          <div className="snapshots">
            <div className="snap-actions">
              <input
                className="search-input"
                value={this.state.searchString}
                onChange={(e) => this.searchSnaps(e)}
                type="text"
                placeholder="Search"
              />
            </div>
            {/* shown when user selects snaps to compare */}
            <div className="compare-snaps-wrapper">
              {
                this.state.snapsToCompare.length > 0 &&
              this.state.snapsToCompare.map((snap, index) => (
                <div key={index} className="compare-snaps">
                  {snap.date}
                </div>
              ))
              }
              {
                this.state.snapsToCompare.length > 0 &&
                <VunetButton
                  id="compare"
                  onClick={this.onTableAction}
                  data-text="Compare"
                  disabled={this.state.snapsToCompare.length !== 2}
                  className="table-action-secondary compare"
                />
              }
            </div>
            { this.state.currentSection === 'snapshots' &&
              this.state.snapList.length > 0 && (
                <table className="table tbl">
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
                        {generateHeading('Name ')}
                        <i
                          className="fa fa-sort-amount-desc sort-icon"
                          onClick={() => this.sortSnaps('date')}
                        />
                      </th>
                      <th>
                        {generateHeading('Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.loading && <VunetLoader />}
                    {this.state.snapList.map((snap) => (
                      <tr key={snap.id}>
                        <td>
                          <input
                            className="single-check"
                            type="checkbox"
                            onChange={(e) =>
                              this.selectSingleDevice(e, snap)
                            }
                          />
                        </td>
                        <td>
                          {snap.date}
                        </td>
                        <td className="snap-table-actions">
                          <div className="icons" data-tip={'Snapshot Details'}>
                            <ReactTooltip />
                            <i
                              id={`view${snap.id}`}
                              className="fa fa-eye"
                              onClick={this.onTableAction}
                            />
                          </div>
                          <div className="icons" data-tip={'Compare'}>
                            <ReactTooltip />
                            <i
                              id={`compare${snap}`}
                              className="fa fa-align-left"
                              onClick={() => this.compareSnaps(snap)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
        }
        { this.state.currentSection === 'snapshots' &&
          this.state.loading === false &&
          this.state.snapList.length === 0 && (
            <div className="empty-snaps">
              No snapshots to display!
            </div>
          )
        }
        {/* when the user views a single snapshot, show ViewSnapshot component */}
        {
          this.state.currentSection === 'viewSnapshot' &&
          <ViewSnapshot
            snapshotListing={this.snapshotListing}
            deviceId={this.props.deviceId}
            snapshotId={this.state.snapshotId}
          />
        }
        {/* when the user compares 2 snapshots, render CompareSnaps component */}
        {
          this.state.currentSection === 'compareSnapshots' &&
          <CompareSnaps
            snapshotListing={this.snapshotListing}
            deviceId={this.props.deviceId}
            snapshots={this.state.snapsToCompare}
          />
        }
        <VunetButton
          id="backBtn"
          className="secondary"
          data-text="Back"
          onClick={this.previousSection}
        />
        <VunetButton
          id="nextBtn"
          className="primary snapshots-cancel"
          data-text="Cancel"
          onClick={this.nextSection}
        />
      </div>
    );
  }
}