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
import './EventHistory.less';
import { displayTwoTimeUnits } from 'ui/utils/vunet_get_time_values.js';
import moment from 'moment-timezone';

// This component displays alert history in a
// tabular format
export function EventHistory(props) {
  const { history, occurrences } = props;

  const requiresCustomDisplayList = [
    'Today Active For',
    'Last 7 Days Active For',
    'Last 1 Month Active For',
    'Active For',
    'Duration',
  ];

  // Iterate on the history object and prepare
  // rows containing history information.
  const renderRows =
    history &&
    Object.keys(history).map((key, index) => {
      return (
        <div key={key + index} className="row events-display-table-row">
          <div className="col-md-6">{key}</div>
          <div className="col-md-6">
            {requiresCustomDisplayList.includes(key) > 0
              ? displayTwoTimeUnits(history[key])
              : history[key]}
          </div>
        </div>
      );
    });

  const renderOccurrences =
    occurrences &&
    occurrences.map((value) => {
      return (
        <div key={value} className="row occurrences-display-table-row">
          <div className="col-md-6">
            {moment(value).format('dddd, MMMM Do YYYY, h:mm:ss a')}
          </div>
        </div>
      );
    });

  return (
    <div className="event-history-container">
      <div className="history-table-container">
        {history && Object.keys(history).length ? (
          <div className="events-display-table">
            <div className="row events-display-table-header">
              <div className="col-md-6">
                <span className="history-details">Name</span>
              </div>
              <div className="col-md-6">
                <span className="values">Details</span>
              </div>
            </div>
            {renderRows}
          </div>
        ) : (
          <div className="event-display-no-data">
            No event history available for this event
          </div>
        )}
      </div>
      <div className="occurrences-table-container">
        {occurrences.length ? (
          <div className="occurrences-display-table">
            <div className="row occurrences-display-table-header">
              <div className="col-md-6">
                <span className="occurrences-details">Occurrences</span>
              </div>
            </div>
            {renderOccurrences}
          </div>
        ) : (
          <div className="event-display-no-data">
            No previous occurrences available for this event
          </div>
        )}
      </div>
    </div>
  );
}

EventHistory.propTypes = {
  history: PropTypes.object,
};
