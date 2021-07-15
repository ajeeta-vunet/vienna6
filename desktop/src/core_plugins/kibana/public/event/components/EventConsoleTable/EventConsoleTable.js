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

// Copyright 2021 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import './EventConsoleTable.less';
import { generateHeading } from '../../utils/vunet_format_name';
import ReactTooltip from 'react-tooltip';
import { EventDetailsSideBar } from '../EventDetailsSideBar/EventDetailsSideBar';
import chrome from 'ui/chrome';
import { produce } from 'immer';
import { displayTwoTimeUnits } from 'ui/utils/vunet_get_time_values.js';
import { Notifier } from 'ui/notify';

const notify = new Notifier({ location: 'Event Console' });

export class EventConsoleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayEventDetailsSideBar: false,
      details: {},
      currentEvents: this.props.currentEvents,
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ currentEvents: newProps.currentEvents });
  }

  //this method is used to generate JSX for event console table headers.
  renderEventConsoleTableHeaders() {
    const event = this.state.currentEvents && this.state.currentEvents[0];
    const headerKeys = event && Object.keys(event.fields);
    if (event) {
      return (
        <tr className="header-row" key={event.id}>
          {headerKeys.map((header) => {
            if (this.props.hiddenFields && !this.props.hiddenFields.includes(header)) {
              return (
                <th
                  key={header}
                  className={header}
                  onClick={() => this.props.sortByClickedField(header)}
                >
                  {generateHeading(header)}
                  <i className="fa fa-sort sort-icon" />
                </th>
              );
            }
          })}
          <th className="actions-col">Actions</th>
        </tr>
      );
    }
  }

  //this method is used to generate JSX for event console tables data row.
  renderEventConsoleTableData() {
    return (
      this.state.currentEvents &&
      this.state.currentEvents.map((event) => {
        if (event) {
          return (
            <tr
              className="event-console-data-row"
              key={event.id}
              onDoubleClick={() => this.handleDisplayEventDetails(event)}
            >
              {Object.entries(event.fields).map(([key, value]) => {
                const className =
                  key === 'alert_id'
                    ? key + ' ' + event.severity + '-severity'
                    : key;
                if (this.props.hiddenFields && !this.props.hiddenFields.includes(key)) {
                  return (
                    <td key={key} className={className}>
                      {key === 'active_duration' || key === 'total_duration'
                        ? displayTwoTimeUnits(value)
                        : value}
                    </td>
                  );
                }
              })}
              <td className="actions-col">
                <div className="action-buttons-wrapper">
                  <div
                    className="more-details-div"
                    onClick={() => this.handleDisplayEventDetails(event)}
                    data-tip={'More Details'}
                  >
                    <ReactTooltip place="bottom" />
                    <i className="fa fa-info-circle" />
                  </div>
                  <div
                    data-tip={
                      this.props.canUpdateEvent
                        ? this.props.itsmPreferencesEnabled
                          ? event.fields.ticket_id !== 'Unavailable'
                            ? 'Ticket already created'
                            : 'Create Ticket'
                          : 'ITSM preferences should be set to create tickets'
                        : 'User does not have Manage Events Claim'
                    }
                  >
                    <ReactTooltip place="bottom" />
                    <div
                      disabled={
                        !this.props.itsmPreferencesEnabled ||
                      event.fields.ticket_id !== 'Unavailable' ||
                      !this.props.canUpdateEvent
                      }
                      className="create-ticket-div"
                      onClick={() =>
                        this.props.createTicket(
                          event.id
                        )
                      }
                    >
                      <i className="fa fa-ticket" />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          );
        }
      })
    );
  }

  //this function is used to fetch the details of an individual event.
  fetchEventDetails = async (id) => {
    let urlBase = chrome.getUrlBase();
    urlBase = urlBase + `/events_of_interest/individual_event/${id}`;
    await fetch(urlBase)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ details: data });
      });
  };

  //this method is called to fetch details pertaining to a particular event and store it in
  //state variable.
  handleDisplayEventDetails = async (event) => {
    await this.fetchEventDetails(event.id);
    this.setState({ displayEventDetailsSideBar: true, clickedEvent: event });
  };

  //this method is called to close the event details sidebar.
  closeEventDetailsSideBar = () => {
    this.setState({ displayEventDetailsSideBar: false, clickedEvent: {} });
  };

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
      const updatedEvent = produce(this.state.clickedEvent, (draft) => {
        draft.fields.assignee = assignee;
        draft.fields.status = status;
      });

      const updatedDetails = produce(this.state.details, (draft) => {
        if (noteText !== '') {
          draft.alert_details.fields.notes.push(toSend.notes[0]);
          draft.alert_details.fields.assignee = assignee;
          draft.alert_details.fields.status = status;
        }
      });

      const currentEvents = produce(this.state.currentEvents, (draft) => {
        draft.map((event) => {
          if(event.id === eventId) {
            event.fields.assignee = assignee;
            event.fields.status = status;
          }
        });
      });

      this.setState({
        clickedEvent: updatedEvent,
        details: updatedDetails,
        currentEvents
      }, () => {
        notify.info('Event has been updated successfully');
      });
    });
  };

  //this method is called to modify the likes and dislike count displayed in Event List view after
  //the user has given/changed his feedback to the event under UserFeedback component.
  addOrRemoveReaction = (reaction) => {
    let updatedEvent = this.state.clickedEvent;
    if (updatedEvent.fields.user_reaction === 'Like') {
      if (reaction === 'Dislike') {
        updatedEvent = produce(this.state.clickedEvent, (draft) => {
          draft.fields.likes--;
          draft.fields.dislikes++;
          draft.fields.user_reaction = 'Dislike';
        });
      } else if (reaction === 'No Reaction') {
        updatedEvent = produce(this.state.clickedEvent, (draft) => {
          draft.fields.likes--;
          draft.fields.user_reaction = 'No Reaction';
        });
      }
    } else if (updatedEvent.fields.user_reaction === 'Dislike') {
      if (reaction === 'Like') {
        updatedEvent = produce(this.state.clickedEvent, (draft) => {
          draft.fields.likes++;
          draft.fields.dislikes--;
          draft.fields.user_reaction = 'Like';
        });
      } else if (reaction === 'No Reaction') {
        updatedEvent = produce(this.state.clickedEvent, (draft) => {
          draft.fields.dislikes--;
          draft.fields.user_reaction = 'No Reaction';
        });
      }
    } else {
      if (reaction === 'Dislike') {
        updatedEvent = produce(this.state.clickedEvent, (draft) => {
          draft.fields.dislikes++;
          draft.fields.user_reaction = 'Dislike';
        });
      } else if (reaction === 'Like') {
        updatedEvent = produce(this.state.clickedEvent, (draft) => {
          draft.fields.likes++;
          draft.fields.user_reaction = 'Like';
        });
      }
    }

    this.setState({ clickedEvent: updatedEvent }, () => {
      notify.info('Event feedback updated successfully');
    });
  };

  render() {
    return (
      <div className="events-table-wrapper">
        <table id="events" className="events-table">
          <tbody>
            {this.renderEventConsoleTableHeaders()}
            {this.state.currentEvents && this.renderEventConsoleTableData()}
          </tbody>
        </table>
        {this.state.displayEventDetailsSideBar && (
          <EventDetailsSideBar
            clickedEvent={this.state.clickedEvent}
            details={this.state.details}
            sortByClickedField={this.sortByClickedField}
            hiddenFields={this.state.hiddenFields}
            canUpdateEvent={this.props.canUpdateEvent}
            itsmPreferencesEnabled={this.props.itsmPreferencesEnabled}
            createTicket={this.props.createTicket}
            userList={this.props.userList}
            fetchRawEvents={this.props.fetchRawEvents}
            allFields={this.props.allFields}
            closeEventDetailsSideBar={this.closeEventDetailsSideBar}
            updateEventDetails={this.updateEventDetails}
            addOrRemoveReaction={this.addOrRemoveReaction}
          />
        )}
      </div>
    );
  }
}
