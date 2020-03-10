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

import { Component } from 'react';
import { Metrics } from '@vu/types';

/**
 * Resources file, will store constants used in the app
 */
export const DashboardsUrl = () => '/dashboard';
export const ViewDashboards = (dashboardId: string = ':dashboardId') => `${DashboardsUrl()}/${dashboardId}`;
export const ExpandedVisualizationUrl = (dashboardId: string = ':dashboardId', visId: string = ':visId') =>
  `${ViewDashboards(dashboardId)}/${visId}`;

  
type PropsFromMap = {
  data: Metrics;
  VisTitle: string;
  full: boolean;
  dashboard?: { dashboardId: string; key: string };
};

type DispatchFromMap = {};

export type ViewDashboardProp = PropsFromMap & DispatchFromMap ;
export type ViewDashboardState = { error?: any };

export class BaseVisualization<
  P extends ViewDashboardProp = ViewDashboardProp,
  S extends ViewDashboardState = ViewDashboardState,
  SS = any
> extends Component<P, S, SS> {
  componentDidCatch(){
  }
}
