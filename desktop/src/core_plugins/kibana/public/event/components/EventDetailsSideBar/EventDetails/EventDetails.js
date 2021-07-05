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
import { displayTwoTimeUnits } from 'ui/utils/vunet_get_time_values.js';
import {
  generateHeading,
  generateClassname,
} from '../../../utils/vunet_format_name.js';
import { DropDownSelect } from 'ui_framework/src/vunet_components/DropDownSelect/DropDownSelect';

export class EventDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStatus: this.props.details.alert_details.fields.status,
      selectedAssignee: this.props.details.alert_details.fields.assignee,
      newComment: '',
      hideAlertDetails: true,
      hideAlertMangement: true,
      hideAllWorknotes: true,
      hideAdditonalInfo: true,
    };
  }

  //this function picks up the first metric in the entries object, and generates a string
  //using its value. Used to display the metric info.
  generateMetricText = () => {
    const metrics = this.props.details.Metrics.Entries;
    const metricName = Object.keys(metrics)[0];
    const toPrint = `${metricName}: Value: ${metrics[metricName]['Value (Now)']}`;
    return toPrint;
  };

  //updates the selectedStatus state variable everytime a different option is chosen
  handleStatus = (e) => {
    this.setState({ selectedStatus: e.target.value });
  };

  //updates the selectedAssignee status variable
  handleAssignee = (assignee) => {
    this.setState({ selectedAssignee: assignee });
  };

  //updates the newComment status variable
  handleComment(e) {
    this.setState({ newComment: e.target.value });
  }

  //this method is used to clear event management data entered.
  handleCancel = () => {
    this.setState({
      selectedStatus: this.props.details.alert_details.fields.status,
      selectedAssignee: this.props.details.alert_details.fields.assignee,
      newComment: '',
    });
  };

  //this function is called everytime the save button is clicked.
  //it calls the passed updateEvent function.
  handleUpdateEvent = () => {
    this.props.updateEvent(
      this.props.eventId,
      this.state.selectedAssignee,
      this.state.selectedStatus,
      this.state.newComment
    );
  };

  //this method is called to hide or unhide alert details section.
  hideOrUnhideAlertDetails = () => {
    this.setState({ hideAlertDetails: !this.state.hideAlertDetails });
  };

  //this method is called to hide or unhide alert management section.
  hideOrUnhideAlertMangement = () => {
    this.setState({ hideAlertMangement: !this.state.hideAlertMangement });
  };

  //this method is called to hide or unhide all worknotes section.
  hideOrUnhideAllWorknotes = () => {
    this.setState({ hideAllWorknotes: !this.state.hideAllWorknotes });
  };

  //this method is called to hide or unhide additional info section.
  hideOrUnhideAdditonalInfo = () => {
    this.setState({ hideAdditonalInfo: !this.state.hideAdditonalInfo });
  };

  render() {
    const details = this.props.details.alert_details.fields;
    const metrics = this.props.details.Metrics;
    const statuses = ['assigned', 'closed', 'open'];
    const users =
      this.props.userList &&
      this.props.userList.users &&
      this.props.userList.users.sort();
    const exceptionDetails = [
      'alert_id',
      'status',
      'assignee',
      'summary',
      'notes',
      'related_dashboards',
      'tenant_id',
      'bu_id',
    ];

    const renderDetails =
      details &&
      Object.entries(details).map(([key, value]) => {
        if (!exceptionDetails.includes(key)) {
          return (
            <div
              key={generateClassname(key)}
              className={'detail ' + generateClassname(key)}
            >
              <div className="detail-heading" htmlFor={generateClassname(key)}>
                {generateHeading(key)}
              </div>
              <div className="detail-info">
                {key === 'active_duration' || key === 'total_duration'
                  ? displayTwoTimeUnits(value)
                  : value}
              </div>
              <br />
            </div>
          );
        }
      });

    const renderMetricTable = Object.keys(metrics.Entries).map((key) => {
      return (
        <div key={key} className="row events-metrics-table-row">
          <div className="col-md-4 metrics-details-value">{key}</div>
          {Object.values(metrics.Entries[key]).map((value, index) => {
            return (
              <div
                key={value + index}
                className="col-md-2 metrics-details-value"
              >
                {value}
              </div>
            );
          })}
        </div>
      );
    });

    const renderTags =
      this.props.details.Tags &&
      this.props.details.Tags.map((value) => {
        return (
          <div key={value} className="single-tag">
            {value}
          </div>
        );
      });

    return (
      <div className="event-details-wrapper">
        <div className="details">
          <div className="summary">
            <div className="summary-header-label">Summary</div>
            <div className="summary-value">{details.summary}</div>
          </div>
          <div className="tags-wrapper">
            <div className="header-label">Tags</div>
            {this.props.details.Tags.length ? (
              <div className="event-tags-container">{renderTags}</div>
            ) : (
              <div className="event-tags-no-data">
                No Tags available for this event
              </div>
            )}
          </div>
          <div className="non-table-details">
            <div className="alert-details-header-row">
              <div className="header-label">Alert Details</div>
              <div className="vertical-line" />
              <div
                className="hide-or-unhide-icon"
                onClick={() => this.hideOrUnhideAlertDetails()}
              >
                <i
                  className={
                    'fa ' +
                    (this.state.hideAlertDetails ? 'fa-minus' : 'fa-plus')
                  }
                />
              </div>
            </div>
            {this.state.hideAlertDetails && <div>{renderDetails}</div>}
          </div>
          <div className="alert-mangement-header-row">
            <div className="header-label">Alert Management</div>
            <div className="vertical-line" />
            <div
              className="hide-or-unhide-icon"
              onClick={() => this.hideOrUnhideAlertMangement()}
            >
              <i
                className={
                  'fa ' +
                  (this.state.hideAlertMangement ? 'fa-minus' : 'fa-plus')
                }
              />
            </div>
          </div>
          {this.state.hideAlertMangement && (
            <div>
              <div className="status-and-assignee-wrapper">
                <div className="status">
                  <div className="status-label">Status</div>
                  <select
                    disabled={!this.props.canUpdateEvent}
                    id="status-select"
                    value={this.state.selectedStatus}
                    className="status-select"
                    name="status"
                    onChange={(event) => this.handleStatus(event)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="select-assignee-dropdown">
                  <div className="assignee-label">Assignee</div>
                  <div className="assignee-select">
                    <DropDownSelect
                      isDisabled={!this.props.canUpdateEvent}
                      options={users}
                      value={this.state.selectedAssignee}
                      handleAssignee={this.handleAssignee}
                    />
                  </div>
                </div>
              </div>
              <div className="work-notes">
                <div className="work-notes-body">
                  <div className="work-notes-new-note">
                    <div className="work-note-label">Work Note</div>
                    <textarea
                      disabled={!this.props.canUpdateEvent}
                      className="work-area-textarea"
                      rows="5"
                      placeholder="Write work note here"
                      value={this.state.newComment}
                      onChange={(event) => this.handleComment(event)}
                    />
                  </div>
                </div>
              </div>
              <div className="action-buttons-wrapper">
                <button
                  className="event-console-button button-left"
                  onClick={() => this.handleCancel()}
                >
                  Cancel
                </button>
                <button
                  className="event-console-button"
                  onClick={() => this.handleUpdateEvent()}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          <div className="all-worknotes-header-row">
            <div className="header-label">All Worknotes</div>
            <div className="vertical-line" />
            <div
              className="hide-or-unhide-icon"
              onClick={() => this.hideOrUnhideAllWorknotes()}
            >
              <i
                className={
                  'fa ' + (this.state.hideAllWorknotes ? 'fa-minus' : 'fa-plus')
                }
              />
            </div>
          </div>
          {this.state.hideAllWorknotes && (
            <div className="work-notes-list">
              {details.notes.length > 0 ? (
                details.notes.map((note) => (
                  <div key={`${note.body}-${note.timestamp}`} className="note">
                    <div className="avatar">{note.author[0]}</div>
                    <div className="note-body">
                      <div className="author-date-div">
                        <div className="note-author">{note.author}</div>
                        <div className="note-date">{note.timestamp}</div>
                      </div>
                      <div className="note-body">{note.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="event-worknotes-no-data">
                  No Worknotes available for this event
                </div>
              )}
            </div>
          )}
          <div className="additional-info-header-row">
            <div className="header-label">Additional Information</div>
            <div className="vertical-line" />
            <div
              className="hide-or-unhide-icon"
              onClick={() => this.hideOrUnhideAdditonalInfo()}
            >
              <i
                className={
                  'fa ' +
                  (this.state.hideAdditonalInfo ? 'fa-minus' : 'fa-plus')
                }
              />
            </div>
          </div>
          {this.state.hideAdditonalInfo && (
            <div className="event-metrics-container">
              {Object.keys(metrics.Entries).length ? (
                <div className="events-metrics-table">
                  <div className="row events-metrics-table-header">
                    <div className="col-md-4">
                      <span className="metric-details-header">Metrics</span>
                    </div>
                    <div className="col-md-2">
                      <span className="metric-details-header">
                        Value (Event Duration)
                      </span>
                    </div>
                    <div className="col-md-2">
                      <span className="metric-details-header">Value (Now)</span>
                    </div>
                    <div className="col-md-2">
                      <span className="metric-details-header">Insights</span>
                    </div>
                    <div className="col-md-2">
                      <span className="metric-details-header">Threshold</span>
                    </div>
                  </div>
                  {renderMetricTable}
                </div>
              ) : (
                <div className="event-metrics-no-data">
                  No Metric Entries available for this event
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
