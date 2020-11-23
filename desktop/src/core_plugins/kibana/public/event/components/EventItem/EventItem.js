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
import moment from 'moment-timezone';
import { produce } from 'immer';
import chrome from 'ui/chrome';
import { Notifier } from 'ui/notify';
import './EventItem.less';
import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import { EventDetails } from './EventDetails/EventDetails';
import { EventHistory } from './EventHistory/EventHistory';
import { RelatedDashboards } from './RelatedDashboards/RelatedDashboards';

const notify = new Notifier({ location: 'Event Console' });

export class EventItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      details: {},
      currentTabId: 'alert-details',
      event: this.props.event,
      active: false,
    };

    this.tabs = [
      {
        id: 'alert-details',
        name: 'Alert Details',
      },
      {
        id: 'history',
        name: 'History',
      },
      {
        id: 'related-dashboards',
        name: 'Related Dashboards',
      },
    ];

    this.landingTab = 'alert-details';
  }

  componentWillReceiveProps(newProps) {
    this.setState({ event: newProps.event });
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
      const updatedEvent = produce(this.state.event, (draft) => {
        draft.fields.assignee = assignee;
        draft.fields.status = status;
      });
      this.setState({ event: updatedEvent });

      if (noteText !== '') {
        const updatedDetails = produce(this.state.details, (draft) => {
          draft.alert_details.fields.notes.push(toSend.notes[0]);
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
    const currentState = this.state.active;
    this.setState({
      active: !currentState
    });
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
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('correlated_id')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Alert ID:
              </div>
              <div className="detail-content">
                {eventDisplay.correlated_id}
              </div>
            </div>
          </div>
          <div className="detail-item summary">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('summary')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Summary:
              </div>
              <div className="detail-content">{eventDisplay.summary}</div>
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
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('status')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Status
              </div>
              <div className="detail-content">{eventDisplay.status}</div>
            </div>
          </div>
          <div className="detail-item region">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('region')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Region:
              </div>
              <div className="detail-content">{eventDisplay.region}</div>
            </div>
          </div>
          <div className="detail-item last_modified_time">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('last_modified_time')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Last Modified Time:
              </div>
              <div className="detail-content">
                {eventDisplay.last_modified_time}
              </div>
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
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('active_duration')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Active Duration:
              </div>
              <div className="detail-content">
                {eventDisplay.active_duration}
              </div>
            </div>
          </div>
          <div className="detail-item assignee">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('assignee')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Assignee:
              </div>
              <div className="detail-content">{eventDisplay.assignee}</div>
            </div>
          </div>
          <div className="detail-item category">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('category')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Category:
              </div>
              <div className="detail-content">{eventDisplay.category}</div>
            </div>
          </div>
          <div className="detail-item created_by">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('created_by')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Created By:
              </div>
              <div className="detail-content">{eventDisplay.created_by}</div>
            </div>
          </div>
          <div className="detail-item created_time">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('created_time')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Created Time:
              </div>
              <div className="detail-content">
                {eventDisplay.created_time}
              </div>
            </div>
          </div>
          <div className="detail-item event_id">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('event_id')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Event ID:
              </div>
              <div className="detail-content">{eventDisplay.event_id}</div>
            </div>
          </div>
          <div className="detail-item impact">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('impact')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Impact:
              </div>
              <div className="detail-content">{eventDisplay.impact}</div>
            </div>
          </div>
          <div className="detail-item ip_address">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('ip_address')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                IP Address:
              </div>
              <div className="detail-content">{eventDisplay.ip_address}</div>
            </div>
          </div>
          <div className="detail-item occurrences">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('occurrences')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Occurrences:
              </div>
              <div className="detail-content">{eventDisplay.occurrences}</div>
            </div>
          </div>
          <div className="detail-item severity">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('severity')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Severity:
              </div>
              <div className="detail-content">{eventDisplay.severity}</div>
            </div>
          </div>
          <div className="detail-item similar_events_count">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('similar_events_count')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Similar Events Count:
              </div>
              <div className="detail-content">
                {eventDisplay.similar_events_count}
              </div>
            </div>
          </div>
          <div className="detail-item source">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('source')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Source:
              </div>
              <div className="detail-content">{eventDisplay.source}</div>
            </div>
          </div>
          <div className="detail-item total_duration">
            <div className="wrapper">
              <div
                className="detail-heading"
                onClick={() => this.handleClickedField('total_duration')}
              >
                <i className="fa fa-sort-amount-desc sort-icon" />
                Total Duration:
              </div>
              <div className="detail-content">
                {eventDisplay.total_duration}
              </div>
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
              <i className={'fa fa-lg ' + (this.state.active ? 'fa-angle-up' : 'fa-angle-down')} />
            </button>
          </div>
        </div>
        {this.state.showDetails && (
          <div className="event-details">
            <VunetTab
              tabs={this.tabs}
              landingTab={this.landingTab}
              switchTab={this.onTabChange}
            />
            {/* Tabs Body */}
            <div className="content-body">
              {/* display the respective tab according the id */}
              {this.state.currentTabId === 'alert-details' && (
                <EventDetails
                  details={this.state.details}
                  userList={this.props.userList}
                  handleCancel={this.handleCancel}
                  updateEvent={this.handleUpdateEvent}
                  eventId={this.props.event.id}
                />
              )}
              {this.state.currentTabId === 'history' && (
                <EventHistory history={this.state.details.History} />
              )}
              {this.state.currentTabId === 'related-dashboards' && (
                <RelatedDashboards
                  dashboardList={
                    this.state.details.alert_details.fields.related_dashboards
                  }
                />
              )}
              {this.state.currentTabId === 'related-dashboards' && (
                <RelatedDashboards
                  dashboardList={
                    this.state.details.alert_details.fields.related_dashboards
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
