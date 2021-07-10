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
import { produce } from 'immer';

export class ColumnSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allFields: this.props.allFields,
      hiddenFields: this.props.hiddenFields,
      searchResultsFields: this.props.allFields,
    };
  }

  //this function handles the search functionality.
  handleSearch = (event) => {
    if (event.target.value !== null) {
      //convert the search string into lowerCase, remove whitespaces at the end(if any) and replace spaces
      //inbetween words with '_'(underscore). This is done to match the field names as present in allFields.
      const searchTerm = event.target.value
        .toLowerCase()
        .trim()
        .replace(' ', '_');

      const searchResultsFields = this.state.allFields.filter((field) => {
        return field.toLowerCase().includes(searchTerm);
      });
      this.setState({ searchResultsFields });
    } else {
      this.setState({ searchResultsFields: this.state.allFields });
    }
  }

  //this method is called when one of the checkboxes under column selector is checked or unchecked.
  handleColumnSelectorChange = (field) => {
    let hiddenFields;
    if (this.state.hiddenFields.includes(field)) {
      hiddenFields = produce(this.state.hiddenFields, (draft) => {
        return draft.filter((entry) => !(entry === field));
      });
    } else {
      hiddenFields = produce(this.state.hiddenFields, (draft) => {
        draft.push(field);
      });
    }
    this.setState({ hiddenFields });
  };

  //this method is used to select or deselect all the entries
  //under Manage Columns.
  selectOrDeselectAll = () => {
    const disabledColumns = this.props.eventConsoleMandatoryFields.sort();
    const searchResultsFields =
        this.state.searchResultsFields &&
        this.state.searchResultsFields.filter(
          (field) => !disabledColumns.includes(field)
        );
    if(this.state.hiddenFields && this.state.hiddenFields.length > 0) {
      this.setState({ hiddenFields: [] });
    }else {
      this.setState({ hiddenFields: searchResultsFields });
    }
  }

  render() {
    //This array contains names of columns that are to be disabled.
    const disabledColumns = this.props.eventConsoleMandatoryFields.sort();
    let searchResultsFields = [];
    //check whether disabledColumns array contains an empty string, if it does then skip filtering allFields based on disabledColumns
    //just sort it and use in in the JSX.
    if (disabledColumns.length > 0) {
      //this filter and map is done to push disabled columns to the end of array so that it will be displayed at the end in the UI.
      searchResultsFields =
        this.state.searchResultsFields &&
        this.state.searchResultsFields.filter(
          (field) => !disabledColumns.includes(field)
        );
      searchResultsFields.sort();
      disabledColumns.map((disabledColumn) => {
        if (
          this.state.searchResultsFields &&
          this.state.searchResultsFields.includes(disabledColumn)
        ) {
          searchResultsFields.push(disabledColumn);
        }
      });
    } else {
      searchResultsFields = this.state.searchResultsFields.sort();
    }

    return (
      <div className="column-selector-container" id="column-selector-wrapper">
        <div className="column-selector-wrapper">
          <div className="column-selector-header">Add or Remove Columns</div>
          <div className="column-selector-search">
            <input
              placeholder="Search"
              type="text"
              onChange={(event) => this.handleSearch(event)}
            />
          </div>
          <div className="select-deselect-wrapper">
            <button
              className="select-deselect-button"
              onClick={() => this.selectOrDeselectAll()}
            >
              {this.state.hiddenFields && this.state.hiddenFields.length > 0 ? 'Select All' : 'Deselect All'}
            </button>
          </div>
          <div className="column-selector-body">
            <div className="column-selector">
              <div className="column-selector-checkbox-wrapper">
                {searchResultsFields &&
                  searchResultsFields.map((field) => {
                    field = field.replace(/[^a-zA-Z-_]+/g, '');
                    return (
                      <div className={`field ${field}`} key={field}>
                        <input
                          type="checkbox"
                          id={'edit-' + field}
                          name={field}
                          checked={!this.state.hiddenFields.includes(field)}
                          onChange={() =>
                            this.handleColumnSelectorChange(field)
                          }
                          disabled={disabledColumns.includes(field) && true}
                        />
                        <label htmlFor={field}>
                          {field.replace(/_/g, ' ')}
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="action-buttons column-selector-buttons">
              <button
                className="event-console-button column-selector-button"
                onClick={() => {
                  this.props.handleUpdateColumnSelector(
                    this.state.hiddenFields
                  );
                  this.props.handleColumnSelectorDisplay();
                }}
              >
                Save
              </button>
              <button
                className="event-console-button cancel-button column-selector-button"
                onClick={() => {
                  this.props.handleColumnSelectorDisplay();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
