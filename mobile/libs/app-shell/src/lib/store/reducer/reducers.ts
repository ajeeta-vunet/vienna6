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
import { AppUiActions, AppUiActionEnum } from '../action';

/**
 * Will provide and interface which we can use set operation on the classes
 *
 * @export
 * @interface AppUiStore
 */
export interface AppUiStore {
  appui: AppUiState;
}

/**
 * Defines the state of app ui
 *
 * @export
 * @interface AppUiState
 */
export interface AppUiState {
  // true if sidebar is open, otherwise false
  isSidebarOpen: boolean;
  // true if timeselection is open, otherwise false
  isTimeSelectorOpen: boolean;
  // true if Header is sticky, otherwise false
  isStickyHeaderVisible: boolean;
}
export const AppUiInitialState: AppUiState = {
  isSidebarOpen: false,
  isTimeSelectorOpen: false,
  isStickyHeaderVisible: false,
};

/**
 * Reducer for App UI
 *
 * @export
 * @param {*} [state=initialState] Initial State for AppUi
 * @param {*} action Action Name
 * @returns Updated State
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AppUiReducer: Reducer<AppUiState, AppUiActions> = (state: any = AppUiInitialState, action: any) => {
  switch (action.type) {
    case AppUiActionEnum.SIDEBAR_CLOSE:
      return {
        ...state,
        isTimeSelectorOpen: false,
        isSidebarOpen: false,
      };
    case AppUiActionEnum.SIDEBAR_TOGGLE:
      return {
        ...state,
        isTimeSelectorOpen: false,
        isSidebarOpen: !state.isSidebarOpen,
      };
    case AppUiActionEnum.TIMESELECTOR_CLOSE:
      return {
        ...state,
        isSidebarOpen: false,
        isTimeSelectorOpen: false,
      };
    case AppUiActionEnum.TIMESELECTOR_TOGGLE:
      return {
        ...state,
        isSidebarOpen: false,
        isTimeSelectorOpen: !state.isTimeSelectorOpen,
      };
    case AppUiActionEnum.STICKY_HEADER_HIDE:
      return {
        ...state,
        isStickyHeaderVisible: false,
      };
    case AppUiActionEnum.STICKY_HEADER_SHOW:
      return {
        ...state,
        isStickyHeaderVisible: true,
      };
    default:
      return state;
  }
};
