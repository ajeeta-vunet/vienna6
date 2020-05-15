
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

// Copyright 2019 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';

import { Pager } from 'ui/pager';
import { SortableProperties } from 'ui_framework/services';
import { deHighlightRow, highlightSelectedRow } from 'ui/utils/vunet_row_highlight';

import {
  KuiPager,
  KuiButton,
  KuiTable,
  KuiTableHeader,
  KuiTableHeaderCell,
  KuiTableBody,
  KuiTableRow,
  KuiTableRowCell,
  KuiModalOverlay,
  KuiConfirmModal,
  KuiListingTableDeleteButton,
  KuiListingTableCreateButton,
  KuiListingTable,
  KuiListingTableNoMatchesPrompt,
  KuiListingTableLoadingPrompt,
  KuiEmptyTablePrompt,
  KuiEmptyTablePromptPanel,
} from 'ui_framework/components';

//@@@ less framework ??
//@@@ breaking into sub components
import './_vunet_table.less';

import { VunetModal } from '../vunet_modal/vunet_modal';

export class VunetDataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowIds: [], // Holds the ids of selected rows.
      pageOfItems: [], // Holds all the rows of current page.
      showDeleteModal: false, // Flag to display delete confirmation.
      deleteSource: 'table', // To indicate row level or table level action.
      showAddEditModal: false, // Flag to display edit / add modal.
      filter: '', // Holds the input of search box in vunet table.
      pageStartNumber: 1, // Holds the pagination start page.
      isFetchingItems: false, // A Loading icon is displayed when this
      // flag is set to 'true'.
      hasSubTable: false, // Flag to check if table row has a sub table
      editId: '', // Holds the id of the row on which operation is done.
      curEvent: '', // Holds the event when an operation is performed on rows
      formModal: {}, // Initialize the form modal object.
      containerClassName: 'vunet-table', // Specify a parent class for the container
      // holding the table
      showSubTable: 0, // Flag to display sub table for a row.
      useBoxShadowForTable: true, // Set this to false to get rid of shadow effect on table borders
    };

    // Run the function inside _.debounce after 200 milli seconds
    this.rows = [];

    // Create an object for pagination by passing these
    // arguments (totalItems, pageSize, startingPage)
    this.pager = new Pager(this.rows.length, 10, 1);

    //@@@
    this.debouncedFetch = _.debounce(() => {
      const tableType = this.props.tableType ? this.props.tableType : '';
      this.props.fetchItems(tableType)
        .then(rows => {
          this.setState({
            isFetchingItems: false,
            selectedRowIds: [],
          });

          this.rows = rows;
          this.calculateItemsOnPage();
        }, () => {
          this.setState({
            isFetchingItems: false,
            selectedRowIds: [],
          });

          this.rows = [];
        });
    }, 200);
  }

  componentWillUnmount() {
    this.debouncedFetch.cancel();
  }

  /**
  * Hide/show search bar and row selection based on the meta received.
  */
  componentWillReceiveProps(newProps) {

    // Create instance of SortableProperties to sort the table.
    // SortableProperties class takes 2 arguments:
    // 1: List of column object EX: {
    //                                name: 'title',
    //                                getValue: item => item.title.toLowerCase(),
    //                                isAscending: true,
    //                               },
    //                               {
    //                                 name: 'description',
    //                                 getValue: item => item.description.toLowerCase(),
    //                                 isAscending: true
    //                                }
    // 2: initialSortablePropertyName which takes header title.

    // Create SortableProperties instance only column header is available
    if (newProps.metaItem.rows.length > 0) {
      this.sortableProperties = new SortableProperties(
        this.createSortablePropertiesList(),
        newProps.metaItem.rows[0]
      );
    }

    if (!_.isUndefined(_.difference(newProps.metaItem.headers, this.props.metaItem.headers)[0]) ||
      (!_.isUndefined(newProps.metaItem.forceUpdate) && newProps.metaItem.forceUpdate)) {
      this.setState({ isFetchingItems: true });
      this.debouncedFetch();
    }

    let classnames = 'vunet-table';

    // If containerClassName is defined then use it.
    if(newProps.metaItem.containerClassName !== '' &&
      newProps.metaItem.containerClassName !== undefined) {
      classnames = ' ' + newProps.metaItem.containerClassName;
    }

    // If useBoxShadowForTable is set to false, remove the box shadow on table.
    if(this.props.metaItem.useBoxShadowForTable !== undefined && !this.props.metaItem.useBoxShadowForTable) {
      classnames += ' remove-box-shadow';
    }

    // Hide the checkboxes in vunet table rows
    if (this.props.metaItem.selection !== undefined && !this.props.metaItem.selection) {
      classnames += ' vunetHideSelector';
    }

    // Hide the search bar of vunet table
    if (this.props.metaItem.search !== undefined && !this.props.metaItem.search) {
      classnames += ' vunetHideSearch';
    }
    this.setState({ containerClassName: classnames });
  }

  /**
   * Calculate item per page for pagination
   */
  calculateItemsOnPage = () => {
    // Sort the items.
    this.rows = this.sortableProperties ? this.sortableProperties.sortItems(this.rows) : this.rows;
    this.pager.setTotalItems(this.rows.length);
    const pageOfItems = this.rows.slice(this.pager.startIndex, this.pager.startIndex + this.pager.pageSize);
    this.setState({ pageOfItems, pageStartNumber: this.pager.startItem });
    if (this.state.filter) {
      this.filterItems(this.state.filter);
    }
  };

  // Calculetes the number of items(rows) in a page to
  // show based on value selected.
  calculeteNumberOfItems = (event) => {
    if (event.target.value !== 'All') {
      this.pager = new Pager(this.rows.length, Number(event.target.value), 1);
    } else {
      this.pager = new Pager(this.rows.length, this.rows.length, 1);
    }
    this.calculateItemsOnPage();
  }

  // Create a list of objects with name, getValue and isAscending
  // to pass in to SortableProperties class.
  // Here we have used this.props.metaItem.row instead of this.props.metaItem.headers,
  // because this.props.metaItem.rows has header variable name and this.props.metaItem.headers has header title,
  // this requires to get the value of header.
  //
  // EX:In User this.props.metaItem.headers has headers: ['Name', 'Email', 'Group', 'Active', 'Home Page', 'Tenant Id', 'BU Id', 'Action']
  // this.props.metaItem.rows has rows: ['name', 'email', 'user_group', 'active', 'home_page', 'tenant_id',  'bu_id']
  // We need user_group to get the value not with the Group.
  createSortablePropertiesList() {

    const sortablePropertiesList = [];

    this.props.metaItem.rows && this.props.metaItem.rows.map((header) => {
      sortablePropertiesList.push({
        name: header,
        getValue: (item) => {
          if (typeof (item[header]) === 'string') {
            return item[header].toLowerCase();
          } else {
            // To replace value null with empty string.
            return item[header] !== null ? item[header] : '';
          }
        },
        isAscending: true,
      }, header);
    });

    return sortablePropertiesList;
  }

  /**
   * Deselect all at once by clicking on header selction checkbox
   */
  deselectAll = () => {
    this.setState({ selectedRowIds: [] });
  };

  /**
   * fetch item
   */
  fetchItems = (filter) => {
    this.setState({ isFetchingItems: true });
    this.debouncedFetch(filter);
  };

  /**
   * Filter item based on search text
   */
  filterItems = (filter) => {
    if (filter === '') {
      // If filter is being removed, just set the state and calculate Items on page
      this.setState({ filter }, () => this.calculateItemsOnPage());
    } else {
      this.setState({ filter });
      const pageOfItems = this.rows.filter(item => {
        return this.props.metaItem.rows.some(row => {

          // _.isEmpty() returns true for [null, true, 1]
          // for these cases check  value with _.isEmpty() _.isNumber() _.isBoolean()
          if (!_.isArray(item[row]) && !_.isObject(item[row]) && (!_.isEmpty(item[row]) || _.isNumber(item[row]) || _.isBoolean(item[row]))
          && !_.isUndefined(item[row])) {
            if (_.isNumber(item[row])) {
              return item[row].toString().indexOf(filter) > -1 ? true : false;
            }
            // Convert value to lowercase for case insensitive filter search.
            return item[row].toLowerCase().indexOf(filter.toLowerCase()) > -1 ? true : false;
          }
        });
      });
      this.pager.setTotalItems(pageOfItems.length);
      const _pageOfItems = pageOfItems.slice(this.pager.startIndex, this.pager.startIndex + this.pager.pageSize);
      this.setState({ pageOfItems: _pageOfItems });
    }
  };

  componentDidMount() {
    this.fetchItems(this.state.filter);
  }

  /**
   * Remove all selections and display the
   * next page rows.
   */
  onNextPage = () => {
    deHighlightRow();
    this.deselectAll();
    this.pager.nextPage();
    this.calculateItemsOnPage();
  };

  /**
   * Remove all selections and display the
   * previous page rows.
   */
  onPreviousPage = () => {
    deHighlightRow();
    this.deselectAll();
    this.pager.previousPage();
    this.calculateItemsOnPage();
  };

  /**
   * NOT IN USE AS OF NOW.
   */
  getUrlForItem(item) {
    return `#/${item.id}`;
  }

  /**
  * Render icon for row level action
  * @param {*} rows
  * @param {*} id
  */
  renderItemTypeIcon(rows, id) {
    return rows.map(item => {
      return (
        <div key={`${item.name}`}>
          <span
            className={`kuiStatusText__icon kuiIcon ${item.icon}`}
            data-tip={`${item.toolTip}`}
            onClick={() => this.onRowActionClick(`${item.name}`, id)}
          />
          <ReactTooltip />
        </div>);
    });
  }


  // Sort based on column header type, sets sortedColumn state to
  // propertyName and sorts the table values.
  sortOn = (propertyName) => {

    this.sortableProperties.sortOn(propertyName);

    // Storing the propertyName to a sortedColumn state variable
    // to sort based on this propertyName(Which will be header title).
    this.setState({
      selectedRowIds: [],
      sortedColumn: propertyName,
    });
    this.deselectAll();
    this.calculateItemsOnPage();
  };

  /**
  * This function is used to create table headers for the vunet table.
  * If there are any row level actions allowed in table, we add an extra
  * column 'Action'.
  */
  renderHeader() {
    if ((this.props.metaItem.edit ||
        (this.props.metaItem.rowAction &&
         this.props.metaItem.rowAction.length > 0)) &&
        !this.props.metaItem.headers.includes('Action')) {
      this.props.metaItem.headers.push('Action');
    }

    const renderHeader = this.props.metaItem.headers && this.props.metaItem.headers.map((header, index) => {

      // If metaItem has help then returns header with help icon else returns only header.
      // If header is Action then it returns only content else returns content,
      // onSort, isSorted, isSortAscending to sort the table based on header.
      // For sorting we have used this.props.metaItem.rows instead of header, because
      // this.props.metaItem.rows gets the header variable name, this requires to sort the value,
      // header has header title.

      // If header is in this.props.metaItem.noSortColumns list then return only the content.
      // This check has done for column having value type Object, sorting on Object
      // is not implementes as of now.
      return (
        (header !== 'Action' && this.sortableProperties &&  (!this.props.metaItem.noSortColumns ||
          !this.props.metaItem.noSortColumns.includes(header))) ?

          {
            content: (this.props.metaItem.help && this.props.metaItem.help[index] !== '') ?

              <span>
                {header}
                <i className="fa fa-question-circle header-style" data-tip={this.props.metaItem.help[index]} data-for={`tooltip-${index}`}>
                  <ReactTooltip id={`tooltip-${index}`} className="tool-tip-style" />
                </i>
              </span> : header,
            onSort: () => this.sortOn(this.props.metaItem.rows[index]),
            isSorted: this.state.sortedColumn === this.props.metaItem.rows[index],
            isSortAscending: this.sortableProperties.isAscendingByName(this.props.metaItem.rows[index]),
          } :
          {
            content: header
          });
    });

    return renderHeader;
  }

  /**
  * This function is used to render cells in vunet table.
  * A cell can be data value or any row action buttons.
  */
  renderRowCells(item) {

    const cells = [];
    this.props.metaItem.rows.forEach(row => {

      // For add image in Table Cell.
      if (typeof (item[row]) === 'object' && item[row].image) {
        cells.push({ value: <img src={item[row].image}/> });
      } else {
        if (this.props.metaItem.columnData) {
          const columnData = this.props.metaItem.columnData.find(cd => cd.columnName === row);
          if (columnData) {
            cells.push({ value: columnData.func(row, item[row]) });
          } else {
            cells.push({ value: item[row] });
          }
        } else {
          cells.push({ value: item[row] });
        }
      }
    });

    // If the caller wants us to call a callback to check whether we
    // should show edit button or not, we call the callback here and
    // take its return value and use that to hideEditButton
    let hideEditButton = false;
    if (this.props.metaItem.editIconCheckCallback) {
      hideEditButton = this.props.metaItem.editIconCheckCallback(item);
    }

    // If metadata passed has 'edit: true' we push the
    // edit button to actions column
    if (this.props.metaItem.edit && !hideEditButton) {
      cells.push({ action: [{ name: 'edit', icon: 'fa-pencil', toolTip: 'Edit' }] });
    }
    if (this.props.metaItem.rowAction) {
      let actionCell = [];
      if (Object.keys(cells[cells.length - 1])[0] === 'action') {
        actionCell = cells[cells.length - 1];
      } else {
        cells.push({ action: [] });
        actionCell = cells[cells.length - 1];
      }
      this.props.metaItem.rowAction.forEach(rw => {
        actionCell.action.push({ name: rw.name, icon: rw.icon, toolTip: rw.toolTip });
      });
    }

    return cells.map((cell) => {
      return cell.action ?
        <span className="kuiStatusText"> {this.renderItemTypeIcon(cell.action, item[this.props.metaItem.id])}</span> :
        <span className="kuiTabelCellSpan"> {cell.value}</span>;
    });
  }

  // Create rows
  createRows() {
    return this.state.pageOfItems.map(item => {
      return ({
        id: item[this.props.metaItem.id],
        cells: this.renderRowCells(item)
      });
    });
  }

  // Close modal callback
  closeDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  };

  // Delete action confirmation modal
  renderConfirmDeleteModal() {
    return (
      <KuiModalOverlay>
        <KuiConfirmModal
          children="Are you sure you want to delete the selected item? This action is irreversible!"
          title="Warning"
          onCancel={this.closeDeleteModal}
          onConfirm={this.deleteSelectedItems.bind(this)}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
        />
      </KuiModalOverlay>
    );
  }

  // on delete show delete conformation modal
  onDelete = () => {
    this.setState({ showDeleteModal: true, deleteSource: 'table' });
  };

  /**
   * on delete callback
   * delete may be from table level or row level custom action
   */
  deleteSelectedItems = () => {
    if (this.state.deleteSource === 'row') {
      this.props.rowAction(this.state.curEvent, this.state.editId)
        .then((fetch) => fetch ? this.fetchItems() : '')
        .then(() => this.closeDeleteModal());
    } else {
      const rows = this.rows.filter(item => this.state.selectedRowIds.includes(item[this.props.metaItem.id]));
      //tableType is being sent as the second parameter of deleteSelectedItems
      let tableType = this.props.tableType ? this.props.tableType : '';
      if (this.props.metaItem.isFormWizard &&
          this.props.metaItem.isFormWizard === true) {
        const restApiId = this.props.metaItem.restApiId;
        tableType = restApiId;

        // Delete items in sub table
        this.props.metaItem.deleteSelectedItems(rows, tableType)
          .then(() => this.fetchItems(this.state.filter))
          .catch(() => { })
          .then(() => this.deselectAll())
          .then(() => this.closeDeleteModal());
      } else {

        // Delete items in table
        this.props.deleteSelectedItems(rows, tableType)
          .then(() => this.fetchItems(this.state.filter))
          .catch(() => { })
          .then(() => this.deselectAll())
          .then(() => this.closeDeleteModal());
      }
    }
  };

  // set selected rows
  onItemSelectionChanged = (newSelectedIds) => {
    deHighlightRow();
    highlightSelectedRow();
    this.setState({ selectedRowIds: newSelectedIds });
  };

  /**
  * Open add modal with custom form definition
  */
  onCreate() {
    if (this.props.metaItem.isFormWizard) {
      this.setState({
        showAddEditModal: true,
        formModal: {
          title: 'Add' + (this.props.metaItem.title ? '  ' + this.props.metaItem.title : ''),
          action: 'add',
          restApiId: this.props.metaItem.restApiId,
          isFormWizard: this.props.metaItem.isFormWizard,
          class: 'form-wizard-modal',
          saveData: this.props.metaItem.saveData,
          getAllEditData: this.getAllEditData,
          deleteSelectedItems: this.deleteSelectedItems,
          buttonCallback: this.buttonCallback
        }
      });
    } else {
      this.setState({
        showAddEditModal: true,
        formModal: {
          title: 'Add' + (this.props.metaItem.title ? '  ' + this.props.metaItem.title : ''),
          action: 'add',
          editData: this.props.metaItem.default || {},
          item: this.props.metaItem.table,
          accessor: this.props.metaItem.columnData
        }
      });
    }
  }

  /**
  * Table level (header) action callback
  */
  onTableActionClick(event) {
    const rows = this.rows.filter(item => this.state.selectedRowIds.includes(item[this.props.metaItem.id]));
    this.props.tableAction(event, rows)
      .then((fetch) => fetch ? this.fetchItems() : '');
  }

  /**
  * This function sets the 'showSubTable' flag to id of the row
  * whose collapse button was clicked. This is used to show / hide
  *  the inner table for a row.
  */
  onSubTableToggle(id) {
    if (this.state.showSubTable === id) {
      this.setState({ showSubTable: 0 });
    } else {
      this.setState({ showSubTable: id });
    }
  }

  /**
  * Used only when form wizard is opened inside a modal.
  * This is a callback function which is passed to the VunetFormWizard
  * component. This gets called when any of the buttons get clicked.
  */
  buttonCallback = (buttonName, restApiId, name) => {
    return this.props.metaItem.buttonCallback(buttonName, restApiId, name);
  }

  /**
   * Used only when form wizard is opened inside a modal.
   * This is a callback function which is passed to the 'VunetFormWizard'
   * component. This gets called when the 'VunetFormWizard' component gets
   * mounted. This provides the data and meta data required by the
   * form to display the form elements. This provides additional data
   * corresponding to a row in the sub table.
   */
  getAllEditData = (restApiId, name) => {
    return this.props.metaItem.getAllEditData(restApiId, name);
  }

  /**
  * Row level action callback
  */
  onRowActionClick(event, rowId, inverted = false) {
    if (event === 'edit') {
      if (this.props.metaItem.isFormWizard) {
        const restApiId = this.props.metaItem.restApiId;
        this.setState({
          showAddEditModal: true,
          formModal: {
            title: 'Edit' + (this.props.metaItem.title ? '  ' + this.props.metaItem.title : ''),
            action: 'edit',
            restApiId: restApiId,
            name: rowId,
            isFormWizard: this.props.metaItem.isFormWizard,
            class: 'form-wizard-modal',
            saveData: this.props.metaItem.saveData,
            getAllEditData: this.getAllEditData,
            buttonCallback: this.buttonCallback
          }
        });
      } else {
        const _editData = !inverted ? this.rows.find(item => item[this.props.metaItem.id] === rowId) : this.rows[0];
        this.setState({
          showAddEditModal: true,
          editId: rowId,
          formModal: {
            title: 'Edit' + (this.props.metaItem.title ? '  ' + this.props.metaItem.title : ''),
            action: 'edit',
            editData: _editData || {},
            item: this.props.metaItem.table,
            accessor: this.props.metaItem.columnData
          }
        });
      }
    } else {
      if (event === 'delete') {
        this.setState({ showDeleteModal: true, deleteSource: 'row', editId: rowId, curEvent: event });
        this.renderConfirmDeleteModal();
      } else {
        const editedData = !inverted ? this.rows.find(item => item[this.props.metaItem.id] === rowId) : this.rows[0];
        this.props.rowAction(event, rowId, editedData)
          .then((fetch) => fetch ? this.fetchItems() : '');
      }
    }
  }

  /**
  * Add/edit modal close callback
  */
  onAddEditModalClose = () => {
    this.setState({
      showAddEditModal: false,
      editId: '',
      formModal: {}
    });
  }

  /**
  * Add/edit modal submit callback
  */
  onAddEditModalSubmit = (event) => {
    const action = this.state.editId !== '' ? 'edit' : 'add';
    this.setState({
      showAddEditModal: false,
      editId: ''
    });
    const tableType = this.props.tableType ? this.props.tableType : '';

    // If isSubTable is true, the modal has been
    // opened by sub table.
    if (this.props.metaItem.isSubTable &&
      this.props.metaItem.isSubTable === true) {
      this.props.metaItem.onSubmit()
        .then((fetch) => fetch ? this.fetchItems(tableType) : '');
    } else {
      this.props.onSubmit(action, this.state.editId, event, tableType)
        .then((fetch) => fetch ? this.fetchItems(tableType) : '');
    }
  }

  /**
  * Render table header action
  * create/delete will shown as icon on right-top
  * other custom action will placed with it to it and shown as button
  */
  renderToolBarActions() {
    let addDeleteAction = '';
    const tableAction = [];
    const rowsSelect = [];
    let hideDeleteButton = false;
    const isRowsSelected = this.state.selectedRowIds.length > 0 ? true : false;

    // If atleast one row is selected and if the caller wants us to call a
    // callback to check whether we should show delete button or not, we
    // call the callback here and take its return value and use that to
    // hideDeleteButton
    if (isRowsSelected && this.props.metaItem.deleteIconCheckCallback) {
      hideDeleteButton = this.props.metaItem.deleteIconCheckCallback(
        this.state.selectedRowIds);
    }

    if (this.props.metaItem.add) {
      if (hideDeleteButton === false) {
        addDeleteAction = isRowsSelected ?
          [<KuiListingTableDeleteButton
            key="delete"
            onDelete={this.onDelete}
            aria-label="Delete selected"
          />] :
          [<KuiListingTableCreateButton
            key="create"
            onCreate={this.onCreate.bind(this)}
            aria-label="Create new"
          />];
      }
    }
    if (this.props.metaItem.tableAction &&
      this.props.metaItem.tableAction.length) {
      for (let actionIndex = 0; actionIndex < this.props.metaItem.tableAction.length; actionIndex++) {
        tableAction.push(
          <KuiButton
            key={this.props.metaItem.tableAction[actionIndex].button}
            aria-label={this.props.metaItem.tableAction[actionIndex].button}
            buttonType="secondary"
            disabled={!isRowsSelected}
            onClick={() => this.onTableActionClick(this.props.metaItem.tableAction[actionIndex].button)}
          >{this.props.metaItem.tableAction[actionIndex].button}
          </KuiButton>);
      }
    }

    rowsSelect.push(
      <select
        className="kuiSelect"
        key="value"
        data-tip="Number Of Entries"
        label="Select No of rows"
        onChange={this.calculeteNumberOfItems}
      >
        <option value="10" label="10">10</option>
        <option value="50" label="50">50</option>
        <option value="100" label="100">100</option>
        <option value="All" label="All">All</option>
        <ReactTooltip />
      </select>);
    return [
      ...tableAction,
      ...addDeleteAction,
      ...rowsSelect,
    ];
  }

  /**
  * This function is used to invert 'vunet table' to display
  * table headers as first column followed by values in the next columns.
  * The following meta data is required by this function:
  * inverted : When this flag is 'true', the 'vunet table' is
  * shown as 'inverted table'
  * inverted_title : Header for the 'inverted table' created.
  * inverted_actions: Actions for the inverted table (if any)
  */
  renderInverted() {
    return (
      <KuiTable className="table-inverted">
        <KuiTableHeader>
          <KuiTableHeaderCell key="inverted_title">
            {this.props.metaItem.inverted_title} &nbsp;
          </KuiTableHeaderCell>
          <KuiTableHeaderCell key={'heder_edit'} className="kuiTableHeaderCell--alignRight">
            {this.props.metaItem.inverted_action && this.props.metaItem.inverted_action.map((action) => {
              return (
                <KuiButton
                  key={action.name}
                  aria-label={action.name}
                  buttonType="secondary"
                  onClick={() => this.onTableActionClick({ action: action.name, title: this.props.metaItem.inverted_title })}
                >{action.name}
                </KuiButton>
              );
            })}
            {this.props.metaItem.edit &&
              (

                <KuiButton
                  key={this.props.metaItem.inverted_title + '_edit'}
                  aria-label={this.props.metaItem.inverted_title + '_edit'}
                  buttonType="secondary"
                  onClick={() => this.onRowActionClick('edit', this.props.metaItem.id, true)}
                >Edit
                </KuiButton>

              )
            }
            {!this.props.metaItem.inverted_action &&
              (
                <span>
                  &nbsp;
                </span>
              )
            }
          </KuiTableHeaderCell>
        </KuiTableHeader>

        <KuiTableBody>
          {this.state.pageOfItems[0] && this.props.metaItem.rows.map((key, i) => {
            return (
              <KuiTableRow key={i}>
                <KuiTableRowCell>
                  {this.props.metaItem.headers[i]}
                </KuiTableRowCell>
                <KuiTableRowCell>
                  {this.state.pageOfItems[0][key]}
                </KuiTableRowCell>
              </KuiTableRow>);
          })}
        </KuiTableBody>
      </KuiTable>
    );
  }

  /**
  * Render pagination
  * Per page: 20
  */
  renderPager() {
    return (
      <KuiPager
        startNumber={this.state.pageStartNumber}
        hasNextPage={this.pager.hasNextPage}
        hasPreviousPage={this.pager.hasPreviousPage}
        endNumber={this.pager.endItem}
        totalItems={this.rows.length}
        onNextPage={this.onNextPage}
        onPreviousPage={this.onPreviousPage}
      />
    );
  }

  /**
   * This function takes care of displaying inner
   * table for a row in nested tables.
   */
  subTable = (table, span, id) => {
    // check if rest api id is defined othewise use parent table id
    const apiId = table.subTable.meta.restApiId ? table.subTable.meta.restApiId : id;
    return (
      <KuiTableRow key={table.type}>
        <KuiTableRowCell className="inner-table" colSpan={span}>
          <VunetDataTable
            fetchItems={() => table.subTable.fetch(apiId)}
            metaItem={table.subTable.meta}
            rowAction={table.subTable.onSubTableRowAction}
            onSubmit={table.subTable.onModalSubmit}
          />
        </KuiTableRowCell>
      </KuiTableRow>
    );
  }

  /**
  * This function displays a table for a row inside a
  * table. The following meta data is required by this function
  * hasSubTable: If this flag is 'true', A table is displayed for a
  * row inside in the outer table with a button to show /hide the table.
  */
  renderNestedTable() {

    // Prepare headers for the table.
    const headers = this.props.metaItem.headers;
    const headerCells = headers.map((headerCell, index) =>
      (
        <KuiTableHeaderCell
          key={index}
        >
          {headerCell}
        </KuiTableHeaderCell>
      )
    );

    const rows = this.createRows();
    const tableBody = rows.map((row, index) => {

      const hasSubTable = this.rows.find(item => item.name === row.id);

      // Add one to handle additional column for 'expand' / 'collapase' icon
      const colSpan = row.cells.length + 1;

      return (
        <KuiTableBody key={index}>
          <KuiTableRow
            key={rows.id}
            className={this.state.showSubTable === row.id ? 'subtable-active' : ''}
            onClick={() => this.onSubTableToggle(row.id)}
          >
            <KuiTableRowCell className="expander-wrapper">
              <span
                key="expnder1"
                className={this.state.showSubTable === row.id ? 'fa fa-angle-up' : 'fa fa-angle-down'}
              />
            </KuiTableRowCell>
            {row.cells.map((cell, index) =>
              (
                <KuiTableRowCell
                  key={index}
                >
                  {cell}
                </KuiTableRowCell>
              )
            )}
          </KuiTableRow>
          {hasSubTable &&
           this.state.showSubTable === row.id &&
           this.subTable(hasSubTable, colSpan, row.id)}
        </KuiTableBody>
      );
    });

    const nestedTable = (
      <KuiTable className="outer-table">

        <KuiTableHeader>
          <KuiTableHeaderCell
            className="table-collapse-width"
          />
          {headerCells}
        </KuiTableHeader>

        {tableBody}

      </KuiTable>
    );

    return (
      <div className={this.state.containerClassName}>
        {nestedTable}
      </div>
    );
  }

  /**
   * This function displays relevant messages / icons/ When
   * 1. Data is being fetched, It shows loading icon.
   * 2. When there is no data, It displays relevant message.
   * 3. When there is no search results for a search, it shows
   * relevant message.
   */
  renderPrompt() {
    if (this.state.isFetchingItems) {
      return <KuiListingTableLoadingPrompt />;
    }

    if (this.rows.length === 0) {
      if (this.state.filter) {
        return <KuiListingTableNoMatchesPrompt />;
      }

      return (
        <KuiEmptyTablePromptPanel>
          <KuiEmptyTablePrompt
            message="Looks like there is no data"
          />
        </KuiEmptyTablePromptPanel>
      );
    }

    return null;
  }

  // Render vunet table
  renderTable() {
    //
    if (this.props.metaItem.inverted) { return this.renderInverted(); }
    else if (this.props.metaItem.hasSubTable) { return this.renderNestedTable(); }
    else {
      return (<KuiListingTable
        pager={this.renderPager()}
        toolBarActions={this.renderToolBarActions()}
        selectedRowIds={this.state.selectedRowIds}
        rows={this.createRows()}
        header={this.renderHeader()}
        onFilter={this.filterItems}
        filter={this.state.filter}
        prompt={this.renderPrompt()}
        onItemSelectionChanged={this.onItemSelectionChanged}
        className="hideSelector"
      />
      );
    }
  }

  // Rendering final JSX of vunet table.
  render() {
    return (
      <div className={this.state.containerClassName}>

        {/* Display modal only for delete operation */}
        {this.state.showDeleteModal && this.renderConfirmDeleteModal()}
        <VunetModal
          showModal={this.state.showAddEditModal}
          data={this.state.formModal}
          onClose={this.onAddEditModalClose}
          onSubmit={this.onAddEditModalSubmit}
          clickOutsideToCloseModal={this.props.metaItem.clickOutsideToCloseModal}
        />

        {/* Render the table */}
        {this.renderTable()}
      </div>
    );
  }
}

VunetDataTable.propTypes = {
  deleteSelectedItems: PropTypes.func, // Delete call back(table level action)
  tableAction: PropTypes.func, // Table custom action callback
  rowAction: PropTypes.func, // Row level custom action
  fetchItems: PropTypes.func, // Fetch rows callback
  metaItem: PropTypes.object, // Additional meta
  tableType: PropTypes.string, // table-type to identify table
  onSubmit: PropTypes.func, // On from submit callback
  getAllEditData: PropTypes.func // function reference to get form wizard data.
};
