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

export class OperationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: this.props.events,
    };
  }

  handleColumnSelectorDisplay = () => {
    return this.props.handleColumnSelectorDisplay();
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
        <div className="filter-options-container">
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