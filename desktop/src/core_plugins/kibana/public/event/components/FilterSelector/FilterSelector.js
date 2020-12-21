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

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import './FilterSelector.less';
import $ from 'jquery';

export class FilterSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterFields: this.props.filterFields,
      filterFieldKeys: this.props.filterFields && Object.keys(this.props.filterFields)
    };

    this.handleSearch = this.handleSearch.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      filterFields: newProps.filterFields,
      filterFieldKeys: newProps.filterFields && Object.keys(newProps.filterFields)
    });
  }

  //this function handles the search functionality (by altering the display attribute)
  handleSearch(event) {
    if (event.target.value !== null) {
      const searchTerm = event.target.value.toLowerCase().trim();

      const filterFieldKeys = this.state.filterFieldKeys;
      filterFieldKeys.map((field) => {
        if (field.toLowerCase().includes(searchTerm)) {
          $(`.field.${field}`).css('display', 'block');
        } else {
          $(`.field.${field}`).css('display', 'none');
        }
      });
    }
  }

  render() {
    return (
      <div className="filter-selector-wrapper" id="filter-selector-wrapper">
        <div className="filter-selector-search">
          <input
            placeholder="Search"
            type="text"
            onChange={(event) => this.handleSearch(event)}
          />
        </div>
        <div className="filter-selector-body">
          <div className="filter-selector">
            <div className="filter-selector-checkbox-wrapper">
              {this.state.filterFieldKeys && this.state.filterFieldKeys.map((field, index) => {
                return (
                  <div className={`field ${'filter-' + field}`} key={field + index}>
                    <input
                      type="checkbox"
                      id={'filter-' + field}
                      name={field}
                      checked={this.props.selectedFilterFields.includes(field)}
                      onChange={() =>
                        this.props.handleFilterSelectorChange(field)
                      }
                    />
                    <label htmlFor={field}>{field.replace(/_/g, ' ')}</label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
