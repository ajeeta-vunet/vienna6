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
import './SingleAssetDetails.less';
import ReactTooltip from 'react-tooltip';
import { generateClassname, generateHeading } from '../../../event/utils/vunet_format_name';

export class SingleAssetDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  //this method is used to display the data passed to it in a table format.
  //this method takes either an array or an object as parameter and returns the
  //necessary JSX for it.
  renderTable(data) {
    //check whether received data is in array form.
    if(Array.isArray(data)) {
      //check if it is an array of objects.if so the use the kay value pair of nested object to
      //return JSX accordingly.
      if(data && data.length > 0 && typeof data[0] === 'object') {
        return (
          <div>
            <div className="row object-data-table-header">
              {Object.keys(data[0]).map((key) => {
                return(
                  <div className="col-md-4">
                    <span className="metric-details-header">{generateHeading(key)}</span>
                  </div>
                );
              })}
            </div>
            {data.map((item, index) => (
              <div className="row object-data-table-row" key={index}>
                {Object.values(item).map((val) => {
                  return (
                    <div key={val + index} className="col-md-4 metrics-details-value">
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      }
      //if the data received in a normal array then map over it and return the
      //JSX accordingly.
      else {
        return (
          data.map((item, index) => {
            return(
              <div key={index} className="row object-data-table-row">
                <div className="col-md-2">{item}</div>
              </div>
            );
          })
        );
      }
    }
    //if received data is just an object the use the key-value pair to
    //return the JSX in table format accordingly.
    else {
      return (
        <table>
          {Object.entries(data).map(([key, value]) => {
            return (
              <tr style={{ width: '100%' }} key={key}>
                <th className="table-header">{`${key}: `}</th>
                <td className="table-value">{value}</td>
              </tr>
            );
          })}
        </table>
      );
    }
  }

  renderDetails = () => {
    return this.props.singleAssetDetails && Object.entries(this.props.singleAssetDetails).map(([key, value]) => {
      if(typeof value !== 'object') {
        return(
          <div
            key={generateClassname(key)}
            className={'detail ' + generateClassname(key)}
          >
            <label htmlFor={generateClassname(key)}>
              {generateHeading(key) + ': '}
            </label>
            <div
              className="detail-info"
            >
              {'' + value}
            </div>
            <br />
          </div>
        );
      }
    });
  }

  render() {

    return (
      <div className="single-asset-details-wrapper">
        <div className="top-bar">
          <div
            className="back-button"
            data-tip={'Go Back'}
          >
            <ReactTooltip />
            <i
              className="fa fa-arrow-circle-o-left fa-lg display-right-topologyID"
              onClick={() => this.props.goBackToDetails()}
              aria-hidden="true"
            />
          </div>
          <div className="asset-details-header">{`Device Name: ` + this.props.singleAssetDetails.device_name}</div>
        </div>
        <div className="details">
          {this.renderDetails()}
        </div>
        <div className="table-data">
          <div className="asset-table-row">
            {this.props.singleAssetDetails.interface_list && this.props.singleAssetDetails.interface_list.length ? (
              <div className="assets-interface-table">
                {this.renderTable(this.props.singleAssetDetails.interface_list)}
              </div>
            ) : (
              <div className="assets-interface-table">
                <div className="row object-data-table-header">
                  <div className="col-md-4">
                    <span className="interface-details">Interface Data</span>
                  </div>
                </div>
                <div className="assets-no-data">
                  No Interfaces data.
                </div>
              </div>
            )}
            {this.props.singleAssetDetails.enriched_data && Object.keys(this.props.singleAssetDetails.enriched_data).length > 0 ? (
              <div className="assets-enriched-table">
                <div className="row assets-enriched-table-header">
                  <div className="col-md-4">
                    <span className="enrich-details">Enriched Data</span>
                  </div>
                </div>
                {this.renderTable(this.props.singleAssetDetails.enriched_data)}
              </div>
            ) : (
              <div className="assets-enriched-table">
                <div className="row assets-enriched-table-header">
                  <div className="col-md-4">
                    <span className="enrich-details">Enriched Data</span>
                  </div>
                </div>
                <div className="assets-no-data">
                  No Enriched data.
                </div>
              </div>
            )}
          </div>
          <div className="asset-table-row">
            {this.props.singleAssetDetails.ip_address && this.props.singleAssetDetails.ip_address.length ? (
              <div className="assets-ipAddress-table">
                <div className="row assets-ipAddress-table-header">
                  <div className="col-md-4">
                    <span className="ipAddress-details">IP Addresses</span>
                  </div>
                </div>
                {this.renderTable(this.props.singleAssetDetails.ip_address)}
              </div>
            ) : (
              <div className="assets-ipAddress-table">
                <div className="row assets-ipAddress-table-header">
                  <div className="col-md-4">
                    <span className="ipAddress-details">IP Addresses</span>
                  </div>
                </div>
                <div className="assets-no-data">
                  No IP address data.
                </div>
              </div>
            )}
            {this.props.singleAssetDetails.port_list && this.props.singleAssetDetails.port_list.length ? (
              <div className="assets-portList-table">
                <div className="row assets-portList-table-header">
                  <div className="col-md-4">
                    <span className="port-details">Port List</span>
                  </div>
                </div>
                {this.renderTable(this.props.singleAssetDetails.port_list)}
              </div>
            ) : (
              <div className="assets-portList-table">
                <div className="row assets-portList-table-header">
                  <div className="col-md-4">
                    <span className="port-details">Port List</span>
                  </div>
                </div>
                <div className="assets-no-data">
                  No Port List data.
                </div>
              </div>
            )}
          </div>
          <div className="asset-table-row">
            {this.props.singleAssetDetails.tags && this.props.singleAssetDetails.tags.length ? (
              <div className="assets-tags-table">
                <div className="row assets-tags-table-header">
                  <div className="col-md-4">
                    <span className="tags-details">Tags</span>
                  </div>
                </div>
                {this.renderTable(this.props.singleAssetDetails.tags)}
              </div>
            ) : (
              <div className="assets-tags-table">
                <div className="row assets-tags-table-header">
                  <div className="col-md-4">
                    <span className="tags-details">Tags</span>
                  </div>
                </div>
                <div className="assets-no-data">
                  No Tags available.
                </div>
              </div>
            )}
            <div className="assets-tags-table"  />
          </div>
        </div>
      </div>
    );
  }
}