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
  AlertActionEnum,
  AlertLoadAction,
  AlertLoadFailAction,
  AlertLoadSuccessAction,
  SeverityValues,
  ListOfEvent,
} from './types';
import { vuHttp, getErrorMessage } from '@vu/http';
import { Dispatch } from 'redux';
import { UserSettingStore } from '@vu/utils';
import { TimeRangeStore } from '@vu/store';

export const ALERTS_URL = `vuSmartMaps/api/${UserSettingStore.TenantId}/bu/${UserSettingStore.BuId}/events_of_interest/list_of_events/`;
export const ALERT_URL = (id: string) =>
  `vuSmartMaps/api/${UserSettingStore.TenantId}/bu/${UserSettingStore.BuId}/events_of_interest/individual_event/${id}/?format=alerts_format`;
export const ALERT_SEVERITY_URL = `vuSmartMaps/api/${UserSettingStore.TenantId}/bu/${UserSettingStore.BuId}/events_of_interest/severity_based_events/?format=alerts_format`;
export const MAX_ALERTS = 100;

/**
 *Will load list of all available dashboards
 *
 * @export
 * @returns
 */
export function LoadAlertsAction(filter: SeverityValues) {
  return async (dispatch: Dispatch, getState: () => TimeRangeStore) => {
    dispatch({ type: AlertActionEnum.LOAD_ALERTS } as AlertLoadAction);
    const timerange = getState().timerange;
    vuHttp
      .post$<unknown, ListOfEvent>(ALERTS_URL, {
        extended: {
          es: {
            filter: {
              bool: { must: filter === '*' ? [] : [{ match_phrase: { severity: { query: filter } } }], must_not: [] },
            },
          },
        },
        time: { gte: timerange.start.getTime(), lte: timerange.end.getTime() },
        sample_size: MAX_ALERTS,
        format: 'alerts_format',
      })
      .subscribe(
        (data) => {
          dispatch({
            type: AlertActionEnum.LOAD_ALERTS_SUCCESS,
            data: data.List_of_events,
          } as AlertLoadSuccessAction);
        },
        (err) => {
          dispatch({
            type: AlertActionEnum.LOAD_ALERTS_FAIL,
            error: getErrorMessage(err),
          } as AlertLoadFailAction);
        },
      );
  };
}
