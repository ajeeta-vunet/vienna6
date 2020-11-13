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
import './ColumnSelector.less';
import $ from 'jquery';

export class ColumnSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allFields: this.props.allFields,
    };

    this.handleSearch = this.handleSearch.bind(this);
  }

  //this function handles the search functionality (by altering the display attribute)
  handleSearch(event) {
    if (event.target.value !== null) {
      const searchTerm = event.target.value.toLowerCase().trim();

      this.props.allFields.map((field) => {
        if (field.toLowerCase().includes(searchTerm)) {
          $(`.field.${field}`).css('display', 'block');
        } else {
          $(`.field.${field}`).css('display', 'none');
        }
      });
    }
  }

  render() {
    //This array contains names of columns that are to be disabled.
    const disabledColumns = this.props.eventConsoleMandatoryFields;
    //this filter and concat is done to push disabled columns to the end of array so that it will displayed at the end in the UI.
    let allFields = this.state.allFields && this.state.allFields.filter((field) => !disabledColumns.includes(field));
    allFields = allFields.concat(disabledColumns);
    return (
      <div className="column-selector-wrapper" id="column-selector-wrapper">
        <div className="column-selector-header">Edit Row Headers</div>
        <div className="column-selector-search">
          <input
            placeholder="Search"
            type="text"
            onChange={(event) => this.handleSearch(event)}
          />
        </div>
        <div className="column-selector-body">
          <div className="column-selector">
            Default Row Attributes
            <div className="column-selector-checkbox-wrapper">
              {allFields && allFields.map((field) => {
                //let id = 'column-selector-' + field;
                return (
                  <div className={`field ${field}`} key={field}>
                    <input
                      type="checkbox"
                      id={field}
                      name={field}
                      onChange={() =>
                        this.props.handleColumnSelectorChange(field)
                      }
                      disabled={disabledColumns.includes(field) && true}
                    />
                    <label htmlFor={field}>{field.replace(/_/g, ' ')}</label>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="action-buttons column-selector-buttons">
            <button
              className="event-console-button column-selector-button"
              onClick={() => {
                this.props.handleUpdateColumnSelector();
                $('#column-selector-id').hide();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}
