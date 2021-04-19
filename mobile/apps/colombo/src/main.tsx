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
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './styles.scss';
import { AppShell } from '@vu/app-shell';
import { environment } from './environments/environment';
import { merge } from 'lodash';
import { defaults } from 'chart.js';
import * as ChartJsConfig from './app/chart-js-config.json';
import configureStore from './app/store';
import { routes } from './app/routes';

merge(defaults, (ChartJsConfig as any).default);


/**
 * Will prevent right clicks e.button will give button number,
 * For right click it's 2 we are preventing default event
 * so that right click is disabled
 */
document.oncontextmenu = (e) => {
  if (e.button === 2) {
    // 2 means right click
    e.preventDefault();
    return false;
  }
};

const store = configureStore(environment);

// We want to redirect some legacy URLs
// So we'll redirect them before loading application

const redirectPaths = [
  { from: '/vunet.html', to: '/vunet' },
];

const redirectTo = redirectPaths.find((a) => location.pathname.startsWith(a.from));
if (redirectTo) {
  window.location.href = redirectTo.to + window.location.search;
} else {
  const routing = (
    <Provider store={store}>
      <AppShell config={{ baseUrl: window.location.origin, RouterBaseName: environment.basePath }} appRoutes={routes} />
    </Provider>
  );
  ReactDOM.render(routing, document.getElementById('root') as HTMLElement);
}
