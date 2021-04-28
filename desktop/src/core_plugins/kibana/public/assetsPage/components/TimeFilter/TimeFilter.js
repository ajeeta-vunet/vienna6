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
import './TimeFilter.less';
import { generateHeading } from '../../../event/utils/vunet_format_name';

export class TimeFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeFilterOptions: this.props.timeFilters,
      moreDetailsFlag: false,
    };
  }

  //this function is called to display the options under Time Filters header.
  handleMoreDetails = () => {
    const moreDetailsFlag = this.state.moreDetailsFlag;
    this.setState({ moreDetailsFlag: !moreDetailsFlag });
  }

  //this function is called to render the options under the 'Time Filters' header.
  renderTimeFilterOptions = () => {
    return this.state.timeFilterOptions.map((timeFilter) => {
      return(
        <div className={'time-filter-option ' + timeFilter} key={timeFilter}>
          <button
            className="time-filter-button"
            onClick={() => this.props.displayTimeInputModal(timeFilter)}
          >
            {generateHeading(timeFilter)}
          </button>
        </div>
      );
    });
  }

  render() {
    return(
      <div className="time-filter-wrapper">
        <div className="heading-row">
          <div
            className="heading-title"
          >Time Filters
          </div>
          <div className="more-details-wrapper">
            <div
              className="more-details"
              onClick={() => this.handleMoreDetails()}
            >
              <i className={'fa fa-lg ' + (this.state.moreDetailsFlag ? 'fa-angle-up' : 'fa-angle-down')} />
            </div>
          </div>
        </div>
        {this.state.moreDetailsFlag &&
          <div className={'more-details-rows '}>
            {this.renderTimeFilterOptions()}
          </div>
        }
      </div>
    );
  }
}