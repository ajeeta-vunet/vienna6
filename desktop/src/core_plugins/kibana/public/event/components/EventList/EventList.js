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
import PropTypes from 'prop-types';
import './EventList.less';
import { OperationBar } from '../OperationBar/OperationBar';
import Pagination from 'react-js-pagination';
import $ from 'jquery';
import _ from 'lodash';
// import { generateHeading } from '../../utils/vunet_format_name';
// import { Notifier } from 'ui/notify';
import { EventConsoleTable } from '../EventConsoleTable/EventConsoleTable';
import { SortEventsSidebar } from '../SortEventsSidebar/SortEventsSidebar';
import { produce } from 'immer';

// const notify = new Notifier({ location: 'Event Console' });

export class EventList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //events - used to store info of all events
      events: this.props.events,

      //eventsPerPage - count of how many events to show per page
      eventsPerPage: 10,

      //currentPage - used to store the active page number
      currentPage: 1,

      //filteredEventsList -
      filteredEventsList: this.props.events,

      //allFields - list of all fields (passed to ColumnSelector)
      allFields: this.props.allFields,

      //hiddenFields - list of hidden fields (passed to ColumnSelector)
      hiddenFields: this.props.hiddenFields,

      //showSortDetails - if true then display the sort details section
      showSortDetails: false,

      //sortItemsList - list of columns selected to sort the events.
      sortItemsList: [],
    };
  }

  componentDidMount() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  componentDidUpdate() {
    //this is to avoid redirection to homepage after click of the button in pagination component.
    $('.pagination li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      events: newProps.events,
      filteredEventsList: _.sortBy(newProps.events, function (o) {
        return o.fields.correlated_id;
      }),
      allFields: newProps.allFields,
      hiddenFields: newProps.hiddenFields,
    });
  }

  //convert sortItemsList to state variable.
  //direction 1 indicates ascending order, -1 indicates descending.
  sortByClickedField = (field) => {
    let sortItemsList = [];
    if (this.state.sortItemsList.find((sortItem) => sortItem.name === field)) {
      sortItemsList = produce(this.state.sortItemsList, (draft) => {
        draft.find((eachItem) => {
          if (field === eachItem.name) {
            eachItem.direction = eachItem.direction === 1 ? -1 : 1;
          }
        });
      });
    } else {
      if (this.state.sortItemsList.length < 3) {
        sortItemsList = produce(this.state.sortItemsList, (draft) => {
          draft.push({
            name: field,
            direction: 1,
          });
        });
      } else {
        sortItemsList = this.state.sortItemsList;
      }

    }
    this.sortEventsList(sortItemsList);
  };

  //The events will be sorted based on multiple selected columns as per the direction of each column
  sortEventsList = (sortItemsList) => {
    const newFilteredEventsList = produce(
      this.state.filteredEventsList,
      (draft) => {
        draft.sort(function (event1, event2) {
          let i = 0;
          let result = 0;
          while (i < sortItemsList.length && result === 0) {
            const compareResult = event1.fields[sortItemsList[i].name]
              .toString()
              .localeCompare(event2.fields[sortItemsList[i].name], undefined, {
                numeric: true,
              });
            result = sortItemsList[i].direction * compareResult;
            i++;
          }
          return result;
        });
      }
    );
    this.setState({
      filteredEventsList: newFilteredEventsList,
      sortItemsList,
      showSortDetails: true,
    });
  };

  //This removes all the sorting performed on the tables.
  clearAllSorting = () => {
    this.setState({
      filteredEventsList: _.sortBy(this.props.events, function (o) {
        return Date.parse(o.fields.last_occurence);
      }).reverse(),
      sortItemsList: [],
      showSortDetails: false,
    });
  };

  //This removes an column from sorting list and rearranges the sorting of events
  //based the remaining sorting columns
  removeSortItem = (field) => {
    const sortItemsList = produce(this.state.sortItemsList, (draft) => {
      return draft.filter((sortItem) => sortItem.name !== field);
    });

    if (sortItemsList.length > 0) {
      this.sortEventsList(sortItemsList);
    } else {
      const listOfSortItems = _.sortBy(this.props.events, function (o) {
        return o.fields.last_modified_time;
      });
      this.setState({
        filteredEventsList: listOfSortItems,
        sortItemsList,
      });
    }
  };

  //this function is called when filter button is clicked in the UI.
  //This will hide and un-hide the div under the filter button which contains the filter options.
  handleFilterSelectorDisplay = () => {
    const container = $('#filter-selector-id');
    container.show();

    function handleToggle(e) {
      if ($(e.target).closest('#filter-selector-id').length === 0) {
        $('#filter-selector-id').hide();
        $(document).unbind('click');
      }
    }

    $(document).on('click', function (e) {
      handleToggle(e);
    });
  };

  //this function is passed onto ColumnSelector to handle ColumnSelector updates.
  handleUpdateColumnSelector = (hiddenFields) => {
    this.props.updateColumnSelector(this.state.allFields, hiddenFields);
  };

  //this method is used to search for data in the event console tables.
  onSearch = (e) => {
    const searchString = e.target.value;
    if (searchString === '') {
      this.setState({ filteredEventsList: this.state.events });
    } else {
      //this.props.allEventList is used because it contains all events irrespective of thier status. According to requirement
      // when user performs a search operation the user should be able to see all assigned, closed and open events.
      const filteredEventsList =
        this.state.events &&
        this.state.events.filter((event) => {
          return this.state.allFields.some((key) => {
            if (event.fields[key]) {
              return event.fields[key]
                .toString()
                .toLowerCase()
                .includes(searchString.toString().toLowerCase());
            }
          });
        });
      this.setState({ filteredEventsList: filteredEventsList, currentPage: 1 });
    }
  };

  // This function will update the current page
  // when user changes the page using the pagination
  // UI
  handlePageChange = (currentPage) => {
    this.setState({ currentPage });
  };

  // Update the no of events in a page when
  // user changes the selection.
  updateEventsPerPage = (e) => {
    this.setState({ eventsPerPage: Number(e.target.value), currentPage: 1 });
  };

  //this method is called to open and close sort sidebar from operationBar component.
  hideAndUnhideSortbar = () => {
    this.setState({
      showSortDetails: !this.state.showSortDetails,
    });
  };

  render() {
    const { currentPage, eventsPerPage } = this.state;

    // Logic for displaying current events
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;

    const currentEvents =
      this.state.filteredEventsList &&
      this.state.filteredEventsList.slice(indexOfFirstEvent, indexOfLastEvent);

    const renderEventConsoleTable = () => {
      return (
        currentEvents && (
          <EventConsoleTable
            currentEvents={currentEvents}
            sortByClickedField={_.debounce(this.sortByClickedField, 1000)}
            hiddenFields={this.state.hiddenFields}
            canUpdateEvent={this.props.canUpdateEvent}
            itsmPreferencesEnabled={this.props.itsmPreferencesEnabled}
            createTicket={this.props.createTicket}
            userList={this.props.userList}
            fetchRawEvents={this.props.fetchRawEvents}
            allFields={this.state.allFields}
          />
        )
      );
    };

    const sortEventsSideBar = () => {
      return (
        <SortEventsSidebar
          columnsList={this.state.sortItemsList}
          clearAllSorting={this.clearAllSorting}
          sortByClickedField={this.sortByClickedField}
          removeSortItem={this.removeSortItem}
        />
      );
    };

    const totalItemsCount = this.state.filteredEventsList
      ? this.state.filteredEventsList.length
      : 0;

    return (
      <div className="event-list-container">
        <OperationBar
          allFields={this.state.allFields}
          hiddenFields={this.state.hiddenFields}
          handleFilterSelectorDisplay={this.handleFilterSelectorDisplay}
          handleColumnSelectorChange={this.props.handleColumnSelectorChange}
          handleUpdateColumnSelector={this.handleUpdateColumnSelector}
          onSearch={this.onSearch}
          eventConsoleMandatoryFields={this.props.eventConsoleMandatoryFields}
          filterFields={this.props.filterFields}
          selectedFilterFields={this.props.selectedFilterFields}
          handleFilterSelectorChange={this.props.handleFilterSelectorChange}
          addFilter={this.props.addFilter}
          filterStore={this.props.filterStore}
          exportEventsToCsv={this.props.exportEventsToCsv}
          hideAndUnhideSortbar={this.hideAndUnhideSortbar}
          showSortDetails={this.state.showSortDetails}
        />
        <div className="events-table-container">
          <div className="event-listing-wrapper">
            {this.state.showSortDetails && (
              <div className="event-sort-list-wrapper">
                {sortEventsSideBar()}
              </div>
            )}
            {currentEvents && currentEvents.length !== 0 && renderEventConsoleTable()}
            {currentEvents && currentEvents.length === 0 && (
              <div>
                <h3>No Events to Display</h3>
              </div>
            )}
          </div>
          <div className="pagination-container">
            <div className="view-all-events-container">
              <a
                className="view-all-events"
                onClick={() => this.props.showAllEvents()}
              >
                View all events
              </a>
            </div>
            <div className="pagination-component">
              <div className="pagination-count">
                <select
                  onChange={(e) => {
                    this.updateEventsPerPage(e);
                  }}
                  value={this.state.eventsPerPage}
                >
                  <option value="5"> 5 </option>
                  <option value="10"> 10 </option>
                  <option value="20"> 20 </option>
                  <option value="50"> 50 </option>
                  {/* <option value={totalItemsCount}> All </option> */}
                </select>
              </div>
              <Pagination
                hideDisabled
                activePage={this.state.currentPage}
                itemsCountPerPage={this.state.eventsPerPage}
                totalItemsCount={totalItemsCount}
                onChange={this.handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EventList.propTypes = {
  events: PropTypes.array,
  allEventList: PropTypes.array,
  allFields: PropTypes.array,
  hiddenFields: PropTypes.array,
  userList: PropTypes.object,
  updateColumnSelector: PropTypes.func,
  eventConsoleMandatoryFields: PropTypes.array,
};
