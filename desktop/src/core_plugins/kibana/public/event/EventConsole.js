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

import { Notifier } from 'ui/notify';
import $ from 'jquery';

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
      severityInfo: {},

      // filteredSeverityInfo - count of all events with filters.
      filteredSeverityInfo: {},

      // filterStore - An object which holds all the filters based on different fields.
      //{ status: ['assigned', 'open'] } is assigned as we do not want to show closed events by default.
      filterStore: { status: ['assigned', 'open'] },

      //allFields - list of all the fields of events that can be displayed in EventItem.
      allFields:
        this.props.columnSelectorInfo &&
        this.props.columnSelectorInfo.alert_details.fields,

      //hiddenFields - list of all the variables that are to be hidden in each Event Item UI.
      hiddenFields:
        this.props.columnSelectorInfo &&
        this.props.columnSelectorInfo.alert_details.hidden_fields,

      //selectedFilterFields - list of selected filter fields.
      //'status' is added to support the status added in 'filterStore'.
      selectedFilterFields: ['status'],
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState(
      {

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
        hiddenFields: newProps.columnSelectorInfo.alert_details.hidden_fields,
      },
      () => this.applyFilters()
    );
  }

  //this receives the field name checked/unchecked by column selector and acts on it.
  //it will add the hide/show class to clicked field.
  handleFilterSelectorChange = (filterField) => {
    // eslint-disable-next-line prefer-const
    let filterFields = [...this.state.selectedFilterFields];
    const filterIndex = filterFields.indexOf(filterField);
    if(filterIndex > -1) {
      filterFields.splice(filterIndex, 1);
    }
    else{
      filterFields.push(filterField);
    }
    this.setState({ selectedFilterFields: filterFields });
  };

  // In this function we use the filterStore object and
  // update the data passed to 'SeverityWidget' and 'EventList'
  // components based on filters applied by the user. This function receives filterField and
  // filterValue. If the corresponding field and value is present in filterStore, it will be removed.
  // Else it will be added to filterStore.
  addFilter = (filterField, filterValue) => {
    let updatedfilterStore = this.state.filterStore;
    // Check if filter with 'filterField' exists in filterStore and filterValue received is not empty.
    //If filterValue is empty then the 'cancel' filter button is clicked.
    if (_.has(this.state.filterStore, filterField) && filterValue !== '') {
      // Check if filtered value exists in the array of filters
      const filterValueIndex = this.state.filterStore[filterField].indexOf(
        filterValue
      );

      // If filterValue exists remove it as user is clicking on the same widget
      // for the second time.
      if (filterValueIndex > -1) {
        updatedfilterStore = produce(this.state.filterStore, (draft) => {
          draft[filterField].splice(filterValueIndex, 1);
          //Delete property if there are no filters to be applied on this property
          if (draft[filterField].length === 0) delete draft[filterField];
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
    } else if(filterValue !== '') {
      updatedfilterStore = produce(this.state.filterStore, (draft) => {
        draft[filterField] = [filterValue];
      });
    }
    else {
      this.handleFilterSelectorChange(filterField);
      updatedfilterStore = produce(this.state.filterStore, (draft) => {
        delete draft[filterField];
      });
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
    let newEventList = this.state.allEventList;

    if (!_.isEmpty(filterStore)) {
      const filterKeys = Object.keys(filterStore);
      newEventList =  newEventList.filter(function (event) {
        return filterKeys.every(function (filterKey) {
          return filterStore[filterKey].includes(event.fields[filterKey]);
        });
      });

      this.setState(
        {
          filteredEventList: newEventList,
        },
        () => this.calculateSeverityCount()
      );
    } else {
      this.setState(
        {
          filteredEventList: this.state.allEventList,
        },
        () => this.calculateSeverityCount()
      );
    }
  };

  calculateSeverityCount = () => {
    //calculate severity count

    const severityCount = {
      critical: {
        new: 0,
        wip: 0,
      },
      error: {
        new: 0,
        wip: 0,
      },
      warning: {
        new: 0,
        wip: 0,
      },
      information: {
        new: 0,
        wip: 0,
      },
      total: {
        new: 0,
        wip: 0,
      },
    };

    //if event is unassigned then it is considered as a 'New' event and is counted under new events.
    //if event is assigned to any user, then it is considered as a WIP(work-in-progress) event and counted under WIP events.
    this.state.filteredEventList &&
      this.state.filteredEventList.map((event) => {
        if (event.fields.assignee === 'Unassigned') {
          severityCount[event.fields.severity].new += 1;
          severityCount.total.new += 1;
        } else {
          severityCount[event.fields.severity].wip += 1;
          severityCount.total.wip += 1;
        }
      });
    this.setState({ filteredSeverityInfo: severityCount }, () => this.updateSeverityCheckbox());
  };

  //This is done to make sure the changes to SeverityWidget is refelcted under the Severity filter as well.
  //For example if the severity filter is selected from under the filter button and a severity widget is selected
  //the severity should be checked under the severity fuilter as well.
  updateSeverityCheckbox = () => {
    const severityFilter = this.state.filterStore && this.state.filterStore.severity;
    let severityFilterFields = this.props.filterFields && this.props.filterFields.severity;
    if(severityFilter) {
      severityFilter.map((field) => {
        const severity = document.getElementById(field);
        severity && (severity.checked = true);
      });

      severityFilterFields = severityFilterFields.filter((field) => {
        return !severityFilter.includes(field);
      });
    }

    severityFilterFields && severityFilterFields.map((field) => {
      const severity = document.getElementById(field);
      severity && (severity.checked = false);
    });
  }

  //this function is added to sync state variables and put request contents
  updateColumnSelector = (allFields, hiddenFields) => {
    this.setState({ allFields: allFields, hiddenFields: hiddenFields });
    this.props.updateColumnSelector(allFields, hiddenFields);
  };

  //this receives the field name checked/unchecked by column selector and acts on it.
  //it will add the hide/show class to clicked field.
  handleColumnSelectorChange = (field) => {
    let newHiddenFields = this.state.hiddenFields;
    field = field.replace(/[^a-zA-Z-_]+/g, '');
    const value = document.getElementById('edit-' + field).checked;
    if (value === true) {
      newHiddenFields = newHiddenFields.filter((f) => f !== field);
      const className = '.detail-item.' + field;
      $(className).removeClass('detail-item-hide');
      $(className).addClass('detail-item-show');
    } else {
      if (!newHiddenFields.includes(field)) {
        newHiddenFields.push(field);
        newHiddenFields.map((field) => {
          field = field.replace(/[^a-zA-Z-_]+/g, '');
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

  //this method is called to generate report of all the events as displyed on the screen.
  exportEventsToCsv = () => {
    // format the data
    const fields = this.state.filteredEventList && this.state.filteredEventList.map(event => ({ ...event.fields }));

    const dataToExport = produce(fields, (draft) => {
      draft.map((field) => {
        this.state.hiddenFields.map((hiddenField) => {
          delete field[hiddenField];
        });
      });
      return draft;
    });
    const data = Object.values(dataToExport);
    const headers = Object.keys(dataToExport[0]);
    data ? this.exportCSVFile(headers, data, 'eventsReport') : ''; // call the exportCSVFile() function to process the JSON and trigger the download
  }

  //this method is called to create and download the report.
  //receives headers, items and fileTitle as arguments using which report is built and downloaded.
  exportCSVFile = (headers, items, fileTitle) => {
    if (headers) {
      items.unshift(headers);
    }

    // Convert Object to JSON
    const jsonObject = JSON.stringify(items);

    const array = typeof objArray !== 'object' ? JSON.parse(jsonObject) : jsonObject;

    let csv = '';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line !== '') line += ',';

        line += array[i][index];
      }

      csv += line + '\r\n';
    }

    const exportedFilename = fileTitle + '.csv';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const saveAs = require('@elastic/filesaver').saveAs;
    saveAs(blob, exportedFilename);
  }

  // This function is called to clear all the filters and display all events in Event Console page.
  showAllEvents = () => {
    window.location.href = '/app/vienna#/event';
    this.setState(
      {
        filteredEventList: this.state.allEventList,
        filterStore: {},
      },
      () => notify.info('Showing all Events')
    );
  };

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
          filterFields={this.props.filterFields}
          allFields={this.state.allFields}
          hiddenFields={this.state.hiddenFields}
          updateColumnSelector={this.props.updateColumnSelector}
          handleColumnSelectorChange={this.handleColumnSelectorChange}
          eventConsoleMandatoryFields={this.props.eventConsoleMandatoryFields}
          showAllEvents={this.showAllEvents}
          addFilter={this.addFilter}
          canUpdateEvent={this.props.canUpdateEvent}
          filterStore={this.state.filterStore}
          handleFilterSelectorChange={this.handleFilterSelectorChange}
          selectedFilterFields={this.state.selectedFilterFields}
          exportEventsToCsv={this.exportEventsToCsv}
        />
      </div>
    );
  }
}
EventConsole.propTypes = {
  listOfEvents: PropTypes.object,
  columnSelectorInfo: PropTypes.object,
  updateColumnSelector: PropTypes.func,
  userList: PropTypes.object,
  eventConsoleMandatoryFields: PropTypes.array,
};
