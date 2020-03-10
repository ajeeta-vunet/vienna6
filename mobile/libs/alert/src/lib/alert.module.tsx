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

import { Switch, Route } from 'react-router-dom';
import React from 'react';
import { AlertPage } from './component/alert-page';
import { AlertsPage } from './component/alerts-page';
import { AppRoute } from '@vu/routes';

/**
 * Alert Module internal routing
 */
export const AlertMain = () => (
  <Switch>
    <Route path={AlertsUrl + '/:alertId'} component={AlertPage} />
    <Route exact path={AlertsUrl} component={AlertsPage} />
  </Switch>
);
/**
 * The start url for Alerts
 */
export const AlertsUrl = '/alerts';

/**
 * The main Alert Module
 */
export const AlertModule: AppRoute = {
  type: 'PrivateRoute',
  routeProps: {
    path: AlertsUrl,
    component: AlertMain,
  },
  name: 'Alerts',
  icon: '',
};
