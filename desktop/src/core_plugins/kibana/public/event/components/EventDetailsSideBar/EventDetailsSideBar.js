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
import './EventDetailsSideBar.less';
import { VunetTab } from 'ui_framework/src/vunet_components/vunet_tab/vunet_tab';
import { EventDetails } from './EventDetails/EventDetails';
import { EventHistory } from './EventHistory/EventHistory';
import { RelatedDashboards } from './RelatedDashboards/RelatedDashboards';
import { CorrelatedAlerts } from './CorrelatedAlerts/CorrelatedAlerts';
import { UserFeedback } from './UserFeedback/UserFeedback';

export class EventDetailsSideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabId: 'overview',
    };

    this.tabs = [
      {
        id: 'overview',
        name: 'Overview',
      },
      {
        id: 'history',
        name: 'History',
      },
      {
        id: 'related-dashboards',
        name: 'Related Dashboards',
      },
      {
        id: 'correlated-alerts',
        name: 'Correlated Alerts',
      },
      {
        id: 'user-feedback',
        name: 'User Feedback',
      }
    ];

    this.landingTab = 'overview';
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleClickOutside, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, false);
  }

  //this method is used to close the event details sidebar when clicked outside its viewport.
  handleClickOutside = (event) => {
    if (!this.node.contains(event.target)) {
      this.props.closeEventDetailsSideBar();
    }
  }

  //this function is used to handle the tab changes.
  onTabChange = (id) => {
    this.setState({
      currentTabId: id,
    });
  };

  render() {
    return(
      <div className="event-details-container" ref={node => this.node = node}>
        <div className="event-details">
          <div className="top-bar">
            <div className="left-wing">
              <div className="alert-id">Alert ID: {this.props.details.alert_details.fields.alert_id}</div>
              <div
                className={`severity + ${this.props.details.alert_details.fields.severity}`}
              >
                {this.props.details.alert_details.fields.severity.toUpperCase()}
              </div>
            </div>
            <div className="right-wing">
              <div
                className="ticket-id"
              >
                Ticket ID: {this.props.details.alert_details.fields.ticket_id}
              </div>
              <div
                className="close-details"
                onClick={() => this.props.closeEventDetailsSideBar()}
              >
                <i className="fa fa-times" />
              </div>
            </div>
          </div>
          <VunetTab
            tabs={this.tabs}
            landingTab={this.landingTab}
            switchTab={this.onTabChange}
          />
          {/* Tabs Body */}
          <div className="content-body">
            {/* display the respective tab according the id */}
            {this.state.currentTabId === 'overview' && (
              <EventDetails
                details={this.props.details}
                userList={this.props.userList}
                updateEvent={this.props.updateEventDetails}
                eventId={this.props.clickedEvent.id}
                canUpdateEvent={this.props.canUpdateEvent}
                addOrRemoveReaction={this.addOrRemoveReaction}
              />
            )}
            {this.state.currentTabId === 'history' &&
              <EventHistory
                history={this.props.details.History}
                occurrences={this.props.details.occurrences}
              />
            }
            {this.state.currentTabId === 'related-dashboards' &&
              <RelatedDashboards
                dashboardList={
                  this.props.details.alert_details.fields.related_dashboards
                }
              />
            }
            {this.state.currentTabId === 'correlated-alerts' &&
              <CorrelatedAlerts
                correlationId={
                  this.props.details.alert_details.fields.corelation_id
                }
                fetchRawEvents={this.props.fetchRawEvents}
                allFields={this.props.allFields}
              />
            }
            {this.state.currentTabId === 'user-feedback' &&
              <UserFeedback
                correlationId={
                  this.props.details.alert_details.fields.corelation_id
                }
                addOrRemoveReaction={this.props.addOrRemoveReaction}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}