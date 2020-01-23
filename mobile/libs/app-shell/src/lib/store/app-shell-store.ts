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
 *
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
 */


import {
  VuStore,
  AuthUnauthorizedState,
  DashboardInitialState,
  TimeRangeInitialState,
  AuthActions,
  TimeRangeActions,
  DashboardActions,
} from '@vu/store';
import { AppUiStore, AppUiInitialState } from './reducer/reducers';
import { AppUiActions } from './action';

export type AppShellStore = VuStore & AppUiStore;
export const AppShellInitialState = {
  appui: AppUiInitialState,
  auth: AuthUnauthorizedState,
  dashboard: DashboardInitialState,
  timerange: TimeRangeInitialState,
};
export type AppShellActions = AuthActions & DashboardActions & TimeRangeActions & AppUiActions;
