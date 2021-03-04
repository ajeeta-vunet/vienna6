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
import { Summary } from '../../../assetsPage/components/summary/summary';
import { searchNodeDetails, fetchNodesList } from '../../api_calls';
import ReactTooltip from 'react-tooltip';

const mapStateToProps = state => {
  return {
    viewDetails: state.topologyData.viewDetails,
  };
};

const mapDispatchToProps = (dispatch) => ({
  swapViewDetails: () => {
    return dispatch(updateViewDetails());
  }
});

class NodeDetailsCmmponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //currentPage - used to store the active page number
      // currentPage: 1,
      viewDetails: this.props.viewDetails,
      totalNumberOfNodes: this.props.totalNumberOfNodes,
      currentPage: this.props.currentPage,
      nodeDetails: this.props.nodeDetails
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
      nodeDetails: newProps.nodeDetails
    });
  }
  componentWillUnmount() {
    if(this.props.viewDetails) {
      this.props.swapViewDetails();
    }
  }

  componentDidUpdate() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  renderTableHeader() {
    const header = [ 'system_ip', 'device_name', 'device_type', 'credential_name', 'cred_type', 'vendor_name' ];
    return header.map((key, index) => {
      return <th key={index}>{generateHeading(key)}</th>;
    });
  }

  renderTableData() {
    return this.state.nodeDetails && this.state.nodeDetails.map((node, index) => {
      const { system_ip, device_name, device_type, credential_name, cred_type, vendor_name } = node; //destructuring
      return (
        <tr key={'row-' + index}>
          <td>
            <div className="tableRowCell">
              {system_ip}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {device_name}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {device_type}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {credential_name}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {cred_type}
            </div>
          </td>
          <td>
            <div className="tableRowCell">
              {vendor_name}
            </div>
          </td>
        </tr>
      );
    });
  }

  onSearch = (e) => {
    if(e.target.value !== '') {
      const postBody = {
        scroll_id: 0,
        size: 10,
        search_string: e.target.value
      };
      const data = searchNodeDetails(this.props.nodeDetails[0].topology_id, postBody);
      data.then((details) => {
        this.setState({
          nodeDetails: details.nodes,
          totalNumberOfNodes: details.no_of_nodes,
          currentPage: 1
        });
      });
    }else {
      this.setState({
        nodeDetails: this.props.nodeDetails,
        totalNumberOfNodes: this.props.totalNumberOfNodes,
        currentPage: 1
      });
    }
  }

  handlePageChange = (currentPage) => {
    const searchString = $('.search-input').val();
    if(searchString !== '') {
      const postBody = {
        scroll_id: (currentPage - 1) * 10,
        size: 10,
        search_string: searchString
      };
      const data = searchNodeDetails(this.props.nodeDetails[0].topology_id, postBody);
      data.then((details) => {
        this.setState({
          nodeDetails: details.nodes,
          totalNumberOfNodes: details.no_of_nodes,
          currentPage: currentPage
        });
      });
    }else {
      fetchNodesList(this.state.nodeDetails[0].topology_id, (currentPage - 1) * 10, 10)
        .then(response => response.json())
        .then(data => {
          this.setState({
            nodeDetails: data.topology.nodes,
            currentPage: currentPage,
            totalNumberOfNodes: data.topology.no_of_nodes });
        });
    }
  }

  render() {

    return (
      <div className="nodeDetails">
        <div className="top-bar">
          <span data-tip={'Go Back to Topology'}>
            <ReactTooltip />
            <i
              className="fa fa-arrow-circle-o-left fa-lg display-right-topologyID"
              onClick={() => this.props.goBack()}
              aria-hidden="true"
            />
          </span>
          <span className="topologyID">Topology ID : {this.state.nodeDetails && this.state.nodeDetails[0].topology_id}</span>
        </div>
        <div className="nodeDetails-wrapper">
          <div className="assets-summary">
            <Summary
              summaryDetails={this.props.summaryDetails}
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
              <tbody>
                {this.renderTableData()}
              </tbody>
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
    );
  }
}

export const NodeDetails = connect(mapStateToProps, mapDispatchToProps) (NodeDetailsCmmponent);