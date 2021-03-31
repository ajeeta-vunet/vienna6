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
import './DropDownSelect.less';
import $ from 'jquery';

export class DropDownSelect extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayDropdown: false,
      value: this.props.value,
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      value: newProps.value
    });
  }

  //this method is called when the user clicks on the dropwn option.
  //we taggle the display of the dropdown options container using CSS Stylying.
  onClickDropdown = () => {
    const id = '#dropdown-container';
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
  }

  //this method is used to save the selected option under the dropdown.
  selectedOption = (option) => {
    const id = '#dropdown-container';
    const container = $(id);
    container.hide();
    this.setState({ displayDropdown: false }, () => this.props.handleAssignee(option));
  }

  //this function handles the search functionality (by altering the display attribute)
  handleSearch(event) {
    if (event.target.value !== null) {
      const searchTerm = event.target.value.toLowerCase().trim();

      const filterFieldKeys = this.props.options;
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
    const displayOptions = this.props.options && this.props.options.map((option) => {
      return (
        <div
          className={`field ${option}`}
          key={option}
          onClick={() => this.selectedOption(option)}
        >
          {option}
        </div>
      );
    });
    return(
      <div className="dropdown-select-wrapper">
        <div
          className="dropdown-select-header"
          onClick={() => this.onClickDropdown()}
        >
          <div className="select-value">
            {this.state.value === '' ? 'Unassigned' : this.state.value}
          </div>
          <div className="dropdown-icon">
            <span
              className="more-details-button"
            >
              <i className={'fa fa-lg ' + (this.state.displayDropdown ? 'fa-angle-up' : 'fa-angle-down')} />
            </span>
          </div>
        </div>
        <div
          className="dropdown-container"
          id="dropdown-container"
          style={{ display: 'none' }}
        >
          <div className="filter-selector-search">
            <input
              placeholder="Search"
              type="text"
              onChange={(event) => this.handleSearch(event)}
            />
          </div>
          {displayOptions}
        </div>
      </div>
    );
  }
}