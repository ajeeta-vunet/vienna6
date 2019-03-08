
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
import $ from 'jquery';

import { Pager } from 'ui/pager';

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
      sortedColumn: 'title', //
      pageStartNumber: 1, // Holds the pagination start page.
      isFetchingItems: false, // A Loading icon is displayed when this
      // flag is set to 'true'.
      hasSubTable: false, // Flag to check if table row has a sub table
      editId: '', // Holds the id of the row on which operation is done.
      curEvent: '', // Holds the event when an operation is performed on rows
      formModal: {}, // Initialize the form modal object.
      containerClassName: 'vunet', // Specify a parent class for the container
      // holding the table
      showSubTable: 0 // Flag to display sub table for a row.
    };

    /* this.sortableProperties = new SortableProperties(
      [
        {
          name: 'title',
          getValue: item => item.title.toLowerCase(),
          isAscending: true,
        },
        {
          name: 'type',
          getValue: item => item.type.title.toLowerCase(),
          isAscending: true,
        }
      ],
      this.state.sortedColumn
    );*/

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

    if (!_.isUndefined(_.difference(newProps.metaItem.headers, this.props.metaItem.headers)[0]) ||
       (!_.isUndefined(newProps.metaItem.forceUpdate) && newProps.metaItem.forceUpdate)) {
      this.setState({ isFetchingItems: true });
      this.debouncedFetch();
    }

    let classname = 'vunet-table';

    // Hide the checkboxes in vunet table rows
    if(this.props.metaItem.selection !== undefined && !this.props.metaItem.selection) {
      classname += ' vunetHideSelector';
    }

    // Hide the search bar of vunet table
    if(this.props.metaItem.search !== undefined && !this.props.metaItem.search) {
      classname += ' vunetHideSearch';
    }
    this.setState({ containerClassName: classname });
  }

  /**
   * Calculate item per page for pagination
   */
  calculateItemsOnPage = () => {
    this.pager.setTotalItems(this.rows.length);
    const pageOfItems = this.rows.slice(this.pager.startIndex, this.pager.startIndex + this.pager.pageSize);
    this.setState({ pageOfItems, pageStartNumber: this.pager.startItem });
    if(this.state.filter) {
      this.filterItems(this.state.filter);
    }
  };

  /**
   * Deselect all at once by clicking on header selction checkbox
   */
  deselectAll = () => {
    this.setState({ selectedRowIds: [] });
  };

  //isAscending = (name) => this.sortableProperties.isAscendingByName(name);
  //getSortedProperty = () => this.sortableProperties.getSortedProperty();

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
    if(filter === '') {
      // If filter is being removed, just set the state and calculate Items on page
      this.setState({ filter }, () =>  this.calculateItemsOnPage());
    } else {
      this.setState({ filter });
      const pageOfItems = this.rows.filter(item => {
        return this.props.metaItem.rows.some(row => {
          if (!_.isArray(item[row]) && !_.isObject(item[row]) && !_.isEmpty(item[row]) && !_.isUndefined(item[row])) {
            if (_.isNumber(item[row])) {
              return item[row].toString().indexOf(filter) > -1 ? true : false;
            }
            return item[row].indexOf(filter) > -1 ? true : false;
          }
        });
      });
      this.pager.setTotalItems(pageOfItems.length);
      const _pageOfItems =  pageOfItems.slice(this.pager.startIndex, this.pager.startIndex + this.pager.pageSize);
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
    this.deselectAll();
    this.pager.nextPage();
    this.calculateItemsOnPage();
  };

  /**
   * Remove all selections and display the
   * previous page rows.
   */
  onPreviousPage = () => {
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
          <ReactTooltip/>
        </div>);
    });
  }

  //sortByTitle = () => this.sortOn('title');
  //sortByType = () => this.sortOn('type');

  /**
  * This function is used to create table headers for the vunet table.
  * If there are any row level actions allowed in table, we add an extra
  * column 'Action'.
  */
  renderHeader() {
    if ((this.props.metaItem.edit || (this.props.metaItem.rowAction && this.props.metaItem.rowAction.length > 0)) &&
      !this.props.metaItem.headers.includes('Action')) {
      this.props.metaItem.headers.push('Action');
    }
    return this.props.metaItem.headers && this.props.metaItem.headers.map((header, index) => {
      // If metaItem has help then returns header with help icon else returns only header.
      return ({ content: (this.props.metaItem.help && this.props.metaItem.help[index] !== '') ?
        <span>
          {header}
          <i className="fa fa-question-circle header-style" data-tip={this.props.metaItem.help[index]} data-for={`tooltip-${index}`}>
            <ReactTooltip id={`tooltip-${index}`} className="tool-tip-style"/>
          </i>
        </span> : header
      });
    });
  }

  /**
  * This function is used to render cells in vunet table.
  * A cell can be data value or any row action buttons.
  */
  renderRowCells(item) {
    const cells = [];
    this.props.metaItem.rows.forEach(row => {
      if(this.props.metaItem.columnData) {
        const columnData = this.props.metaItem.columnData.find(cd => cd.columnName === row);
        if(columnData) {
          cells.push({ value: columnData.func(row, item[row]) });
        } else {
          cells.push({ value: item[row] });
        }
      } else {
        cells.push({ value: item[row] });
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
        <span>{cell.value}</span>;
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
      const tableType = this.props.tableType ? this.props.tableType : '';
      this.props.deleteSelectedItems(rows, tableType)
        .then(() => this.fetchItems(this.state.filter))
        .catch(() => { })
        .then(() => this.deselectAll())
        .then(() => this.closeDeleteModal());
    }
  };

  // set selected rows
  onItemSelectionChanged = (newSelectedIds) => {
    // This has been done to highlight the selected row
    const rowsToRemoveHighlight = $('.kuiCheckBox').parent().parent().parent();
    rowsToRemoveHighlight.removeClass('row-highlight');
    const rowsToAddHighlight = $('.kuiCheckBox:checked').parent().parent().parent();
    rowsToAddHighlight.addClass('row-highlight');
    this.setState({ selectedRowIds: newSelectedIds });
  };

  /**
  * Open add modal with custom form defination
  */
  onCreate() {
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
    if(this.state.showSubTable === id) {
      this.setState({ showSubTable: 0 });
    } else {
      this.setState({ showSubTable: id });
    }
  }

  /**
  * Row level acction callback
  */
  onRowActionClick(event, rowId, inverted = false) {
    if (event === 'edit') {
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
    this.props.onSubmit(action, this.state.editId, event, tableType)
      .then((fetch) => fetch ? this.fetchItems(tableType) : '');
  }

  /**
  * Render table header action
  * create/delete will shown as icon on right-top
  * other custom action will placed with it to it and shown as button
  */
  renderToolBarActions() {
    let addDeleteAction = '';
    const tableAction = [];
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

    // Hide delete button for more than 1 rows selected.
    if (this.state.selectedRowIds.length > 1) {
      hideDeleteButton = true;
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
    return [
      ...tableAction,
      ...addDeleteAction,
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
  subTable(table, span) {
    return (
      <KuiTableRow key={table.type}>
        <KuiTableRowCell colSpan={span}>
          <VunetDataTable
            fetchItems={table.subTable.fetch}
            metaItem={table.subTable.meta}
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
    const headerCells = headers.map((headerCell) =>
      <KuiTableHeaderCell>{headerCell}</KuiTableHeaderCell>
    );

    const rows = this.createRows();

    const tableBody = rows.map((row) => {
      const hasSubTable = this.rows.find(item => item.type === row.id);
      // Add one to handle additional column for 'expand' / 'collapase' icon
      const colSpan = row.cells.length + 1;

      return  (
        <KuiTableBody>
          <KuiTableRow key={rows.id}>
            <KuiTableRowCell>
              <span
                key="expnder1"
                className="fa fa-plus"
                onClick={() => this.onSubTableToggle(row.id)}
              />
            </KuiTableRowCell>
            {row.cells.map(cell => <KuiTableRowCell>{cell} </KuiTableRowCell>)}
          </KuiTableRow>
          {hasSubTable && this.state.showSubTable === row.id && this.subTable(hasSubTable, colSpan) }
        </KuiTableBody>
      );
    });

    return (
      <KuiTable>
        <KuiTableHeader>
          <KuiTableHeaderCell style={{ width: '30px' }}>
            -
          </KuiTableHeaderCell>
          {headerCells}
        </KuiTableHeader>

        {tableBody}

      </KuiTable>
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
  onSubmit: PropTypes.func // On from submit callbcak
};
