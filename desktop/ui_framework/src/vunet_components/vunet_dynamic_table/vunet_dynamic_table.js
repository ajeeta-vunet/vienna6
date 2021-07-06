
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

import React, { Component, PropTypes } from 'react';
import './_vunet_dynamic_table.less';
import { VunetLoader } from 'ui_framework/src/vunet_components/VunetLoader/VunetLoader';

export class VunetDynamicTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false, // Whether data is still loading
      sortField: null, // Field the table is to be sorted based on
      sortOrder: null, // Order the field should be sorted based on
      selectedRows: [], // Checked rows
      rowSize: null, // Default row size
      allSelected: false // Whether the select all checkbox is checked
    };
  }

  componentWillMount() {
    if (!this.state.rowSize) {
      if (this.props.rowLimits && this.props.rowLimits.length > 0) {
        this.setState({
          rowSize: this.props.rowLimits[0]
        });
      } else {
        this.setState({
          rowSize: 10
        });
      }
    }
  }

  componentWillReceiveProps(newProps) {
    // If rows are updated, remove all previously selected rows
    if (newProps.rows !== this.props.rows) {
      this.setState({
        selectedRows: [],
        allSelected: false
      });
    }
  }

  // Function to select rows in table
  selectRow = (element) => {
    const selectedRows = [...this.state.selectedRows];
    const elementIndex = selectedRows.indexOf(element);
    if (elementIndex >= 0) {
      selectedRows.splice(elementIndex, 1);
      this.setState({ allSelected: false });
    } else {
      selectedRows.push(element);
    }
    this.setState({
      selectedRows: selectedRows
    });
  };

  // Function to select all rows in the table
  selectAllRows = () => {
    if (!this.state.allSelected) {
      const selected = [];
      [...this.props.rows].map((row) => {
        selected.push(row[this.props.rowIdentifier]);
      });
      this.setState({
        selectedRows: selected,
        allSelected: true
      });
    } else {
      this.setState({
        selectedRows: [],
        allSelected: false
      });
    }
  }

  // Function to render the search input bar
  renderSearchInput = () => {
    return (
      <div className="toolbar-search">
        <div className="search-icon fa fa-search" />
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          onKeyUp={(e) => this.props.searchForKeyword(e.target.value)}
        />
      </div>
    );
  };

  // Fuction to render the import button
  renderImportButton = () => {
    return (
      <button
        className="importBtn"
        aria-label="import"
        onClick={this.props.importData}
      >
        <span className="btnIcon kuiButton__icon kuiIcon glyphicon glyphicon-import" />
        Import
      </button>
    );
  };

  // Fuction to render the export button
  renderExportButton = () => {
    return (
      <button
        className="exportBtn"
        aria-label="export"
        onClick={this.props.exportData}
      >
        <span className="btnIcon kuiButton__icon kuiIcon glyphicon glyphicon-export" />
        Export
      </button>
    );
  };

  // Function to render add button
  renderAddButton = () => {
    return (
      <button
        className="addBtn"
        aria-label="add"
        onClick={this.props.addNewRecord}
      >
        <span className="kuiButton__icon kuiIcon fa-plus" />
      </button>
    );
  };

  //Function to render delete button
  renderDeleteButton = () => {
    return (
      <button
        className="deleteBtn"
        aria-label="delete"
        onClick={() => { this.props.deleteRecord(this.state.selectedRows); }}
      >
        <span className="kuiButton__icon kuiIcon fa-trash" />
      </button>
    );
  };

  // Function to render row size dropdown
  renderRowSizeDropdown = () => {
    return (
      <select
        className="kuiSelect rowsSelect"
        onChange={(e) => { this.changeRowLimit(e.target.value); }}
        value={this.state.rowSize}
      >
        {
          this.props.rowLimits.map((size) => {
            return <option key={size} value={size}>{size}</option>;
          })
        }
      </select>
    );
  };

  // Function to render previous page button
  renderPreviousButton = () => {
    return (
      <button
        className="previousPageBtn"
        aria-label="previous-page"
        disabled={this.props.pageNumber === 1}
        onClick={() => this.props.getNextOrPrevRecords('prev')}
      >
        <span className="pageIcon fa-chevron-left" aria-hidden="true" />
      </button>
    );
  };

  // Function to render next page button
  renderNextButton = () => {
    return (
      <button
        className="nextPageBtn"
        aria-label="next-page"
        disabled={(this.props.pageNumber * this.state.rowSize) >= this.props.totalRecords}
        onClick={() => this.props.getNextOrPrevRecords('next')}
      >
        <span className="pageIcon fa-chevron-right" aria-hidden="true" />
      </button>
    );
  };

  // Function to return the sort order
  getSortOrder = (field) => {
    if (this.state.sortField === field) {
      const newSortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
      this.setState({
        sortOrder: newSortOrder
      });
      return newSortOrder;
    } else {
      this.setState({
        sortField: field,
        sortOrder: 'asc'
      });
      return 'asc';
    }
  };

  // Function to render table headers
  renderTableHeaders = () => {
    const headerKeys = Object.keys(this.props.headers);
    if (this.props.editRecord) {
      headerKeys.push('Action');
    }
    return headerKeys.map((headerKey) => {
      if (headerKey !== 'Action') {
        return (
          <th
            key={'head-' + headerKey}
            onClick={
              () => {
                const sortOrder = this.getSortOrder(headerKey);
                this.props.sortField(headerKey, sortOrder);
              }
            }
          >
            {this.props.headers[headerKey]}
            {this.state.sortField === headerKey && this.state.sortOrder === 'asc' && (
              <span className="sortIcon fa-long-arrow-down" aria-hidden="true" />
            )}
            {this.state.sortField === headerKey && this.state.sortOrder === 'desc' && (
              <span className="sortIcon fa-long-arrow-up" aria-hidden="true" />
            )}
          </th>
        );
      } else {
        return (
          <th
            key={'head-' + headerKey}
          >
            Action
          </th>
        );
      }
    });
  };

  // Function to render table rows
  renderTableRows = () => {
    return this.props.rows && this.props.rows.map((row, idx) => {
      return (
        <tr
          key={row[this.props.rowIdentifier]}
          style={row[Object.keys(this.props.headers).find(key => this.props.headers[key] === 'Enabled')] === 'No' ?
            { backgroundColor: '#F8D7DA', color: '#000000' } : { backgroundColor: '#FFFFFF', color: '#000000' }}
          className={'row-' + idx}
        >
          <td className="checkCell">
            <input
              type="checkbox"
              className="checkSingle kuiCheckBox"
              checked={this.state.selectedRows.includes(row[this.props.rowIdentifier])}
              onClick={() => { this.selectRow(row[this.props.rowIdentifier]); }}
            />
          </td>
          {Object.keys(this.props.headers).map((header, ind) => {
            return <td key={ind}>{row[header]}</td>;
          })}
          {this.props.editRecord && (
            <td onClick={() => { this.props.editRecord(row[this.props.rowIdentifier]); }}>
              <span className="editIcon fa-pencil" aria-hidden="true" />
            </td>
          )}
        </tr>
      );
    });
  };

  renderTableActions = () => {
    return this.props.tableActions.map((rowAction) => {
      return (
        <button
          className={'rowActionBtn'}
          aria-label={rowAction.label}
          style={rowAction.styling ? rowAction.styling : {}}
          onClick={() => { rowAction.onPerform(this.state.selectedRows); }}
        >
          {rowAction.title}
        </button>
      );
    });
  }

  // Triggers when the row size is changed in the dropdown
  changeRowLimit = (size) => {
    this.setState({ rowSize: size });
    this.props.changeRowLimit(size);
  };

  renderPageInformation = () => {
    const recordStart = ((this.props.pageNumber - 1) * this.state.rowSize) + 1;
    let recordEnd;
    if (this.props.totalRecords < (this.state.rowSize * this.props.pageNumber)) {
      recordEnd = this.props.totalRecords;
    } else {
      recordEnd = this.props.pageNumber * this.state.rowSize;
    }

    return `Showing ${recordStart} - ${recordEnd} rows of ${this.props.totalRecords}`;
  }

  // Rendering final JSX of Vunet Dynamic Table
  render() {
    return (
      <div className="vunet-dynamic-table">
        <div className="table-toolbar">
          {this.props.searchForKeyword ? this.renderSearchInput() : null}
          <div className="toolbar-action-group">
            {this.props.importData && this.state.selectedRows.length === 0 && this.renderImportButton()}
            {this.props.exportData && this.state.selectedRows.length === 0 && this.renderExportButton()}
            {this.props.addNewRecord && this.state.selectedRows.length === 0 && this.renderAddButton()}
            {this.props.tableActions && this.props.tableActions.length > 0 &&
              this.state.selectedRows.length > 0 && this.renderTableActions()}
            {this.props.deleteRecord && this.state.selectedRows.length > 0 && this.renderDeleteButton()}
            {this.props.rowLimits && this.props.rowLimits.length > 0 && this.props.changeRowLimit && this.renderRowSizeDropdown()}
          </div>
        </div>
        <div className="table-content">
          {this.state.loading && (
            <VunetLoader />
          )}
          {
            !this.state.loading && (
              <table>
                {(Object.keys(this.props.headers).length > 0 && this.props.rows.length > 0) && (
                  <thead>
                    <tr>
                      <td className="checkAllCell">
                        <input
                          type="checkbox"
                          className="checkAll kuiCheckBox"
                          checked={this.state.allSelected}
                          onClick={this.selectAllRows}
                        />
                      </td>
                      {this.renderTableHeaders()}
                    </tr>
                  </thead>
                )}
                <tbody>{this.renderTableRows()}</tbody>
              </table>
            )
          }
          {(!this.state.loading && this.props.rows.length < 1) && (
            <div className="table-status-text">Looks like there is no data.</div>
          )}
        </div>
        <div className="table-footer">
          <div className="selection-info">
            {this.state.selectedRows.length > 0 && (
              <span className="rowSelectionIndication">
                {this.state.selectedRows.length} rows selected
              </span>
            )}
          </div>
          <div className="paging-information">
            {!this.state.loading && (
              <span className="pageNumberIndication">
                {this.renderPageInformation()}
              </span>
            )}
            {this.props.getNextOrPrevRecords && this.renderPreviousButton()}
            {this.props.getNextOrPrevRecords && this.renderNextButton()}
          </div>
        </div>
      </div>
    );
  }
}

VunetDynamicTable.defaultProps = {
  rows: []
};

VunetDynamicTable.propTypes = {
  rowIdentifier: PropTypes.string, // Unique column in the table
  rows: PropTypes.array, // Records to be displayed
  headers: PropTypes.object, // Object containing the header aliases to be shown
  addNewRecord: PropTypes.func, // Function to add new record
  editRecord: PropTypes.func, // Function to edit a record
  deleteRecord: PropTypes.func, // Function to delete records
  tableActions: PropTypes.array, // Array that contains all the extra custom row actions
  pageNumber: PropTypes.number, // Page Number to be shown
  getNextOrPrevRecords: PropTypes.func, // Function to go to next page in table
  searchForKeyword: PropTypes.func, // Function to search for a keyword
  sortField: PropTypes.func, // Function to sort the table based on a particular column
  totalRecords: PropTypes.number, // Total number of records returned
  importData: PropTypes.func, // Function to import data
  exportData: PropTypes.func, // Function to export data
  changeRowLimit: PropTypes.func, // Function to update the no of rows to be displayed
  rowLimits: PropTypes.array // Array of numbers representing the available row sizes
};