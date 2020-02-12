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
import { Card, CardHeader, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ViewDashboardProp } from '@vu/vis';
import MaterialIcon from 'material-icons-react';
import { ExpandedVisualizationUrl } from '@vu/colombo-lib';

import './shell.scss';
/**
 * Outer Shell for all the visualizations
 *
 * @export
 * @param {(ViewDashboardProp & { children: any })} props
 * @returns
 */
export function VisShell(props: ViewDashboardProp & { children: any }) {
  return (
    <Col className="col-12">
      <Card className={(props.full ? 'standalone' : '') + ' card-bmv shadow'}>
        <CardHeader>
          <div className="metric-card-title d-inline-block">
            {props.data.id}
            {props.full ? null : (
              <Link
                to={ExpandedVisualizationUrl(props.dashboard.dashboardId,props.dashboard.key)}
                className="card-icons-right"
              >
                <MaterialIcon icon="open_in_new" />
              </Link>
            )}
          </div>
        </CardHeader>
        {props.data ? props.children : <h2 className="text-center">No Data</h2>}
      </Card>
    </Col>
  );
}
