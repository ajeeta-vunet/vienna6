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
import './SelectedFilter.less';
import $ from 'jquery';
import _ from 'lodash';

export class SelectedFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterFields: this.props.filterFields,
      filterStore: this.props.filterStore,
    };

    this.handleSearch = this.handleSearch.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      filterFields: newProps.filterFields,
      filterStore: newProps.filterStore,
    });
  }

  //this function handles the display of options under each selected filter (by altering the display attribute)
  handleSelectedFilterDisplay = () => {
    const id = '#' + this.props.filter + '-dropdown';
    const container = $(id);
    container.show();

    function handleToggle(e) {
      if ($(e.target).closest(id).length === 0) {
        $(id).hide();
        $(document).unbind('click');
      }
    }

    $(document).on('click', function (e) {
      handleToggle(e);
    });
  };

  //this function handles the search functionality (by altering the display attribute)
  handleSearch(event) {
    if (event.target.value !== null) {
      const searchTerm = event.target.value.toLowerCase().trim();
      const filterFieldKeys =
        this.props.filterFields &&
        Object.values(this.props.filterFields[this.props.filter]);
      filterFieldKeys.map((field) => {
        //we perform field.toString().replaceAll to remove '.' as it is used as className and className does
        //not allow usage of special characters as '.'
        field = field.toString().replaceAll('.', '');
        if (field.toLowerCase().includes(searchTerm)) {
          $(`.field.${field}`).css('display', 'block');
        } else {
          $(`.field.${field}`).css('display', 'none');
        }
      });
    }
  }

  //this function generates the filter heading and also the contents of each filter button,
  //if any filter is selected then the value is also appended to the filter heading to show the
  //filters that are applied.
  generateFilterHeading = (key) => {
    let selectedFilter;
    if (this.state.filterStore[key]) {
      if (this.state.filterStore[key].length > 1) {
        selectedFilter = this.state.filterStore[key][0] + '...';
      } else {
        selectedFilter = this.state.filterStore[key][0];
      }
    } else {
      selectedFilter = 'All';
    }
    key.replace(/[^a-zA-Z]+/g, ' ');
    return _.startCase(key) + ' : ' + selectedFilter;
  };

  render() {
    const filterFields =
      this.props.filterFields &&
      Object.values(this.props.filterFields[this.props.filter]).sort();
    let checkedFlag = false;
    return (
      <div className="selected-filter-wrapper" id={this.props.filter}>
        <div className="selected-button-wrapper">
          <div
            className="selected-filter-button"
            onClick={() => this.handleSelectedFilterDisplay()}
          >
            {this.generateFilterHeading(this.props.filter)}
          </div>
          <div
            className="cancel-filter"
            onClick={() => this.props.addFilter(this.props.filter, '')}
          >
            x
          </div>
        </div>
        <div
          className={this.props.filter + '-dropdown selected-filter-dropdown'}
          id={this.props.filter + '-dropdown'}
          style={{ display: 'none', position: 'absolute' }}
        >
          <div className="selected-filter-search">
            <input
              placeholder="Search"
              type="text"
              onChange={(event) => this.handleSearch(event)}
            />
          </div>
          <div className="selected-filter-options">
            {filterFields &&
              filterFields.map((field, index) => {
                if (this.state.filterStore[this.props.filter]) {
                  checkedFlag = this.state.filterStore[
                    this.props.filter
                  ].includes(field.toString());
                }
                return (
                  //we perform field.toString().replaceAll to remove '.' as it is used as className and className cannot
                  //have special characters such as '.'
                  <div
                    className={`field ${field.toString().replaceAll('.', '')}`}
                    key={field + index}
                  >
                    <input
                      type="checkbox"
                      id={'filter-' + field}
                      name={field}
                      checked={checkedFlag}
                      onChange={() =>
                        this.props.addFilter(
                          this.props.filter,
                          field.toString()
                        )
                      }
                    />
                    <label htmlFor={field}>
                      {field.toString().replace(/_/g, ' ')}
                    </label>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}
