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
      //convert the search string into lowerCase, remove whitespaces at the end(if any) and replace spaces
      //inbetween words with '_'(underscore). This is done to match the filednames as present in allFields.
      const searchTerm = event.target.value.toLowerCase().trim().replace(' ', '_');

      this.state.allFields.map((field) => {
        field = field.replace(/[^a-zA-Z-_]+/g, '');
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
    const disabledColumns = this.props.eventConsoleMandatoryFields.sort();
    let allFields = [];
    //check whether disabledColumns array contains an empty string, if it does then skip filtering allFields based on disabledColumns
    //just sort it and use in in the JSX.
    if(disabledColumns[0] !== '') {
      //this filter and concat is done to push disabled columns to the end of array so that it will be displayed at the end in the UI.
      allFields = this.state.allFields && this.state.allFields.filter((field) => !disabledColumns.includes(field));
      allFields.sort();
      allFields = allFields.concat(disabledColumns);
    } else {
      allFields = this.state.allFields.sort();
    }
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
                field = field.replace(/[^a-zA-Z-_]+/g, '');
                //let id = 'column-selector-' + field;
                return (
                  <div
                    className={`field ${field}`}
                    key={field}
                  >
                    <input
                      type="checkbox"
                      id={'edit-' + field}
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
