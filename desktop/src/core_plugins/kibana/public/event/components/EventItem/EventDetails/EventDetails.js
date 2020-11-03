
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
import './EventDetails.less';

export class EventDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedStatus: this.props.details.alert_details.fields.status,
      selectedAssignee: this.props.details.alert_details.fields.assignee,
      newComment: ''
    };
    this.generateMetricText = this.generateMetricText.bind(this);
    this.secondsToHms = this.secondsToHms.bind(this);
    this.handleStatus = this.handleStatus.bind(this);
    this.handleUpdateEvent = this.handleUpdateEvent.bind(this);
  }

  //this function picks up the first metric in the entries object, and generates a string
  //using its value. Used to display the metric info.
  generateMetricText() {
    const metrics = this.props.details.Metrics.Entries;
    const metricName = Object.keys(metrics)[0];
    const toPrint = `${metricName}: Value: ${metrics[metricName]['Value (Now)']}`;
    return toPrint;
  }

  //converts the incoming seconds to a string of HMS that can be displayed
  secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '0 hours, ';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '0 minutes, ';
    const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '0 seconds';
    return hDisplay + mDisplay + sDisplay;
  }

  //updates the selectedStatus state variable everytime a different option is chosen
  handleStatus(e) {
    this.setState({ selectedStatus: e.target.value });
  }

  //updates the selectedAssignee status variable
  handleAssignee(e) {
    this.setState({ selectedAssignee: e.target.value });
  }

  //updates the newComment status variable
  handleComment(e) {
    this.setState({ newComment: e.target.value });
  }

  //this function is called everytime the save button is clicked.
  //it calls the passed updateEvent function.
  handleUpdateEvent() {
    this.props.updateEvent(this.props.eventId, this.state.selectedAssignee, this.state.selectedStatus, this.state.newComment);
  }

  render() {
    const display = this.props.details.alert_details.fields;
    const severity = this.props.details.Severity;
    const correlatedId = this.props.details.ID;
    const statuses = ['open', 'assigned', 'closed'];
    return(
      <div className="event-details-wrapper">
        <div className="details">
          <div className="detail alert-id">
            <label htmlFor="alert-id">Alert/Correlated ID: </label>
            <div className="detail-info"> {correlatedId} </div>
            <br />
          </div>
          <div className="detail active-duration">
            <label htmlFor="alert-id">Active Duration: </label>
            <div className="detail-info"> {this.secondsToHms(display.active_duration)} </div>
            <br />
          </div>
          <div className="detail ip">
            <label htmlFor="alert-id">IP Address: </label>
            <div className="detail-info"> {display.ip_address} </div>
            <br />
          </div>
          <div className="detail metric">
            <label htmlFor="alert-id">Metric: </label>
            <div className="detail-info"> {this.generateMetricText()} </div>
            <br />
          </div>
          <div className="detail total-duration">
            <label htmlFor="alert-id">Total Duration: </label>
            <div className="detail-info"> {this.secondsToHms(display.total_duration)} </div>
            <br />
          </div>
          <div className="detail category">
            <label htmlFor="alert-id">Affected Category:  </label>
            <div className="detail-info"> {display.category} </div>
            <br />
          </div>
          <div className="detail alert-id">
            <label htmlFor="alert-id">Occurrence: </label>
            <div className="detail-info"> Occurrence here </div>
            <br />
          </div>
          <div className="detail impact">
            <label htmlFor="alert-id">Business Impact: </label>
            <div className="detail-info"> {display.impact} </div>
            <br />
          </div>
          <div className="detail first-occurence-date">
            <label htmlFor="alert-id">First Occurence Date: </label>
            <div className="detail-info"> {display.created_time} </div>
            <br />
          </div>
          <div className="detail source">
            <label htmlFor="alert-id">Source: </label>
            <div className="detail-info"> {display.source} </div>
            <br />
          </div>
          <div className="detail last-occurence-date-id">
            <label htmlFor="alert-id">Last Occurrence: </label>
            <div className="detail-info"> Last Date Here (not provided) </div>
            <br />
          </div>
          <div className="detail region">
            <label htmlFor="alert-id">Region: </label>
            <div className="detail-info"> {display.region} </div>
            <br />
          </div>
          <div className="detail severity">
            <label htmlFor="alert-id">Severity: </label>
            <div className="detail-info"> {severity} </div>
          </div>
          <div className="detail status">
            <label htmlFor="alert-id">Status: </label>
            <select
              id="status-select"
              defaultValue={display.status}
              className="status-select"
              name="status"
              onChange={event => this.handleStatus(event)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <br />
          </div>
          <div className="detail assignee">
            <label htmlFor="alert-id">Assignee: </label>
            <input type="text" value={this.state.selectedAssignee} onChange={event => this.handleAssignee(event)} /> <br />
          </div>
        </div>
        <div className="summary">
          <label>Summary: </label>
          <textarea rows="3" defaultValue={display.summary} disabled />
        </div>
        <div className="work-notes">
          <div className="work-notes-header">
            Work Note
          </div>
          <div className="work-notes-body">
            <div className="work-notes-list">
              {display.notes.map(note => (
                <div key={`${note.body}-${note.timestamp}`} className="note">
                  <div className="avatar">
                    {note.author[0]}
                  </div>
                  <div className="note-body">
                    <div className="note-author">
                      {note.author}
                    </div>
                    <div className="note-body">
                      {note.text}
                    </div>
                    <div className="note-date">
                      {note.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="work-notes-new-note">
              <textarea
                className="work-area-textarea"
                rows="5"
                placeholder="Write the work note here"
                value={this.state.newComment}
                onChange={event => this.handleComment(event)}
              />
            </div>
          </div>
        </div>
        <div className="action-buttons-wrapper">
          <button className="event-console-button button-left" onClick={() => this.handleUpdateEvent()}>Save</button>
          <button className="event-console-button" onClick={() => this.props.handleCancel()}>Cancel</button>
        </div>
      </div>
    );
  }

}