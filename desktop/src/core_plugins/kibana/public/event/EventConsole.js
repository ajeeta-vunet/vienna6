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
import './EventConsole.less';
import { SeverityWidget } from './components/SeverityWidget/SeverityWidget';

import _ from 'lodash';
import { EventList } from './components/EventList/EventList';
import { produce } from 'immer';

import { EventConstants } from './event_constants';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'Event Console' });

export class EventConsole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      //allEventList - constains both closed and open events
      allEventList:
        this.props.listOfEvents && this.props.listOfEvents.List_of_events,

      // filteredEventList - List of events with filters applied.
      filteredEventList:
        this.props.listOfEvents && this.props.listOfEvents.List_of_events,

      // severityInfo - count of all events based on severiy without any filters.
      severityInfo: this.props.severityInfo,

      // filteredSeverityInfo - count of all events with filters.
      filteredSeverityInfo: this.props.severityInfo,

      // filterStore - An object which holds all the filters based on different fields.
      filterStore: {},

      //allFields - list of all the fields of events that can be displayed in EventItem.
      allFields:
        this.props.columnSelectorInfo && this.props.columnSelectorInfo.alert_details.fields,

      //hiddenFields - list of all the variables that are to be hidden in each Event Item UI.
      hiddenFields:
        this.props.columnSelectorInfo && this.props.columnSelectorInfo.alert_details.hidden_fields,
    };
  }

  componentWillReceiveProps(newProps) {

    this.setState({
      severityInfo: newProps.severityInfo,
      filteredSeverityInfo: newProps.severityInfo,

      allEventList: _.sortBy(
        newProps.listOfEvents && newProps.listOfEvents.List_of_events,
        function (o) {
          return o.fields.correlated_id;
        }
      ),

      filteredEventList: _.sortBy(
        newProps.listOfEvents && newProps.listOfEvents.List_of_events,
        function (o) {
          return o.fields.correlated_id;
        }
      ),
      allFields: newProps.columnSelectorInfo.alert_details.fields,
      hiddenFields: newProps.columnSelectorInfo.alert_details.hidden_fields
    });
  }

  // In this function we use the filterStore object and
  // update the data passed to 'SeverityWidget' and 'EventList'
  // components based on filters applied by the user. This function receives filterField and
  // filterValue. If the corresponding field and value is present in filterStore, it will be removed.
  // Else it will be added to filterStore.
  addFilter = (filterField, filterValue) => {
    let updatedfilterStore = {};
    // Check if filter with 'filterField' exists in filterStore.
    if (_.has(this.state.filterStore, filterField)) {
      // Check if filtered value exists in the array of filters
      const filterValueIndex = this.state.filterStore[filterField].indexOf(
        filterValue
      );
      // If filterValue exists remove it as user is clicking on the same widget
      // for the second time.
      if (filterValueIndex > -1 && filterField === 'severity') {
        updatedfilterStore = produce(this.state.filterStore, (draft) => {
          draft[filterField].splice(filterValueIndex, 1);
          //Delete property if there are no filters to be applied on this property
          if(draft[filterField].length === 0) delete draft[filterField];
        });
        // If filterValue does not exist, add it as user is clicking on the same widget
        // for the first time.
      } else {
        updatedfilterStore = produce(this.state.filterStore, (draft) => {
          draft[filterField].push(filterValue);
        });
      }
      // If 'filterField' does not exist in filterStore, add it and update the
      // filterValue in its array.
    } else {
      updatedfilterStore[filterField] = [filterValue];
    }
    this.setState({ filterStore: updatedfilterStore }, () => {
      this.applyFilters();
    });
  };

  // This function is called when the filterStore is updated by addition or deletion of a filterField.
  // This will filter the events based on the filterField and it's corresponding values and update the
  // filteredEventList which will case the EventList component to re-render and show only the filtered events.
  applyFilters = function () {
    const filterStore = this.state.filterStore;
    let newEventList = [];
    if (!(_.isEmpty(filterStore))) {
      let newSeverityInfo = {};

      // Update the severity widgets with filters applied by the user.
      newSeverityInfo = produce(this.state.severityInfo, (draft) => {
        let totalNew = 0;
        let totalWip = 0;

        // Update the values of severity widget based on filters
        // applied by the user.
        // Example: If severity filter 'critical' is applied, Update
        // the 'Total' widget count to reflect only 'critial' events count.
        EventConstants.SEVERITY_TYPES.map((severity) => {
          if (filterStore.severity && filterStore.severity.includes(severity)) {
            totalNew = totalNew + draft['Time-Periods'][0][severity].new;
            totalWip = totalWip + draft['Time-Periods'][0][severity].wip;
            draft['Time-Periods'][0].total.new = totalNew;
            draft['Time-Periods'][0].total.wip = totalWip;
          } else {
            draft['Time-Periods'][0][severity].new = 0;
            draft['Time-Periods'][0][severity].wip = 0;
          }
        });
      });
      //Filter events based on the filter values present in filterStore.
      for(const filterField in filterStore) {
        if(filterStore.hasOwnProperty(filterField)) {
          const eventList = this.state.allEventList.filter((event) => {
            return filterStore[filterField].includes(event[filterField]) > 0;
          });
          newEventList = newEventList.concat(eventList);
        }
      }

      this.setState({
        filteredSeverityInfo: newSeverityInfo,
        filteredEventList: newEventList,
      });
    } else {
      this.setState({
        filteredSeverityInfo: this.state.severityInfo,
        filteredEventList: this.state.allEventList,
      });
    }
  };

  // This function is called to clear all the filters and display all events in Event Console page.
  showAllEvents = () => {
    // eslint-disable-next-line no-console
    window.location.href = '/app/vienna#/event';
    this.setState({
      filteredSeverityInfo: this.props.severityInfo,
      filteredEventList: this.state.allEventList,
      filterStore: {}
    }, () => notify.info('Showing all Events'));
  }

  //this function is added to sync state variables and put request contents
  updateColumnSelector = (allFields, hiddenFields) => {
    this.setState({ allFields: allFields, hiddenFields: hiddenFields });
    this.props.updateColumnSelector(allFields, hiddenFields);
  }

  render() {
    return (
      <div className="event-console-wrapper">
        <SeverityWidget
          severityInfo={this.state.filteredSeverityInfo}
          filterBySeverity={this.addFilter}
          appliedSeverityList={this.state.filterStore.severity}
        />
        <EventList
          events={this.state.filteredEventList}
          allEventList={this.state.allEventList}
          userList={this.props.userList}
          allFields={this.state.allFields}
          hiddenFields={this.state.hiddenFields}
          updateColumnSelector={this.updateColumnSelector}
          eventConsoleMandatoryFields={this.props.eventConsoleMandatoryFields}
          showAllEvents={this.showAllEvents}
        />
      </div>
    );
  }
}

EventConsole.propTypes = {
  severityInfo: PropTypes.object,
  listOfEvents: PropTypes.object,
  columnSelectorInfo: PropTypes.object,
  updateColumnSelector: PropTypes.func,
  userList: PropTypes.object,
  eventConsoleMandatoryFields: PropTypes.array
};
