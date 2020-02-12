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

import { Reducer } from 'react';
import { DashboardActions, DashboardActionTypes } from '../action';
import { MobileKpiResponse, StoryBoard } from '@vu/types';

export type DashboardsStore = {
  dashboard: DashboardsState;
}
export type DashboardsState = {
  /**
   * Store list of Available Dashboard Recieved from Backend
   *
   * @type {MobileKpiResponse[]}
   */
  dashboards?: MobileKpiResponse[];

  /**
   * Stores ID and Current Dashboard
   *
   * @type {{ id: string; data: StoryBoard }}
   */
  current: { id: string; data: StoryBoard };

  /**
   * Shows a loader an HTTP request is made
   *
   * @type {boolean}
   */
  loading: boolean;

  /**
   * Error recieved from Backend
   *
   * @type {string}
   */
  error?: string;
};
export const DashboardInitialState: DashboardsState = {
  loading: false,
  dashboards: undefined,
  current: null,
};
/**
 *
 * @param state Initial State
 * @param action Action
 */
export const DashboardReducer: Reducer<DashboardsState, DashboardActions> = (state = DashboardInitialState, action) => {
  switch (action.type) {
    case DashboardActionTypes.LOAD_DASHBOARDS:
      return { ...state, loading: true, error: null };
    case DashboardActionTypes.LOAD_DASHBOARDS_SUCCESS:
      return { ...state, loading: false, error: null, dashboards: action.data };
    case DashboardActionTypes.LOAD_DASHBOARDS_FAILED:
      return { ...state, loading: false, error: action.error };
    case DashboardActionTypes.LOAD_DASHBOARD:
      return { ...state, loading: true, error: null };
    case DashboardActionTypes.LOAD_DASHBOARD_FAILED:
      return { ...state, loading: false, error: action.error };
    case DashboardActionTypes.SET_CURRENT_DASHBOARD:
      return {
        ...state,
        loading: false,
        error: null,
        current: { data: action.data, id: action.name },
      };
    default:
      return state;
  }
};
