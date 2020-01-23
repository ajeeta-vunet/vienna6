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

const BUKey = 'VU_BU_ID';
const UserNameKey = 'username';
const UserGroupKey = 'VU_USER_GROUP';
const TenantKey = 'VU_TENANT_ID';

export class UserSettingStore {
  static get TenantId() {
    return JSON.parse( localStorage.getItem(TenantKey));
  }
  static set TenantId(TenantId: number) {
    localStorage.setItem(TenantKey, JSON.stringify(TenantId));
  }
  static get BuId() {
    return JSON.parse(localStorage.getItem(BUKey));
  }
  static set BuId(BuId: number) {
    localStorage.setItem(BUKey, JSON.stringify(BuId));
  }
  static get UserName(): string {
    return localStorage.getItem(UserNameKey);
  }
  static set UserName(v: string) {
    localStorage.setItem(UserNameKey, v);
  }
  static get UserGroup(): string {
    return localStorage.getItem(UserGroupKey);
  }
  static set UserGroup(v: string) {
    localStorage.setItem(UserGroupKey, v);
  }
}
