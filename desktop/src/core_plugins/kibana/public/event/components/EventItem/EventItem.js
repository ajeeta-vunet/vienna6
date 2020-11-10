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
import './EventItem.less';
import { EventDetails } from './EventDetails/EventDetails';
import chrome from 'ui/chrome';
import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import moment from 'moment-timezone';
import { EventHistory } from './EventHistory/EventHistory';
import update from 'immutability-helper';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'Event Console' });

export class EventItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      details: {},
      currentTabId: 'alert-details',
      event: this.props.event,
    };
    this.fetchEventDetails = this.fetchEventDetails.bind(this);
    this.handleMoreDetails = this.handleMoreDetails.bind(this);
    this.secondsToHms = this.secondsToHms.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleUpdateEvent = this.handleUpdateEvent.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.updateEventDetails = this.updateEventDetails.bind(this);

    this.tabs = [
      {
        id: 'alert-details',
        name: 'Alert Details',
      },
      {
        id: 'history',
        name: 'History',
      },
    ];

    this.landingTab = 'alert-details';
  }

  //This function is used to update the assignee, status, and add a new note to an event.
  updateEventDetails = (eventId, assignee, status, noteText) => {
    let urlBase = chrome.getUrlBase();
    urlBase = urlBase + '/events_of_interest/individual_event/' + eventId + '/';
    const currentUser = chrome.getCurrentUser();
    const username = currentUser[0];
    const d = new Date();
    const toSend = {
      assignee: assignee,
      status: status,
    };

    if (noteText !== '') {
      const notes = [
        {
          author: username,
          text: noteText,
          timestamp: d.toLocaleString('en-IN').replace(/\//g, '-'),
        },
      ];
      toSend.notes = notes;
    }

    fetch(urlBase, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSend),
    }).then(() => {
      const updatedEvent = update(this.state.event, {
        fields: { assignee: { $set: assignee }, status: { $set: status } },
      });
      this.setState({ event: updatedEvent });

      let updatedDetails = '';
      if (noteText !== '') {
        updatedDetails = update(this.state.details, {
          alert_details: { fields: { notes: { $push: [toSend.notes[0]] } } },
        });
        this.setState({ details: updatedDetails });
      }
      notify.info('Event has been updated successfully');
    });
  };

  //this function is used to handle the tab changes.
  onTabChange = (id) => {
    this.setState({
      currentTabId: id,
    });
  };

  //this function is called each time a field is clicked.
  handleClickedField(field) {
    this.props.getClickedField(field);
  }

  //this function is used to fetch the details of an individual event.
  fetchEventDetails = (id) => {
    let urlBase = chrome.getUrlBase();
    urlBase = urlBase + `/events_of_interest/individual_event/${id}`;
    fetch(urlBase)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ details: data }, () => {
          this.setState({ showDetails: true });
        });
      });
  };

  //this function is called everytime the more details button is pressed.
  //if showDetails is false, it will call fetchEventDetails,
  //otherwise it will simply toggle showDetails
  handleMoreDetails = () => {
    if (this.state.showDetails === false) {
      this.fetchEventDetails(this.state.event.id);
    } else {
      this.setState({ showDetails: !this.state.showDetails });
    }
  };

  //this function calls the main updateEventDetails function
  //this function is passed to EventDetails.
  handleUpdateEvent = (eventId, assignee, status, comment) => {
    this.updateEventDetails(eventId, assignee, status, comment);
  };

  //a simple function to convert time in seconds to hours, minutes and seconds as a string
  secondsToHms = (d) => {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    const hDisplay =
      h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '0 hours, ';
    const mDisplay =
      m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '0 minutes, ';
    const sDisplay =
      s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '0 seconds';
    return hDisplay + mDisplay + sDisplay;
  };

  //this function is passed to EventDetails, so that it can set showDetails to false
  //when the cancel button is pressed.
  handleCancel = () => {
    this.setState({ showDetails: false });
  };

  render() {
    const eventDisplay = this.state.event.fields;
    const severity = this.state.event.severity;
    return (
      <div className="event-item-wrapper">
        <div className="indicator-checkbox">
          <div className="rectangle-wrapper">
            <div className={`rectangle ${severity}`} />
          </div>
        </div>
        <div className="details">
          <div className="detail-item correlated_id">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('correlated_id')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Alert ID:
              </span>
              <span className="detail-content">
                {eventDisplay.correlated_id}
              </span>
            </div>
          </div>
          <div className="detail-item summary">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('summary')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Summary:
              </span>
              <span className="detail-content">{eventDisplay.summary}</span>
            </div>
          </div>
          {/* <div className="detail-item emttr">
            <div className="wrapper">
              <span className="detail-heading" onClick={() => this.handleClickedField('emttr')}>
                <i className="fa fa-sort-amount-desc sort-icon" />
                EMTTR:
              </span>
              <span className="detail-content">{this.secondsToHms(eventDisplay.emttr)}</span>
            </div>
          </div> */}
          <div className="detail-item status">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('status')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Status
              </span>
              <span className="detail-content">{eventDisplay.status}</span>
            </div>
          </div>
          <div className="detail-item region">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('region')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Region:
              </span>
              <span className="detail-content">{eventDisplay.region}</span>
            </div>
          </div>
          <div className="detail-item last_modified_time">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('last_modified_time')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Last Modified Time:
              </span>
              <span className="detail-content">
                {eventDisplay.last_modified_time}
              </span>
            </div>
          </div>
          {/* <div className="detail-item confidence_factor">
            <div className="wrapper">
              <span className="detail-heading" onClick={() => this.handleClickedField('confidence_factor')}>
                <i className="fa fa-sort-amount-desc sort-icon" />
                Confidence Factor:
              </span>
              <span className="detail-content">{eventDisplay.confidence_factor}</span>
            </div>
          </div> */}
          <div className="detail-item active_duration">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('active_duration')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Active Duration:
              </span>
              <span className="detail-content">
                {eventDisplay.active_duration}
              </span>
            </div>
          </div>
          <div className="detail-item assignee">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('assignee')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Assignee:
              </span>
              <span className="detail-content">{eventDisplay.assignee}</span>
            </div>
          </div>
          <div className="detail-item category">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('category')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Category:
              </span>
              <span className="detail-content">{eventDisplay.category}</span>
            </div>
          </div>
          <div className="detail-item created_by">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('created_by')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Created By:
              </span>
              <span className="detail-content">{eventDisplay.created_by}</span>
            </div>
          </div>
          <div className="detail-item created_time">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('created_time')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Created Time:
              </span>
              <span className="detail-content">
                {eventDisplay.created_time}
              </span>
            </div>
          </div>
          <div className="detail-item event_id">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('event_id')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Event ID:
              </span>
              <span className="detail-content">{eventDisplay.event_id}</span>
            </div>
          </div>
          <div className="detail-item impact">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('impact')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Impact:
              </span>
              <span className="detail-content">{eventDisplay.impact}</span>
            </div>
          </div>
          <div className="detail-item ip_address">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('ip_address')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                IP Address:
              </span>
              <span className="detail-content">{eventDisplay.ip_address}</span>
            </div>
          </div>
          <div className="detail-item occurrences">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('occurrences')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Occurrences:
              </span>
              <span className="detail-content">{eventDisplay.occurrences}</span>
            </div>
          </div>
          <div className="detail-item severity">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('severity')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Severity:
              </span>
              <span className="detail-content">{eventDisplay.severity}</span>
            </div>
          </div>
          <div className="detail-item similar_events_count">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('similar_events_count')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Similar Events Count:
              </span>
              <span className="detail-content">
                {eventDisplay.similar_events_count}
              </span>
            </div>
          </div>
          <div className="detail-item source">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('source')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Source:
              </span>
              <span className="detail-content">{eventDisplay.source}</span>
            </div>
          </div>
          <div className="detail-item total_duration">
            <div className="wrapper">
              <span
                className="detail-heading"
                onClick={() => this.handleClickedField('total_duration')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Total Duration:
              </span>
              <span className="detail-content">
                {eventDisplay.total_duration}
              </span>
            </div>
          </div>
        </div>
        <div className="assigned-actions">
          <div className="assignee">
            <div className="assigned">
              <i className="fa fa-user" aria-hidden="true" />
              {eventDisplay.assignee}
            </div>
            <div className="last-time">
              <i className="fa fa-clock-o" aria-hidden="true" />
              {moment(eventDisplay.created_time).fromNow()}
            </div>
          </div>
          <div className="more-details">
            <button
              className="more-details-button"
              onClick={() => this.handleMoreDetails()}
            >
              <i className="icon-down-arrow" />
            </button>
          </div>
        </div>
        {this.state.showDetails && (
          <div className="event-details">
            <VunetTab
              tabs={this.tabs}
              landingTab={this.landingTab}
              switchTab={this.onTabChange.bind(this)}
            />
            {/* Tabs Body */}
            <div className="content-body">
              {/* display the respective tab according the id */}
              {this.state.currentTabId === 'alert-details' && (
                <EventDetails
                  details={this.state.details}
                  handleCancel={this.handleCancel}
                  updateEvent={this.handleUpdateEvent}
                  eventId={this.props.event.id}
                />
              )}
              {this.state.currentTabId === 'history' && (
                <EventHistory history={this.state.details['History']} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
