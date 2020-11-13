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
import { EventItem } from '../EventItem/EventItem';
import { OperationBar } from '../OperationBar/OperationBar';
import Pagination from 'react-js-pagination';
import $ from 'jquery';
import _ from 'lodash';

export class EventList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //events - used to store info of all events
      events: this.props.events,

      //eventsPerPage - count of how many events to show per page
      eventsPerPage: 4,

      //currentPage - used to store the active page number
      currentPage: 1,

      //filteredEventsList -
      filteredEventsList: this.props.events,

      //sortKey - used to store which field was used to sort the events
      sortKey: '',

      //lastSortOrder - used to store which order the last sort was done in. ascending/descending
      lastSortOrder: '',

      //allFields - list of all fields (passed to ColumnSelector)
      allFields: this.props.allFields,

      //hiddenFields - list of hidden fields (passed to ColumnSelector)
      hiddenFields: this.props.hiddenFields,
    };
  }

  componentDidMount() {
    this.updateFieldDisplay();
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

  sortByClickedField = (field) => {
    let newEvents = this.state.filteredEventsList;
    newEvents = _.sortBy(newEvents, function (o) {
      if (field === 'event_id') {
        return parseInt(o.fields[field]);
      }
      if (field === 'created_time' || field === 'last_modified_time') {
        return Date.parse(o.fields[field]);
      }
      return o.fields[field];
    });
    if (
      this.state.lastSortOrder === '' ||
      this.state.lastSortOrder === 'Descending'
    ) {
      this.setState({ lastSortOrder: 'Ascending' });
    } else if (field === this.state.sortKey) {
      newEvents.reverse();
      this.setState({ lastSortOrder: 'Descending' });
    }
    this.setState({ filteredEventsList: newEvents });
    this.setState({ sortKey: field });
  };

  //This function traverses through the allFields and hiddenFields arrays
  //to add show or hide classes respectively.
  updateFieldDisplay = () => {
    // Show the fields that are selected in the
    // column selector UI.
    this.state.allFields &&
      this.state.allFields.map((field) => {
        if (field !== '@timestamp') {
          // Get an element from multiple classes. Here
          // we get the element containing the field to be shown
          // and add a class to show the item.
          const className = '.detail-item.' + field;
          $(className).addClass('detail-item-show');
        }
      });

    // Show the fields that are selected in the
    // column selector UI.
    this.state.hiddenFields &&
      this.state.hiddenFields.map((field) => {
        if (field !== '@timestamp') {
          // Get an element from multiple classes. Here
          // we get the element containing the field to be hidden
          // and add a class to hide the item
          const className = '.detail-item.' + field;
          $(className).removeClass('detail-item-show');
          $(className).addClass('detail-item-hide');
        }
      });
  };

  //Used for the initial load of ColumnSelector.
  //It will check/uncheck based on the allFields and hiddenFields
  handleColumnSelectorDisplay = () => {
    this.state.allFields &&
      this.state.allFields.map((field) => {
        document.getElementById(field).checked = true;
      });
    this.state.hiddenFields &&
      this.state.hiddenFields.map((field) => {
        document.getElementById(field).checked = false;
      });
    const container = $('#column-selector-id');
    container.show();

    function handleToggle(e) {
      if ($(e.target).closest('#column-selector-id').length === 0) {
        $('#column-selector-id').hide();
        $(document).unbind('click');
      }
    }

    $(document).on('click', function (e) {
      handleToggle(e);
    });
  };

  //this receives the field name checked/unchecked by column selector and acts on it.
  //it will add the hide/show class to clicked field.
  handleColumnSelectorChange = (field) => {
    let newHiddenFields = this.state.hiddenFields;
    const value = document.getElementById(field).checked;
    if (value === true) {
      newHiddenFields = newHiddenFields.filter((f) => f !== field);
      const className = '.detail-item.' + field;
      $(className).removeClass('detail-item-hide');
      $(className).addClass('detail-item-show');
    } else {
      if (!newHiddenFields.includes(field)) {
        newHiddenFields.push(field);
        newHiddenFields.map((field) => {
          const className = '.detail-item.' + field;
          $(className).addClass('detail-item-hide');
          $(className).removeClass('detail-item-show');
        });
      }
    }
    this.setState({
      hiddenFields: newHiddenFields,
    });
  };

  //this function is passed onto ColumnSelector to handle ColumnSelector updates.
  handleUpdateColumnSelector = () => {
    this.props.updateColumnSelector(
      this.state.allFields,
      this.state.hiddenFields
    );
  };

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
      this.setState({ filteredEventsList: filteredEventsList });
    }
  };

  handlePageChange = (currentPage) => {
    this.setState({ currentPage });
  };

  render() {
    const { currentPage, eventsPerPage } = this.state;

    // Logic for displaying current events
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents =
      this.state.filteredEventsList &&
      this.state.filteredEventsList.slice(indexOfFirstEvent, indexOfLastEvent);

    const renderEvents =
      currentEvents &&
      currentEvents.map((event, index) => {
        return (
          <span key={index}>
            <EventItem
              event={event}
              userList={this.props.userList}
              getClickedField={this.sortByClickedField}
            />
          </span>
        );
      });

    const totalItemsCount = this.state.filteredEventsList
      ? this.state.filteredEventsList.length
      : 0;

    return (
      <div className="event-list-wrapper">
        <OperationBar
          allFields={this.state.allFields}
          hiddenFields={this.state.hiddenFields}
          handleColumnSelectorDisplay={this.handleColumnSelectorDisplay}
          handleColumnSelectorChange={this.handleColumnSelectorChange}
          handleUpdateColumnSelector={this.handleUpdateColumnSelector}
          onSearch={this.onSearch}
          eventConsoleMandatoryFields={this.props.eventConsoleMandatoryFields}
        />
        <div className="events-wrapper">
          <div className="event-listing-wrapper">
            {renderEvents}
            {currentEvents && currentEvents.length === 0 && (
              <div>
                <h3>No Events to Display</h3>
              </div>
            )}
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
    );
  }
}

EventList.propTypes = {
  events: PropTypes.object,
  allFields: PropTypes.object,
  hiddenFields: PropTypes.object,
  updateColumnSelector: PropTypes.func,
};
