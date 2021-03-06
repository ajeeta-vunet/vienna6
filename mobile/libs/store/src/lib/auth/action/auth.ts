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

import { AuthActionTypes, LoginSuccessAction, LoginFailed, DuplicateSession } from './types';
import { btou, aesencrypt, isMobile, UserSettingStore } from '@vu/utils';
import { vuHttp, getErrorMessage } from '@vu/http';
import { LOGOUT_URL, LOGIN_URL } from '../../urls';
import { LoginFormState } from '../state';
import { Dispatch } from 'redux';
import { AxiosResponse } from 'axios';

// Headers added to request
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
    vuHttp.post$(LOGOUT_URL, '', vuApiHeaders).subscribe(
      () => {
        dispatch({ type: AuthActionTypes.LOGOUT_SUCCESS });
      },
    );
  };
}

/**
 * This action can be used to login a user
 *
 * @export
 * @param {LoginFormState} { name, password }
 * @returns
 */
export function LoginUser({ name, password, captchaKey, captchaSolution }: LoginFormState, terminate_active_session: boolean = false) {

  return async function(dispatch: Dispatch) {
    dispatch({ type: AuthActionTypes.LOGIN });
    vuHttp
      .post$(
        LOGIN_URL,
        `name=${name}&password=${aesencrypt(name, password)}${
          captchaKey !== 'no_captcha' ? `&captcha_key=${captchaKey}&captcha_solution=${captchaSolution}` : ''
        }${terminate_active_session? '&terminate_active_session=true': ''}`,
        vuApiHeaders,
      )
      .subscribe(
        (_) => {
          if (!isMobile()) {
            // Check whether return_url exists in the local storage.
            // This key exists in the local storage if user comes from
            // external link or accessing vuSmartMaps without login.
            const return_url = window.localStorage.getItem('return_url')
            window.localStorage.clear();
            UserSettingStore.UserName = name;
            // If the url has the next parameter, we should redirect to url
            // after login.
            const params = new URLSearchParams(window.location.search);
            if(window.location.search.indexOf('next') > -1) {
              window.location.href = window.location.origin + params.get('next');
            }
            // If return_url exists then redirect the user to the corresponding
            // page after successful authentication.
            else if (return_url !== null) {
              window.location.href = window.location.origin + '/app/vienna' + return_url;
            }
            else {
              window.location.href = window.location.origin + '/app/vienna';
            }
          } else {
            dispatch({
              type: AuthActionTypes.LOGIN_SUCCESS,
              username: name,
            } as LoginSuccessAction);
          }
        },
        (error: AxiosResponse) => {
          if (error.status === 409 /**Duplicate Session */) {
            dispatch({
              type: AuthActionTypes.DUPLICATE_SESSION,
              error: getErrorMessage(error)
            } as DuplicateSession);
          } else if (error.status === 400 /** Invalid Captcha */) {
            let msg = getErrorMessage(error);
            if (msg.indexOf('statusText') !== -1) msg = 'Invalid Captcha';
            dispatch({
              type: AuthActionTypes.LOGIN_FAILED,
              error: msg,
            } as LoginFailed);
          } else {
            dispatch({
              type: AuthActionTypes.LOGIN_FAILED,
              error: getErrorMessage(error),
            } as LoginFailed);
          }
        },
      );
  };
}
