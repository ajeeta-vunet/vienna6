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
import './FilterBar.less';

export class FilterBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  //this method will be called to display the applied filters,
  //which is present in the filterObject passed as props to the component.
  renderAppliedFilters = () => {
    return (
      this.props.filterObject &&
      Object.keys(this.props.filterObject).map((key) => {
        return this.props.filterObject[key].map((value) => {
          return (
            <div className="individual-filter">
              {value}
              <div
                className="cancel-filter"
                onClick={() => this.props.handleFilter(value, key)}
              >
                <i className="fa fa-times-circle" aria-hidden="true" />
              </div>
            </div>
          );
        });
      })
    );
  };

  render() {
    return (
      <div className="filters-bar">
        <div className="filter-title">
          <img
            className="filter-funnel"
            src="/ui/vienna_images/filter-funnel-icon.svg"
          />
        </div>
        <div className="filter-applied">{this.renderAppliedFilters()}</div>
        <div
          className="clear-filters"
          onClick={() => this.props.clearAllFilter()}
        >
          Clear All
        </div>
      </div>
    );
  }
}
