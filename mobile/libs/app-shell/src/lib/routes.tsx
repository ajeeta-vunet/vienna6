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

import { Redirect, Route, RouteProps } from 'react-router-dom';
import React from 'react';
import { LoginUrl, LogoutUrl, HelpUrl } from './config';
import { LoginPage, LogoutButton, HelpPage, Notfound } from './components';
import { AuthState } from '@vu/store';

export type AppRoute =
  | {
      routeProps: RouteProps;
      name: string;
      icon?: string;
      type: 'Route' | 'PrivateRoute';
    }
  | {
      routeProps: RouteProps;
      name: string;
      icon?: string;
      type: 'AuthorizedRoute';
      authorizer: (a: AuthState) => boolean;
    }
  | {
      component: JSX.Element;
      name: string;
      type: 'JSX';
    };

export function AddAppSpecificRoutes(routes: AppRoute[]): AppRoute[] {
  return [
    { type: 'JSX', component: <Redirect key="redirect" exact from="/" to={LoginUrl} />, name: 'Redirect' },
    { type: 'Route', name: 'Login', routeProps: { component: LoginPage, path: LoginUrl } },
    { type: 'PrivateRoute', name: 'Logout', routeProps: { component: LogoutButton, path: LogoutUrl } },
    { type: 'Route', name: 'Help', routeProps: { component: HelpPage, path: HelpUrl } },
    ...routes,
    { type: 'JSX', component: <Route component={Notfound} />, name: '404' },
  ];
}
