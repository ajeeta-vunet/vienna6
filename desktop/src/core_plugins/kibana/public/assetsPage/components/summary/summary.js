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
import { generateHeading } from '../../../event/utils/vunet_format_name';
import { produce } from 'immer';
import './summary.less';
// import _ from 'lodash';

export class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      moreDetailsFlags: {
        device_type: false,
        location: false,
        system_ip: false,
        vendor_name: false,
      }
    };
  }

  handleMoreDetails = (key) => {
    const moreDetailsFlags = produce(this.state.moreDetailsFlags, (draft) => {
      draft[key] = !draft[key];
    });
    this.setState({ moreDetailsFlags: moreDetailsFlags });
  }

  render() {

    const renderDetails = (key) => {
      if(Object.keys(this.props.summaryDetails.individual_unique_count_per_field[key]).length > 0) {
        return this.props.summaryDetails.individual_unique_count_per_field &&
        Object.entries(this.props.summaryDetails.individual_unique_count_per_field[key]).map(([key1, value]) => {
          return (
            <div
              className="row-item-div"
              key={key1}
            >
              <input
                className="row-item-checkbox"
                type="checkbox"
                key={key1}
                name={key1}
                value={key1}
                onClick={() => this.props.handleFilter(key1, key)}
                checked={this.props.filterObject[key] && this.props.filterObject[key].indexOf(key1) > -1 ? true : false}
              />
              <label>{key1 + ' (' + value + ')'}</label>
            </div>
          );
        });
      }else {
        return (<div className="row-item">No details on this type.</div>);
      }
    };
    const renderHeading = Object.keys(this.props.summaryDetails.individual_unique_count_per_field).map((key) => {
      return (
        <div className="summary-detail" key={key}>
          <div className="heading-row">
            <div
              className="heading-title"
            >{generateHeading(key === 'system_ip' ? 'system_IP' : key) + ' (' + this.props.summaryDetails.total_count_per_field[key] + ')'}
            </div>
            <div className="more-details">
              <div
                className="more-details"
                onClick={() => this.handleMoreDetails(key)}
              >
                <i className={'fa fa-lg ' + (this.state.moreDetailsFlags[key] ? 'fa-angle-up' : 'fa-angle-down')} />
              </div>
            </div>
          </div>
          {this.state.moreDetailsFlags[key] &&
            <div className={'more-details-rows ' + key}>
              {renderDetails(key)}
            </div>
          }
        </div>
      );
    });
    return(
      <div className="summary-wrapper">
        {this.props.topologyName &&
          <div className="heading-row">
            <div
              className="heading-title topology-name"
            >{this.props.topologyName + ' (' + this.props.summaryDetails.total_nodes + ')'}
            </div>
          </div>
        }
        {renderHeading}
      </div>
    );
  }
}