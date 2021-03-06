/* eslint-disable camelcase */
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

import React from 'react';
// import PropTypes from 'prop-types';
import Pagination from 'react-js-pagination';
import $ from 'jquery';
import { connect } from 'react-redux';
import { updateViewDetails } from '../../actions/topologyActions';
import { generateHeading } from '../../../event/utils/vunet_format_name';
import './NodeDetails.less';
import { Summary } from '../../../assetsPage/components/Summary/Summary';
import ReactTooltip from 'react-tooltip';
import { FilterBar } from '../FilterBar/FilterBar';
import { produce } from 'immer';
import _ from 'lodash';
import { SingleAssetDetails } from '../../../assetsPage/components/SingleAssetDetails/SingleAssetDetails';
import { Notifier } from 'ui/notify';
import { apiProvider } from '../../../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider';
import { DiscoveryConstants } from '../../discovery_constants';

const notify = new Notifier({ location: 'Node Details' });

const mapStateToProps = (state) => {
  return {
    viewDetails: state.topologyData.viewDetails,
  };
};

const mapDispatchToProps = (dispatch) => ({
  swapViewDetails: () => {
    return dispatch(updateViewDetails());
  },
});

class NodeDetailsCmmponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewDetails: this.props.viewDetails,
      totalNumberOfNodes: this.props.totalNumberOfNodes,
      currentPage: this.props.currentPage,
      nodeDetails: this.props.nodeDetails,
      filterObject: {},
      singleAssetDetails: {},
      singleAssetDetailsFlag: false,
      sortField: '',
      sortOrder: '',
      searchString: '',
    };
  }

  componentDidMount() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      viewDetails: newProps.viewDetails,
      totalNumberOfNodes: newProps.totalNumberOfNodes,
      currentPage: newProps.currentPage,
      nodeDetails: newProps.nodeDetails,
    });
  }
  componentWillUnmount() {
    if (this.props.viewDetails) {
      this.props.swapViewDetails();
    }
  }

  componentDidUpdate() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  //this function is called to render the Node Details table header.
  renderTableHeader() {
    const header = [
      'system_ip',
      'device_name',
      'device_type',
      'credential_name',
      'credential_type',
      'vendor_name',
      'actions',
    ];
    return header.map((key, index) => {
      if (key === 'actions') {
        return (
          <th style={{ cursor: 'default' }} key={index}>
            {generateHeading(key)}
          </th>
        );
      } else {
        return (
          <th key={index} onClick={() => this.onSort(key)}>
            {generateHeading(key)}
            <i className="fa fa-sort-amount-desc sort-icon" />
          </th>
        );
      }
    });
  }

  //this function is called to render the Node Details table rows.
  renderTableData() {
    return (
      this.state.nodeDetails &&
      this.state.nodeDetails.map((node, index) => {
        const {
          node_id,
          system_ip,
          device_name,
          device_type,
          credential_name,
          cred_type,
          vendor_name,
        } = node; //destructuring
        return (
          <tr key={'row-' + index}>
            <td>
              <div className="tableRowCell">{system_ip}</div>
            </td>
            <td>
              <div className="tableRowCell">{device_name}</div>
            </td>
            <td>
              <div className="tableRowCell">{device_type}</div>
            </td>
            <td>
              <div className="tableRowCell">{credential_name}</div>
            </td>
            <td>
              <div className="tableRowCell">{cred_type}</div>
            </td>
            <td>
              <div className="tableRowCell">{vendor_name}</div>
            </td>
            <td>
              <button
                className="more-details-button"
                onClick={() => this.handleMoreDetails(node_id)}
                data-tip={'More Details'}
              >
                <ReactTooltip />
                <span className="fa fa-arrow-circle-right" />
              </button>
            </td>
          </tr>
        );
      })
    );
  }

  //when the action button to display more details of an asset is clicked this mehod is called.
  //this method receives the nodeId of asset cliked on, using this the asset Details of that nodeId is determined
  //and stored in singleAssetDetails state variable. We also set the singleAssetDetailsFlag to true to display
  //SingleAssetDetails component.
  handleMoreDetails = (nodeId) => {
    let singleAssetDetails;
    this.state.nodeDetails &&
      this.state.nodeDetails.map((node) => {
        if (node.node_id === nodeId) {
          singleAssetDetails = node;
        }
      });
    this.setState({ singleAssetDetails, singleAssetDetailsFlag: true });
  };

  //this method is called when the user types anything in the search bar abd triggers a search.
  onSearch = (e) => {
    const searchString = e.target.value;
    const postBody = {
      scroll_id: 0,
      size: 10,
      filter: this.state.filterObject,
      sort_string:
        this.state.sortOrder === 'Descending'
          ? '-' + this.state.sortField
          : this.state.sortField,
      search_string: searchString,
    };
    apiProvider
      .post(DiscoveryConstants.SEARCH_ASSETS + this.props.topologyId + '/', postBody)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          nodeDetails: data.topology.nodes,
          currentPage: 1,
          totalNumberOfNodes: data.topology.no_of_nodes,
          searchString: searchString,
        });
      });
  };

  //this method is called when the user interacts with the Pagination component.
  handlePageChange = (currentPage) => {
    const postBody = {
      scroll_id: (currentPage - 1) * 10,
      size: 10,
      filter: this.state.filterObject,
      sort_string:
        this.state.sortOrder === 'Descending'
          ? '-' + this.state.sortField
          : this.state.sortField,
      search_string: this.state.searchString,
    };
    apiProvider
      .post(DiscoveryConstants.FETCH_NODE_DETAILS + this.props.topologyId + '/', postBody)
      .then((data) => {
        this.setState({
          nodeDetails: data.topology.nodes,
          currentPage: currentPage,
          totalNumberOfNodes: data.topology.no_of_nodes,
        });
      });
  };

  // In this function we use the filterStore object and
  // update the data passed to 'FilterBar' and 'Summary'
  // components based on filters applied by the user. This function receives filterField and
  // filterValue. If the corresponding field and value is present in filterStore, it will be removed.
  // Else it will be added to filterStore.
  handleFilter = (filterValue, filterField) => {
    let updatedfilterObject = this.state.filterObject;
    // Check if filter with 'filterField' exists in filterObject and filterValue received is not empty.
    //If filterValue is empty then the 'cancel' filter button is clicked.
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
      // If 'filterField' does not exist in filterObject, add it and update the
      // filterValue in its array.
    } else if (filterValue !== '') {
      updatedfilterObject = produce(this.state.filterObject, (draft) => {
        draft[filterField] = [filterValue];
      });
    }
    this.setState({ filterObject: updatedfilterObject }, () => {
      this.applyFilters();
    });
  };

  //this method is called to make the API call with the filter object to fetch filtered list of objects.
  applyFilters = () => {
    const postBody = {
      scroll_id: 0,
      size: 10,
      filter: this.state.filterObject,
      sort_string:
        this.state.sortOrder === 'Descending'
          ? '-' + this.state.sortField
          : this.state.sortField,
      search_string: this.state.searchString,
    };
    apiProvider
      .post(DiscoveryConstants.FILTERED_NODE_DETAILS + this.props.topologyId + '/', postBody)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          nodeDetails: data.topology.nodes,
          currentPage: 1,
          totalNumberOfNodes: data.topology.no_of_nodes,
        });
      });
  };

  //this method is called to clear all filters
  //and fetch the list of nodes without any filters applied.
  clearAllFilter = () => {
    const postBody = {
      scroll_id: 0,
      size: 10,
      filter: {},
      sort_string: '',
      search_string: '',
    };
    apiProvider
      .post(DiscoveryConstants.FILTERED_NODE_DETAILS + this.props.topologyId + '/', postBody)
      .then((response) => response.json())
      .then((data) => {
        this.setState(
          {
            nodeDetails: data.topology.nodes,
            currentPage: 1,
            totalNumberOfNodes: data.topology.no_of_nodes,
            filterObject: {},
            searchString: '',
            sortField: '',
            sortOrder: '',
          },
          () => notify.info('All filters cleared.')
        );
      });
  };

  //this method is called to change the singleAssetDetailsFlag which controls the
  //display of Single Asset Details component.
  goBackToDetails = () => {
    this.setState({
      singleAssetDetailsFlag: !this.state.singleAssetDetailsFlag,
    });
  };

  //this method is called to sort the Node Details table based on the header fileds clicked on.
  onSort = (sortField) => {
    let sortOrder = 'Ascending';

    if (this.state.sortOrder === '' || this.state.sortOrder === 'Descending') {
      sortOrder = 'Ascending';
    } else if (sortField === this.state.sortField) {
      sortOrder = 'Descending';
    }

    const sortMessage = `Node Details sorted in ${sortOrder} order based on ${generateHeading(
      sortField
    )}`;

    //sorting is done in backend. We make an API call with sortField and get the list of assets sorted based
    //on that field.
    const postBody = {
      scroll_id: 0,
      size: 10,
      filter: this.state.filterObject,
      sort_string: sortOrder === 'Descending' ? '-' + sortField : sortField,
      search_string: this.state.searchString,
    };
    apiProvider
      .post(DiscoveryConstants.FILTERED_NODE_DETAILS + this.props.topologyId + '/', postBody)
      .then((data) => {
        this.setState(
          {
            nodeDetails: data.topology.nodes,
            currentPage: 1,
            totalNumberOfNodes: data.topology.no_of_nodes,
            sortField: sortField,
            sortOrder: sortOrder,
          },
          () => notify.info(sortMessage)
        );
      });
  };

  render() {
    return (
      <div className="nodeDetails">
        {!this.state.singleAssetDetailsFlag && (
          <div>
            <div className="top-bar">
              <span data-tip={'Go Back to Topology'}>
                <ReactTooltip />
                <i
                  className="fa fa-arrow-circle-o-left fa-lg display-right-topologyID"
                  onClick={() => this.props.goBack()}
                  aria-hidden="true"
                />
              </span>
            </div>
            <div className="filters">
              <FilterBar
                filterObject={this.state.filterObject}
                handleFilter={this.handleFilter}
                clearAllFilter={this.clearAllFilter}
              />
            </div>
            <div className="nodeDetails-wrapper">
              <div className="assets-summary">
                <Summary
                  summaryDetails={this.props.summaryDetails}
                  topologyName={this.props.topologyName}
                  handleFilter={this.handleFilter}
                  filterObject={this.state.filterObject}
                />
              </div>
              <div className="nodeDetails-table">
                <div className="table-toolbar">
                  <div className="toolbar-search">
                    <div className="toolbar-searchbox">
                      <div className="search-icon fa fa-search" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search"
                        onChange={(e) => this.onSearch(e)}
                      />
                    </div>
                  </div>
                </div>
                <table className="nodes">
                  <thead>
                    <tr>{this.renderTableHeader()}</tr>
                  </thead>
                  <tbody>{this.renderTableData()}</tbody>
                </table>
                <div className="pagination">
                  <Pagination
                    hideDisabled
                    activePage={this.state.currentPage}
                    itemsCountPerPage={10}
                    totalItemsCount={this.state.totalNumberOfNodes}
                    onChange={this.handlePageChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {this.state.singleAssetDetailsFlag && (
          <div className="single-asset-details">
            <SingleAssetDetails
              singleAssetDetails={this.state.singleAssetDetails}
              goBackToDetails={this.goBackToDetails}
              canEnrichAsset={false}
            />
          </div>
        )}
      </div>
    );
  }
}

export const NodeDetails = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeDetailsCmmponent);
