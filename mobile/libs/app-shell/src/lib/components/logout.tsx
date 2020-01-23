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

import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { LogoutUser } from '@vu/store';
import { Redirect, withRouter, RouteChildrenProps } from 'react-router';
import queryString from 'query-string';
import { compose } from 'redux';
import { AppShellStore } from '../store/app-shell-store';

type LogoutProps = {
  isAuthenticated: boolean;
  user: string;
  logout: () => void;
} & RouteChildrenProps &
  DispatchProp;

/**
 * Render a text that can be used anywhere we need a logout action
 *
 * @param {LogoutProps} props
 * @returns
 */
function internalLogout(props: LogoutProps) {
  if (!props.isAuthenticated) {
    const returnUrl = (queryString.parse(props.location.search).return_url as string) || '/login';
    return <Redirect to={returnUrl} />;
  }
  return <span onClick={props.logout}>Logout</span>;
}

const mapStateToProps = (state: AppShellStore) => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
});
const mapDispatchToProps = (dispatch) => ({
  logout: () => {
    dispatch(LogoutUser());
  },
});

export const LogoutButton = compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(internalLogout);

export default LogoutButton;
