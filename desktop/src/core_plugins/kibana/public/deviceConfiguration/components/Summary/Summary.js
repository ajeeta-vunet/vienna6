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
import { generateHeading } from '../../../event/utils/vunet_format_name';
import { produce } from 'immer';
import './Summary.less';

export class Summary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      moreDetailsFlags: {
        device_name: false,
        device_address: false,
        device_family_name: false,
        collect_schedule_status: false,
      },
    };
  }

  // when user clicks on the arrow next to each filter to reveal/close the sub-filters
  handleMoreDetails = (key) => {
    const moreDetailsFlags = produce(this.state.moreDetailsFlags, (draft) => {
      draft[key] = !draft[key];
    });
    this.setState({ moreDetailsFlags: moreDetailsFlags });
  };

  render() {
    // details of the expanded filter when the user clicks on the downward facing arrow
    const renderDetails = (key) => {
      if (
        Object.keys(
          this.props.summaryDetails.individual_unique_count_per_field[key]
        ).length > 0
      ) {
        return (
          this.props.summaryDetails.individual_unique_count_per_field &&
          Object.entries(
            this.props.summaryDetails.individual_unique_count_per_field[key]
          ).map(([key1, value]) => {
            return (
              <div className="row-item-div" key={key1}>
                <input
                  className="row-item-checkbox"
                  type="checkbox"
                  key={key1}
                  name={key1}
                  value={key1}
                  onClick={() => this.props.handleFilter(key1, key)}
                  checked={
                    this.props.filterObject[key] &&
                    this.props.filterObject[key].indexOf(key1) > -1
                      ? true
                      : false
                  }
                />
                &nbsp;&nbsp;
                <label>{key1 + ' (' + value + ')'}</label>
              </div>
            );
          })
        );
      } else {
        return <div className="row-item">No details on this type.</div>;
      }
    };
    const renderHeading = Object.keys(
      this.props.summaryDetails.individual_unique_count_per_field
    ).map((key) => {
      return (
        <div className="summary-detail" key={key}>
          <div className="heading-row">
            <div className="heading-title">
              {generateHeading(key)}&nbsp;&nbsp;
            </div>
            <div className="countAndMore">
              <div className="count">
                {' (' +
                  this.props.summaryDetails.total_count_per_field[key] +
                  ') '}
                &nbsp;
              </div>
              <div
                className="more-details"
                onClick={() => this.handleMoreDetails(key)}
              >
                <i
                  className={
                    'fa fa-lg ' +
                    (this.state.moreDetailsFlags[key]
                      ? 'fa-angle-up'
                      : 'fa-angle-down')
                  }
                />
              </div>
            </div>
          </div>
          {this.state.moreDetailsFlags[key] && (
            <div className={'more-details-rows ' + key}>
              {renderDetails(key)}
            </div>
          )}
        </div>
      );
    });
    return (
      <div className="dcm-summary-wrapper">
        {this.props.topologyName && (
          <div className="heading-row">
            <div className="heading-title topology-name">
              {this.props.topologyName +
                ' (' +
                this.props.summaryDetails.total_nodes +
                ')'}
            </div>
          </div>
        )}
        {renderHeading}
      </div>
    );
  }
}
