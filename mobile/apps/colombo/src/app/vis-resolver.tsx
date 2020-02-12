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

import { Metrics } from '@vu/types';
import { BucketTable, TrendVisualization, KPIVisualization, InsightVisualization } from '@vu/vis';
import React from 'react';

export /**
 * This function will resolve the Visualization to be displayed
 *
 * @param {Metrics} data the data to be used, recieved from backend
 * @param {string} DisplayName The Display name at the top of each visualization
 * @param {boolean} [full=false] Flag to tell if the visualization is expanded mode
 * @param {{ dashboardId: string; key: string }} [parent] Contains information about parent
 * @param {*} [rest={}] other property
 * @returns {BaseVisualization} A Visualization Component that Extends
 */

const resolve = (
  data: Metrics,
  full: boolean = false,
  parent?: { dashboardId: string; key: string },
  rest: any = {},
) => {
  rest = { ...rest, data: data, dashboard: parent, full: full};
  switch (data.type) {
    case 'kpi':
      return <KPIVisualization {...rest} />;
    case 'table':
      return <BucketTable {...rest} />;
    case 'trend':
      return <TrendVisualization {...rest} />;
    case 'insights':
      return <InsightVisualization {...rest} />;
    default:
      return null;
      // return environment.production ? null : <GenericVisualization {...rest} />;
  }
};
