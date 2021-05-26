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
import './CorrelatedAlerts.less';
import { generateHeading } from '../../../utils/vunet_format_name';
import $ from 'jquery';
import _ from 'lodash';

export class CorrelatedAlerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //listOfRelatedEvents - used to hold the list of all events fetched under a correlated id.
      listOfRelatedEvents: [],
      //correlationId - used to hold the correlated id which will be used to fetch the list
      //of correlated events under it.
      correlationId: this.props.correlationId,
      //searchedRelatedEvents - used to store the list of events after searched function.
      searchedRelatedEvents: [],
      //loadingFlag - used to display the loading text when the API call is made
      loadingFlag: true,
      //lastSortOrder - used to store which order the last sort was done in. ascending/descending
      lastSortOrder: '',
      //sortKey - used to store which field was used to sort the events
      sortKey: '',
    };
  }

  componentDidMount() {
    this.props.fetchRawEvents(this.props.correlationId).then((data) => {
      this.setState({
        listOfRelatedEvents: data.List_of_raw_events,
        searchedRelatedEvents: data.List_of_raw_events,
        loadingFlag: false,
      });
    });
  }

  //this method is called when the search input box is clicked to hide the placeholder text.
  hidePlaceholder = () => {
    $('input').focus(function () {
      $(this).removeAttr('placeholder');
    });
  };

  //this method is called bring back the placeholder text when the user clicks outside search box after clicking inside it once.
  showPlaceholder = () => {
    $('input').blur(function () {
      $(this).attr('placeholder', 'search');
    });
  };

  //this method is called when the search functionality is invoked.
  onSearch = (e) => {
    const searchString = e.target.value;
    if (searchString === '') {
      this.setState({ searchedRelatedEvents: this.state.listOfRelatedEvents });
    } else {
      //this.props.allEventList is used because it contains all events irrespective of thier status. According to requirement
      // when user performs a search operation the user should be able to see all assigned, closed and open events.
      const searchedRelatedEvents =
        this.state.listOfRelatedEvents &&
        this.state.listOfRelatedEvents.filter((event) => {
          return this.props.allFields.some((key) => {
            if (event.fields[key]) {
              return event.fields[key]
                .toString()
                .toLowerCase()
                .includes(searchString.toString().toLowerCase());
            }
          });
        });
      this.setState({ searchedRelatedEvents: searchedRelatedEvents });
    }
  };

  //this function is called each time a field is clicked and sorting action should be carried out
  //based on the field clicked.
  sortByClickedField = (field) => {
    let newEvents = this.state.searchedRelatedEvents;
    //The lodash sortBy does not work properly with aphanumeric text, so we use JS localCompare
    //to sort the fields with Alphanumeric values.
    if (
      field === 'alert_id' ||
      field === 'created_time' ||
      field === 'last_modified_time' ||
      field === 'last_occurence' ||
      field === 'similar_events_count' ||
      field === 'active_duration' ||
      field === 'total_duration'
    ) {
      newEvents = _.sortBy(newEvents, function (o) {
        if (
          field === 'alert_id' ||
          field === 'active_duration' ||
          field === 'total_duration'
        ) {
          return parseInt(o.fields[field]);
        } else if (
          field === 'created_time' ||
          field === 'last_modified_time' ||
          field === 'last_occurence'
        ) {
          return Date.parse(o.fields[field]);
        }
        return o.fields[field];
      });
    } else {
      newEvents = newEvents
        .slice()
        .sort((a, b) =>
          a.fields[field].localeCompare(b.fields[field], undefined, {
            numeric: true,
          })
        );
    }
    if (
      this.state.lastSortOrder === '' ||
      this.state.lastSortOrder === 'Descending'
    ) {
      this.setState({ lastSortOrder: 'Ascending' });
    } else if (field === this.state.sortKey) {
      newEvents.reverse();
      this.setState({ lastSortOrder: 'Descending' });
    }
    this.setState({
      searchedRelatedEvents: newEvents,
      sortKey: field,
    });
  };

  //this function is used to reender a correlated table.
  renderCorrelatedTable = () => {
    return Object.keys(this.state.searchedRelatedEvents).map((key) => {
      const severity = this.state.searchedRelatedEvents[key].fields.severity;
      return (
        <div key={key} className="row correlated-events-table-row">
          <div className="severity-div">
            <div className={`rectangle ${severity}`} />
          </div>
          {Object.entries(this.state.searchedRelatedEvents[key].fields).map(
            ([key1, value]) => {
              if (key1 === 'summary') {
                return (
                  <div
                    key={value + key1}
                    className="correlated-details-value"
                    style={{ width: '60rem' }}
                  >
                    {value}
                  </div>
                );
              }
              return (
                <div key={value + key1} className="correlated-details-value">
                  {value}
                </div>
              );
            }
          )}
        </div>
      );
    });
  };

  render() {
    if (this.state.loadingFlag) {
      return <div className="loading-correlated-events">Loading...</div>;
    } else {
      return (
        <div className="correlated-events-container">
          {this.state.searchedRelatedEvents && this.state.searchedRelatedEvents.length ? (
            <div className="correlated-events-table">
              <div className="search-container ">
                <input
                  onChange={(e) => this.onSearch(e)}
                  type="text"
                  id="search-input"
                  placeholder="search"
                  onFocus={() => this.hidePlaceholder()}
                  onBlur={() => this.showPlaceholder()}
                />
              </div>
              <div className="row correlated-events-table-header">
                <div className="severity-div">
                  <div className={`rectangle`} />
                </div>
                {Object.keys(this.state.searchedRelatedEvents[0].fields).map(
                  (key) => {
                    if (key === 'summary') {
                      return (
                        <div
                          className="correlated-details-header"
                          style={{ width: '60rem' }}
                          onClick={() => this.sortByClickedField(key)}
                        >
                          <i className="fa fa-sort-amount-desc sort-icon" />
                          {generateHeading(key)}
                        </div>
                      );
                    }
                    return (
                      <div
                        className="correlated-details-header"
                        onClick={() => this.sortByClickedField(key)}
                      >
                        <i className="fa fa-sort-amount-desc sort-icon" />
                        {generateHeading(key)}
                      </div>
                    );
                  }
                )}
              </div>
              {this.renderCorrelatedTable()}
            </div>
          ) : (
            <div className="correlated-event-no-data">
              No Correlated Alerts available for this event
            </div>
          )}
        </div>
      );
    }
  }
}
