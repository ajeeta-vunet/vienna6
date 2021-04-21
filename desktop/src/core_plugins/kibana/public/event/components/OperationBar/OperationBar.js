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
import './OperationBar.less';
import { ColumnSelector } from '../ColumnSelector/ColumnSelector';
import $ from 'jquery';
import { FilterSelector } from '../FilterSelector/FilterSelector';
import { SelectedFilter } from '../SelectedFilter/SelectedFilter';
import ReactTooltip from 'react-tooltip';

export class OperationBar extends React.Component {
  constructor(props) {
    super(props);
  }

  handleColumnSelectorDisplay = () => {
    return this.props.handleColumnSelectorDisplay();
  };

  handleFilterSelectorDisplay = () => {
    return this.props.handleFilterSelectorDisplay();
  };

  //this method is called when the search input box is clicked to hide the placeholder text.
  hidePlaceholder = () => {
    $('input,textarea').focus(function () {
      $(this).removeAttr('placeholder');
    });
  };
  //this method is called bring back the placeholder text when the user clicks outside search box after clicking inside it once.
  showPlaceholder = () => {
    $('input,textarea').blur(function () {
      $(this).attr('placeholder', 'search');
    });
  };
  render() {
    return (
      <div className="operationbar-wrapper">
        <img className="filter-funnel" src="/ui/vienna_images/filter-funnel-icon.svg" />
        <div className="selected-filters-container">
          {this.props.selectedFilterFields && this.props.selectedFilterFields.map((filter, index) => {
            return (
              <SelectedFilter
                key={index}
                filter={filter}
                filterFields={this.props.filterFields}
                addFilter={this.props.addFilter}
                filterStore={this.props.filterStore}
              />
            );
          })}
        </div>
        <div className="filter-options-container">
          <div className="filter-button-wrapper">
            <button className="filter-button" onClick={() => this.handleFilterSelectorDisplay()}>
            Filter
              <img className="filter-selector-icon" src="/ui/vienna_images/filter-icon.svg"/>
            </button>
          </div>
          <span id="filter-selector-id">
            <FilterSelector
              filterFields={this.props.filterFields}
              handleFilterSelectorChange={this.props.handleFilterSelectorChange}
              selectedFilterFields={this.props.selectedFilterFields}
            />
          </span>
          <div className="search-container ">
            <input
              onChange={(e) => this.props.onSearch(e)}
              type="text"
              id="search-input"
              placeholder="search"
              onFocus={() => this.hidePlaceholder()}
              onBlur={() => this.showPlaceholder()}
            />
          </div>
          <div className="edit-button-wrapper">
            <button
              className="edit-button"
              onClick={() => this.handleColumnSelectorDisplay()}
            >
              Edit
              <i
                className="fa fa-pencil column-selector-icon"
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="report-button-wrapper">
            <button className="report-button" onClick={() => this.props.exportEventsToCsv()}>
              <i className="fa fa-download" data-tip="Download CSV Report"/>
              <ReactTooltip />
            </button>
          </div>
        </div>
        <span id="column-selector-id">
          <ColumnSelector
            allFields={this.props.allFields}
            hiddenFields={this.props.hiddenFields}
            handleColumnSelectorChange={this.props.handleColumnSelectorChange}
            handleUpdateColumnSelector={this.props.handleUpdateColumnSelector}
            eventConsoleMandatoryFields={this.props.eventConsoleMandatoryFields}
          />
        </span>
      </div>
    );
  }
}