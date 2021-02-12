import { UserSettingStore } from '@vu/utils';

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
export const LOGIN_URL = 'api/default/session/?client_type=BROWSER_CLIENT';
export const LOGOUT_URL = 'api/default/session/logout/';

export const ALL_DASHBOARDS_URL = (username: string = UserSettingStore.UserName) => `api/default/users/${username}/`;
export const DASHBOARD_URL = (dashboard: string, startTime: Date, endTime: Date) =>
  `vuSmartMaps/api/${UserSettingStore.TenantId}/bu/${
    UserSettingStore.BuId
  }/dashboard/${dashboard}/?start_time=${startTime.getTime()}&end_time=${endTime.getTime()}&mobile_kpi`;
