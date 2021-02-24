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
      currentPage: this.props.currentPage
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
      currentPage: newProps.currentPage
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
    return this.props.nodeDetails && this.props.nodeDetails.map((node, index) => {
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

  render() {

    return (
      <div className="nodeDetails">
        <div className="top-bar">
          <i className="fa fa-arrow-left" onClick={() => this.props.goBack()} aria-hidden="true" />
          <span className="topologyID">Topology ID : {this.props.nodeDetails && this.props.nodeDetails[0].topology_id}</span>
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
                    className="search-input"
                    placeholder="Search"
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
                onChange={this.props.handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const NodeDetails = connect(mapStateToProps, mapDispatchToProps) (NodeDetailsCmmponent);