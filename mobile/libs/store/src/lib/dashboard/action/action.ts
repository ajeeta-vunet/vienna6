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

import {
  LoadDashboards,
  DashboardActionTypes,
  LoadDashboardsSuccess,
  LoadDashboardsFailed,
  LoadDashboardFailed,
  LoadDashboard,
  SetCurrentDashboard,
} from './types';
import { MobileKpiResponse, StoryBoard, UserSettings } from '@vu/types';
import { vuHttp } from '@vu/http';
import { ALL_DASHBOARDS_URL, DASHBOARD_URL } from '../../urls';
import { Dispatch } from 'redux';
import { VuStore } from '../../store';
import { UserSettingStore } from '@vu/utils';

/**
 *Will switch to next dashboard
 *
 * @export
 * @returns
 */
export function NextDasboard() {
  return (dispatch: Dispatch, getState: () => VuStore): boolean => {
    const idx = getState().dashboard.dashboards.findIndex((a) => a.id === getState().dashboard.current.id);
    if (idx < getState().dashboard.dashboards.length - 1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch<any>(
        LoadDashboardAction(
          getState().dashboard.dashboards[idx + 1].id,
          getState().timerange.start,
          getState().timerange.end,
        ),
      );
      return true;
    } else {
      return false;
    }
  };
}

/**
 *Will switch to previous dashboard
 *
 * @export
 * @returns
 */
export function PreviousDasboard() {
  return (dispatch: Dispatch, getState: () => VuStore): boolean => {
    const idx = getState().dashboard.dashboards.findIndex((a) => a.id === getState().dashboard.current.id);
    if (idx > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch<any>(
        LoadDashboardAction(
          getState().dashboard.dashboards[idx - 1].id,
          getState().timerange.start,
          getState().timerange.end,
        ),
      );
      return true;
    } else {
      return false;
    }
  };
}

/**
 *Will load list of all available dashboards
 *
 * @export
 * @returns
 */
export function LoadDashboardsAction() {
  return async (dispatch: Dispatch) => {
    dispatch({ type: DashboardActionTypes.LOAD_DASHBOARDS } as LoadDashboards);
    try {
      const data = await vuHttp.get<UserSettings>(ALL_DASHBOARDS_URL(localStorage.getItem('username')));

      UserSettingStore.TenantId = data.data.tenant_id;
      UserSettingStore.BuId = data.data.bu_id;
      UserSettingStore.UserName = data.data.name;
      UserSettingStore.UserGroup = data.data.user_group;

      const kpis = JSON.parse(data.data.mobile_kpi) as MobileKpiResponse[];
      dispatch({
        type: DashboardActionTypes.LOAD_DASHBOARDS_SUCCESS,
        data: kpis,
      } as LoadDashboardsSuccess);
    } catch (err) {
      dispatch({
        type: DashboardActionTypes.LOAD_DASHBOARDS_FAILED,
        error: JSON.stringify(err),
      } as LoadDashboardsFailed);
    }
  };
}

/**
 * Will load a dashboard
 *
 * @export
 * @param {string} dashboardName Name of Dashboard
 * @param {Date} start_time Start time for Data
 * @param {Date} end_time End Time of Data
 * @returns
 */
export function LoadDashboardAction(dashboardName: string, startTime: Date, endTime: Date) {
  return async (dispatch: Dispatch) => {
    dispatch({ type: DashboardActionTypes.LOAD_DASHBOARD } as LoadDashboard);
    try {
      const data = await vuHttp.get(DASHBOARD_URL(dashboardName, startTime, endTime));
      dispatch({
        type: DashboardActionTypes.SET_CURRENT_DASHBOARD,
        data: data.data as StoryBoard,
        name: dashboardName,
      } as SetCurrentDashboard);
    } catch (err) {
      // TODO:  Better Message
      dispatch({
        type: DashboardActionTypes.LOAD_DASHBOARD_FAILED,
        error: JSON.stringify(err),
      } as LoadDashboardFailed);
    }
  };
}
