/* eslint-disable no-nested-ternary */
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
import { displayTwoTimeUnits } from 'ui/utils/vunet_get_time_values.js';
import { generateHeading, generateClassname } from '../../utils/vunet_format_name.js';
import ReactTooltip from 'react-tooltip';

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
    this.setState({ event: newProps.event, showDetails: false });
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
        this.setState({ details: updatedDetails }, () => {
          notify.info('Event has been updated successfully');
        });
      }
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

  //this method is called to modify the likes and dislike count displayed in Event List view after
  //the user has given/changed his feedback to the event under UserFeedback component.
  addOrRemoveReaction = (reaction) => {
    let updatedEvent = this.state.event;
    if(updatedEvent.fields.user_reaction === 'Like') {
      if(reaction === 'Dislike') {
        updatedEvent = produce(this.state.event, draft => {
          draft.fields.likes--;
          draft.fields.dislikes++;
          draft.fields.user_reaction = 'Dislike';
        });
      } else if(reaction === 'No Reaction') {
        updatedEvent = produce(this.state.event, draft => {
          draft.fields.likes--;
          draft.fields.user_reaction = 'No Reaction';
        });
      }
    }else if(updatedEvent.fields.user_reaction === 'Dislike') {
      if(reaction === 'Like') {
        updatedEvent = produce(this.state.event, draft => {
          draft.fields.likes++;
          draft.fields.dislikes--;
          draft.fields.user_reaction = 'Like';
        });
      } else if(reaction === 'No Reaction') {
        updatedEvent = produce(this.state.event, draft => {
          draft.fields.dislikes--;
          draft.fields.user_reaction = 'No Reaction';
        });
      }
    } else {
      if(reaction === 'Dislike') {
        updatedEvent = produce(this.state.event, draft => {
          draft.fields.dislikes++;
          draft.fields.user_reaction = 'Dislike';
        });
      } else if(reaction === 'Like') {
        updatedEvent = produce(this.state.event, draft => {
          draft.fields.likes++;
          draft.fields.user_reaction = 'Like';
        });
      }
    }

    this.setState({ event: updatedEvent }, () => {
      notify.info('Event feedback updated successfully');
    });
  }

  render() {
    const eventDisplay = this.state.event.fields;
    const severity = this.state.event.severity;
    const displayEventItemDetails =
      eventDisplay && Object.entries(eventDisplay).map(([key, value]) => {
        if(key !== 'likes' && key !== 'dislikes' && key !== 'user_reaction') {
          return (
            <div key={generateClassname(key)} className={'detail-item ' + generateClassname(key)}>
              <div className="wrapper">
                <div
                  className="detail-heading"
                  onClick={() => this.handleClickedField(key)}
                  data-tip={'Sort by ' + generateHeading(key)}
                >
                  <ReactTooltip />
                  <i className="fa fa-sort-amount-desc sort-icon" />
                  {generateHeading(key)}:
                </div>
                <div className="detail-content">
                  {key === 'active_duration' || key === 'total_duration' ? displayTwoTimeUnits(value) : value}
                </div>
              </div>
            </div>
          );
        }else if(key !== 'user_reaction') {
          return (
            <div key={generateClassname(key)} className={'detail-item ' + generateClassname(key)}>
              <div className="wrapper">
                <div
                  className="detail-heading"
                  onClick={() => this.handleClickedField(key)}
                  data-tip={'Sort by ' + generateHeading(key)}
                >
                  <ReactTooltip />
                  <i className="fa fa-sort-amount-desc sort-icon" />
                  {key === 'likes' ? <i className="fa fa-thumbs-o-up like-icon" /> : <i className="fa fa-thumbs-o-down dislike-icon" />}
                </div>
                <div className="detail-content">
                  {value}
                </div>
              </div>
            </div>
          );
        }
      });

    return (
      <div className="event-item-wrapper">
        <div className="indicator-checkbox">
          <div className="rectangle-wrapper">
            <div className={`rectangle ${severity}`} />
          </div>
        </div>
        <div className="details">
          {displayEventItemDetails}
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
            <div data-tip={
              // eslint-disable-next-line no-nested-ternary
              this.props.canUpdateEvent ? this.props.itsmPreferencesEnabled ?
                eventDisplay.ticket_id !== 'Unavailable' ? 'Ticket already created' : 'Create Ticket'
                : 'ITSM preferences should be set to create tickets'
                : 'User does not have Manage Events Claim'
            }
            >
              <ReactTooltip />
              <button
                disabled={!this.props.itsmPreferencesEnabled || eventDisplay.ticket_id !== 'Unavailable' || !this.props.canUpdateEvent}
                className="create-ticket-button"
                onClick={() => this.props.createTicket(this.props.event.id)}
              >
                Create Ticket
                <i className="fa fa-ticket fa-ticket-icon" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="more-details">
            <button
              className="more-details-button"
              onClick={() => this.handleMoreDetails()}
            >
              <i className={'fa fa-lg ' + (this.state.showDetails ? 'fa-angle-up' : 'fa-angle-down')} />
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
                  canUpdateEvent={this.props.canUpdateEvent}
                  userReactionData={this.state.userReactionData}
                  addOrRemoveReaction={this.addOrRemoveReaction}
                />
              )}
              {this.state.currentTabId === 'history' && (
                <EventHistory
                  history={this.state.details.History}
                  occurrences={this.state.details.occurrences}
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
