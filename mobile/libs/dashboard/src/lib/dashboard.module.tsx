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

import { Switch } from 'react-router-dom';
import React from 'react';
import { AppRoute } from '@vu/routes';
import { ViewDashboardPage } from './component/view-dashboard';
import { DashboardPage } from './component/dashboard';
import { PrivateRoute } from '@vu/routes';
import { ExpandedVisualizationUrl, ViewDashboards, DashboardsUrl } from '@vu/vis';

/**
 * Dashboard Module internal routing
 */
const DashboardMain = () => (
  <Switch>
    <PrivateRoute path={ExpandedVisualizationUrl()} component={ViewDashboardPage} />
    <PrivateRoute path={ViewDashboards()} component={ViewDashboardPage} />
    <PrivateRoute path={DashboardsUrl()} component={DashboardPage} />
  </Switch>
);

/**
 * The main Dashboard Module
 */
export const DashboardModule: AppRoute = {
  type: 'PrivateRoute',
  routeProps: {
    path: DashboardsUrl(),
    component: DashboardMain,
  },
  name: 'Dashboard',
  icon: '',
};
