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

import { MobileKpiResponse, StoryBoard } from '@vu/types';

export enum DashboardActionTypes {
  LOAD_DASHBOARDS = 'LOAD_DASHBOARDS',
  LOAD_DASHBOARDS_SUCCESS = 'LOAD_DASHBOARDS_SUCCESS',
  LOAD_DASHBOARDS_FAILED = 'LOAD_DASHBOARDS_FAILED',
  LOAD_DASHBOARD = 'LOAD_DASHBOARD',
  LOAD_DASHBOARD_FAILED = 'LOAD_DASHBOARD_FAILED',
  SET_CURRENT_DASHBOARD = 'SET_CURRENT_DASHBOARD',
}
export type LoadDashboards = {
  type: DashboardActionTypes.LOAD_DASHBOARDS;
};
export type LoadDashboardsSuccess = {
  type: DashboardActionTypes.LOAD_DASHBOARDS_SUCCESS;
  data: MobileKpiResponse[];
};
export type LoadDashboardsFailed = {
  type: DashboardActionTypes.LOAD_DASHBOARDS_FAILED;
  error: string;
};
export type LoadDashboard = {
  type: DashboardActionTypes.LOAD_DASHBOARD;
};
export type LoadDashboardFailed = {
  type: DashboardActionTypes.LOAD_DASHBOARD_FAILED;
  error: string;
};
export type SetCurrentDashboard = {
  type: DashboardActionTypes.SET_CURRENT_DASHBOARD;
  data: StoryBoard;
  name: string;
};
export type DashboardActions =
  | LoadDashboards
  | LoadDashboardsSuccess
  | LoadDashboardsFailed
  | LoadDashboard
  | LoadDashboardFailed
  | SetCurrentDashboard;
