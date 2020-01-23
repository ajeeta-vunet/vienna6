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

import { AuthActionTypes, LoginSuccessAction, LoginFailed } from './types';
import { btou } from '@vu/utils';
import { vuHttp } from '@vu/http';
import { LOGOUT_URL, LOGIN_URL } from '../../urls';
import { LoginFormState } from '../state';
import { Dispatch } from 'redux';
export const vuApiHeaders = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

/**
 * This action can be used to logout the user
 *
 * @export
 * @returns
 */
export function LogoutUser() {
  return async (dispatch: Dispatch) => {
    dispatch({ type: AuthActionTypes.LOGOUT });
    try {
      await vuHttp.post(LOGOUT_URL, '', vuApiHeaders);
      dispatch({ type: AuthActionTypes.LOGOUT_SUCCESS });
    } catch (err) {
      /**
       * HACK for 403 is an error
       * If we get 403 means we are logged out
       */
      if (JSON.stringify(err).indexOf('403') !== -1) dispatch({ type: AuthActionTypes.LOGOUT_SUCCESS });
      dispatch({
        type: AuthActionTypes.LOGIN_FAILED,
        error: JSON.stringify(err),
      } as LoginFailed);
    }
  };
}

/**
 * This action can be used to login a user
 *
 * @export
 * @param {LoginFormState} { name, password }
 * @returns
 */
export function LoginUser({ name, password }: LoginFormState) {
  return async function(dispatch: Dispatch) {
    dispatch({ type: AuthActionTypes.LOGIN });
    try {
      await vuHttp.post(LOGIN_URL, `name=${name}&password=${btou(password)}`, vuApiHeaders);
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        username: name,
      } as LoginSuccessAction);
    } catch (err) {
      // TODO:  Better Message
      const msg = JSON.stringify(err).indexOf('401') !== -1 ? 'Invalid Username or Password' : err;
      dispatch({
        type: AuthActionTypes.LOGIN_FAILED,
        error: msg,
      } as LoginFailed);
    }
  };
}
