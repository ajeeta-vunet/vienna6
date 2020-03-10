import { AppTitle } from '../reducer/reducers';

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

/**
 * Enum for AppUi Actions
 *
 * @export
 * @enum {number}
 */
export enum AppUiActionEnum {
  SIDEBAR_CLOSE = 'SIDEBAR_CLOSE',
  SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE',
  TIMESELECTOR_CLOSE = 'TIMESELECTOR_CLOSE',
  TIMESELECTOR_TOGGLE = 'TIMESELECTOR_TOGGLE',
  STICKY_HEADER_SHOW = 'STICKY_HEADER_SHOW',
  STICKY_HEADER_HIDE = 'STICKY_HEADER_HIDE',
  SET_TITLE = 'SET_TITLE',
}

/**
 * Action type for App UI
 *
 * @export
 * @interface AppUiAction
 */
export interface AppUiAction {
  type:
    | AppUiActionEnum.SIDEBAR_CLOSE
    | AppUiActionEnum.SIDEBAR_TOGGLE
    | AppUiActionEnum.TIMESELECTOR_CLOSE
    | AppUiActionEnum.TIMESELECTOR_TOGGLE
    | AppUiActionEnum.STICKY_HEADER_SHOW
    | AppUiActionEnum.STICKY_HEADER_HIDE;
}
export interface SetTitleAction {
  type: AppUiActionEnum.SET_TITLE;
  title: AppTitle;
}
export type AppUiActions = AppUiAction & SetTitleAction;
