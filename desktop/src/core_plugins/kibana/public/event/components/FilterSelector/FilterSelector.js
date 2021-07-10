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
import { produce } from 'immer';

export class FilterSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterFields: this.props.filterFields,
      filterFieldKeys:
        this.props.filterFields && Object.keys(this.props.filterFields),
      searchResultsKeys:
        this.props.filterFields && Object.keys(this.props.filterFields),
    };

    this.handleSearch = this.handleSearch.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      filterFields: newProps.filterFields,
      filterFieldKeys:
        newProps.filterFields && Object.keys(newProps.filterFields),
      searchResultsKeys:
        newProps.filterFields && Object.keys(newProps.filterFields),
    });
  }

  handleSearch = (event) => {
    if (event.target.value !== null) {
      //convert the search string into lowerCase, remove whitespaces at the end(if any) and replace spaces
      //inbetween words with '_'(underscore). This is done to match the field names as present in allFields.
      const searchTerm = event.target.value
        .toLowerCase()
        .trim()
        .replace(' ', '_');

      const searchResultsKeys = produce(this.state.filterFieldKeys, (draft) => {
        return draft.filter((field) => {
          return field.toLowerCase().includes(searchTerm);
        });
      });
      this.setState({ searchResultsKeys });
    } else {
      this.setState({ searchResultsKeys: this.state.filterFieldKeys });
    }
  };

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
              {this.state.searchResultsKeys &&
                this.state.searchResultsKeys.map((field, index) => {
                  return (
                    <div
                      className={`field ${'filter-' + field}`}
                      key={field + index}
                    >
                      <input
                        type="checkbox"
                        id={'filter-' + field}
                        name={field}
                        checked={this.props.selectedFilterFields.includes(
                          field
                        )}
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
