/** 
 * ------------------------- NOTICE ------------------------------- 
 *
 *                  CONFIDENTIAL INFORMATION                       
 *                  ------------------------                       
 *    This Document contains Confidential Information or           
 *    Trade Secrets, or both, which are the property of VuNet      
 *    Systems Ltd.  This document may not be copied, reproduced,   
 *    reduced to any electronic medium or machine readable form    
 *    or otherwise duplicated and the information herein may not   
 *    be used, disseminated or otherwise disclosed, except with    
 *    the prior written consent of VuNet Systems Ltd.              
 *                                                                 
 *------------------------- NOTICE ------------------------------- 
 
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
*/

import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect, DispatchProp } from 'react-redux';
import { LoadDashboardsAction, DashboardsState } from '@vu/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CardHeader, Card, CardBody, Row } from 'reactstrap';
import { AppShellStore } from '@vu/app-shell';
import { ViewDashboards } from '@vu/vis';

type DashboardPropsFromMap = { dashboard: DashboardsState };
type DashboardProps = DashboardPropsFromMap & DispatchProp;

/**
 * Map State to props
 *
 * @param {IAppState} state
 * @returns {DashboardPropsFromMap}
 */
const mapStateToProps = (state: AppShellStore): DashboardPropsFromMap => ({
  dashboard: state.dashboard,
});

/**
 * Dashboard Loading Page Component
 * Handles routes /dashboard
 */
export const DashboardPage = connect(mapStateToProps)((props: DashboardProps) => {
  if (props.dashboard.current && props.dashboard.current.id) {
    return <Redirect to={ViewDashboards(props.dashboard.current.id)} />;
  } else if (!props.dashboard.loading && props.dashboard.dashboards === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props.dispatch<any>(LoadDashboardsAction());
  }

  /**
   * Display Otherwise
   */

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col py-5">
          {props.dashboard.dashboards ? (
            props.dashboard.dashboards.length > 0 ? (
              <Card className="shadow">
                <CardHeader className="text-center">
                  <h2>Select a Dashboard</h2>
                </CardHeader>
                <CardBody>
                  <Row>
                    {props.dashboard.dashboards.map((value, index) => {
                      if (index === 0) return <Redirect to={ViewDashboards(value.id)} />;
                      // This code is useless as it'll not be executed but we may need that in future.
                      return (
                        <div className="col-6" key={index}>
                          <Link className="btn btn-primary btn-block mb-2" to={ViewDashboards(value.id)}>
                            {value.title}
                          </Link>
                        </div>
                      );
                    })}
                  </Row>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardHeader>No Dashboards!</CardHeader>
                <CardBody className="text-center py-5">Please add dashboards.</CardBody>
              </Card>
            )
          ) : (
            <div className="text-center">
              <FontAwesomeIcon icon={faSpinner} className="text-white" size="6x" spin />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
