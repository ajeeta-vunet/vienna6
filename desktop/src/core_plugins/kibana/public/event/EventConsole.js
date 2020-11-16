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
import produce from 'immer';

import { EventConstants } from './event_constants';

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
    });
  }

  // In this function we use the filterStore object and
  // update the data passed to 'SeverityWidget' and 'EventList'
  // components based on filters applied by the user.
  applySeverityFilters = function () {
    const appliedSeverityList = this.state.filterStore.severity;
    if (appliedSeverityList.length) {
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
          if (appliedSeverityList.includes(severity)) {
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

      // Update the eventlist with filters applied by the user
      const newEventList = this.state.allEventList.filter((event) => {
        return appliedSeverityList.includes(event.severity) > 0;
      });

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

  // This function gets called when user clicks on any of the
  // severity widgets. In this function we update the filterStore object
  // with filter field and filter values for the same. Example filterStore
  // format is as shown below:
  // {
  //   severity:['critical', 'warning']
  // }
  // Every the user clicks on the severity widgets we update the filterStore
  // accordingly and save it in EventConsole component's local state.
  filterBySeverity = (filterValue) => {
    let updatedfilterStore = {};

    // Check if key 'severity' exists in filterStore.
    if (_.has(this.state.filterStore, 'severity')) {
      // Check if filtered value exists in the array of filters for severity
      const filterValueIndex = this.state.filterStore.severity.indexOf(
        filterValue
      );

      // If filterValue exists remove it as user is clicking on the same widget
      // for the second time.
      if (filterValueIndex > -1) {
        updatedfilterStore = produce(this.state.filterStore, (draft) => {
          draft.severity.splice(filterValueIndex, 1);
        });

        // If filterValue does not exist, add it as user is clicking on the same widget
        // for the first time.
      } else {
        updatedfilterStore = produce(this.state.filterStore, (draft) => {
          draft.severity.push(filterValue);
        });
      }
      // If key 'severity' does not exist in filterStore, add it and update the
      // filterValue in its array.
    } else {
      updatedfilterStore.severity = [filterValue];
    }
    this.setState({ filterStore: updatedfilterStore }, () => {
      this.applySeverityFilters();
    });
  };

  render() {
    return (
      <div className="event-console-wrapper">
        <SeverityWidget
          severityInfo={this.state.filteredSeverityInfo}
          filterBySeverity={this.filterBySeverity}
          appliedSeverityList={this.state.filterStore.severity}
        />
        <EventList
          events={this.state.filteredEventList}
          allEventList={this.state.allEventList}
          userList={this.props.userList}
          allFields={
            this.props.columnSelectorInfo &&
            this.props.columnSelectorInfo.alert_details.fields
          }
          hiddenFields={
            this.props.columnSelectorInfo &&
            this.props.columnSelectorInfo.alert_details.hidden_fields
          }
          updateColumnSelector={this.props.updateColumnSelector}
          eventConsoleMandatoryFields={this.props.eventConsoleMandatoryFields}
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
};