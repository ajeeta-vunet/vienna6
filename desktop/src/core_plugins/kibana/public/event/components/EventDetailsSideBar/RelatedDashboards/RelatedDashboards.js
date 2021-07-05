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
import ReactTooltip from 'react-tooltip';
import './RelatedDashboards.less';

// This component display all dashboards related to the event
// in a tabular format with links to view the dashboard.
export function RelatedDashboards(props) {
  const { dashboardList } = props;

  dashboardList.push('Home');
  dashboardList.push('COVID-19');
  // Iterate on the dashboardlist and prepare
  // rows containing dashboard name and link.
  const renderRows =
    dashboardList &&
    dashboardList.map((dashboard) => {
      const name = dashboard.replace(/-/g, ' ');
      const link = '#/dashboard/' + dashboard;
      return (
        <div key={dashboard} className="row events-display-table-row">
          <div className="col-md-9">{name}</div>
          <div className="col-md-3">
            <a href={link}>
              <i
                className="fa fa-arrow-circle-o-right"
                data-tip="View Dashboard."
              />
              <ReactTooltip />
            </a>
          </div>
        </div>
      );
    });

  return (
    <div className="related-dashboard-container">
      {dashboardList.length ? (
        <div className="events-display-table">
          <div className="row events-display-table-header">
            <div className="col-md-5"> Name </div>
            <div className="col-md-2"> Link </div>
          </div>
          {renderRows}
        </div>
      ) : (
        <div className="event-display-no-data"> No related dashboards. </div>
      )}
    </div>
  );
}

RelatedDashboards.propTypes = {
  dashboardList: PropTypes.array,
};
