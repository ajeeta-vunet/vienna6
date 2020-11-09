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

export class EventConsole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      //eventlist - Contains all events.
      eventList:
        this.props.listOfEvents && this.props.listOfEvents.List_of_events,

      //severityInfo - count of all events based on severiy. Passed to SeverityWidget
      severityInfo: this.props.severityInfo,
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      severityInfo: newProps.severityInfo,
      eventList: _.sortBy(
        newProps.listOfEvents && newProps.listOfEvents.List_of_events,
        function (o) {
          return o.fields.correlated_id;
        }
      ),
    });
  }

  render() {

    return (
      <div className="event-console-wrapper">
        <SeverityWidget severityInfo={this.state.severityInfo} />
        <EventList
          events={this.state.eventList}
          allFields={this.props.columnSelectorInfo && this.props.columnSelectorInfo.alert_details.fields}
          hiddenFields={this.props.columnSelectorInfo && this.props.columnSelectorInfo.alert_details.hidden_fields}
          updateColumnSelector={this.props.updateColumnSelector}
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
