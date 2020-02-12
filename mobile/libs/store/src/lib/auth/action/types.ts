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
export enum AuthActionTypes {
  LOGIN = 'LOGIN',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
  LOGOUT_FAILED = 'LOGOUT_FAILED',
}
export type LogoutUserAction = {
  type: AuthActionTypes.LOGOUT;
};
export type LogoutSuccessUserAction = {
  type: AuthActionTypes.LOGOUT_SUCCESS;
};
export type LoginUserAction = {
  type: AuthActionTypes.LOGIN;
};
export type LoginSuccessAction = {
  type: AuthActionTypes.LOGIN_SUCCESS;
  username: string;
};
export type LoginFailed = {
  type: AuthActionTypes.LOGIN_FAILED;
  error: string;
};
export type LogoutFailed = {
  type: AuthActionTypes.LOGOUT_FAILED;
  error: string;
};
export type AuthActions =
  | LoginUserAction
  | LoginSuccessAction
  | LoginFailed
  | LogoutUserAction
  | LogoutSuccessUserAction
  | LogoutFailed;
