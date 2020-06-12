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

import { AuthActions, AuthActionTypes } from '../action/types';
import { Reducer } from 'react';
import { UserSettingStore, ImageManager } from '@vu/utils';

/**
 * This will prevent user from misspelling the AuthState variable
 */
export type AuthStore = {
  auth: AuthState;
};

/**
 * type for Auth State
 *
 * @export
 * @interface AuthState
 */
export interface AuthState {
  initialized: boolean;
  isAuthenticated: boolean;
  loggingIn: boolean;
  /** True: When there is a duplicate session preventing user from Logging In*/
  duplicateSession?: boolean;
  user: string;
  error: string;
}
export const AuthInitialState: AuthState = {
  isAuthenticated: undefined,
  loggingIn: false,
  initialized: false,
  user: UserSettingStore.UserName,
  error: undefined,
};
export const AuthUnauthorizedState: AuthState = {
  initialized: true,
  isAuthenticated: false,
  loggingIn: false,
  user: '',
  error: undefined,
};

/**
 *
 * @param state The Initial Sttae
 * @param action The Action Type passed by reducer
 * @returns {AuthState} Auth State
 */
export const AuthReducer: Reducer<AuthState, AuthActions> = (state = AuthInitialState, action): AuthState => {
  switch (action.type) {
    case AuthActionTypes.LOGIN:
      return { ...state, loggingIn: true, error: undefined };
    case AuthActionTypes.LOGIN_CHECKED:
      return { ...state, initialized: true };
    case AuthActionTypes.LOGIN_SUCCESS:
      UserSettingStore.UserName = action.username;
      ImageManager.LoadImages();
      return {
        loggingIn: false,
        user: action.username,
        isAuthenticated: true,
        duplicateSession: false,
        initialized: true,
        error: undefined,
      };
    case AuthActionTypes.LOGIN_FAILED:
      return { ...state, duplicateSession: false, loggingIn: false, error: action.error };
    case AuthActionTypes.DUPLICATE_SESSION:
      return { ...state, loggingIn: false, duplicateSession: true, error: action.error };
    case AuthActionTypes.LOGOUT:
      return { ...state, loggingIn: true, error: undefined };
    // Depreciate Code
    // Already handeled in root reducer, no need now
    case AuthActionTypes.LOGOUT_SUCCESS:
      localStorage.clear();
      return {
        loggingIn: false,
        isAuthenticated: false,
        duplicateSession: false,
        user: undefined,
        error: undefined,
        initialized: true,
      };
    case AuthActionTypes.LOGOUT_FAILED:
      return { ...state, loggingIn: false, error: action.error };

    default:
      return state;
  }
};
