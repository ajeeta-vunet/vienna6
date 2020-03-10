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

import React, { Component } from 'react';
import './app-shell.scss';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Header, Sidebar, Footer } from './components';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { HeaderToggleScroll } from './config';
import { AppShellStore } from './store/app-shell-store';
import { AppUiActionEnum } from './store';
import { PrivateRoute, AuthorizedRoute, AppRoute } from '@vu/routes';
import { AddAppSpecificRoutes } from './routes';
import { ALL_DASHBOARDS_URL, AuthActionTypes, LoginSuccessAction } from '@vu/store';
import { UserSettingStore } from '@vu/utils';

export interface AppShellProps {
  config: {
    baseUrl: string;
    RouterBaseName: string;
  };
  appRoutes: AppRoute[];
  isAuthenticated: boolean;
  isStickyHeaderVisible: boolean;
  setNavbarState: (arg0: boolean) => void;
  setUserIsLoggedIn: (user: string) => void;
}

/**
 *
 *
 * @returns {Promise<boolean>}
 */
async function isUserLoggedInHack(): Promise<boolean> {
  try {
    let ret = undefined;
    const resp = await fetch(ALL_DASHBOARDS_URL());
    ret = resp.status === 200;
    return ret;
  } catch (error) {
    return false;
  }
}

export class AppShellInternal extends Component<AppShellProps, {}> {
  componentDidUpdate(prevProps) {
    // try{
    //   if ((this.props.location.hash !== prevProps.location.hash) || (this.props.location !== prevProps.location)) {
    //     try {
    //       // trying to use new API - https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
    //       window.scroll({
    //         top: 0,
    //         left: 0,
    //         behavior: 'smooth',
    //       });
    //     } catch (error) {
    //       // just a fallback for older browsers
    //       window.scrollTo(0, 0);
    //     }
    //   }
    // }catch{}
  }

  componentDidCatch() {
    console.error();
  }
  componentDidMount() {
    isUserLoggedInHack().then((a) => {
      if (a) this.props.setUserIsLoggedIn(UserSettingStore.UserName);
    });
    window.addEventListener('scroll', this.listenToScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll);
  }

  /**
   * Will listen to all scroll events and add Navbar is expanded state
   *
   * @memberof InternalApp
   */
  listenToScroll = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    if (winScroll > HeaderToggleScroll && !this.props.isStickyHeaderVisible) {
      this.props.setNavbarState(true);
    } else if (winScroll <= HeaderToggleScroll && this.props.isStickyHeaderVisible) {
      this.props.setNavbarState(false);
    }
  };

  render() {
    const isAuthenticated = this.props.isAuthenticated;
    return (
      <Router basename={this.props.config.RouterBaseName}>
        {isAuthenticated ? <Header /> : null}
        {isAuthenticated ? <Sidebar /> : null}
        <Switch>
          {AddAppSpecificRoutes(this.props.appRoutes).map((module: AppRoute, i: number) => {
            switch (module.type) {
              case 'JSX':
                // module.component.key = i;
                return module.component;
              case 'Route':
                return <Route {...module.routeProps} key={i} />;
              case 'PrivateRoute':
                return <PrivateRoute component={module.routeProps.component} {...module.routeProps} key={i} />;
              case 'AuthorizedRoute':
                return (
                  <AuthorizedRoute
                    component={module.routeProps.component}
                    authorizer={module.authorizer}
                    {...module.routeProps}
                    key={i}
                  />
                );
            }
          })}
        </Switch>
        {isAuthenticated ? <Footer /> : null}
      </Router>
    );
  }
}

const mapStateToProps = (state: AppShellStore) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isStickyHeaderVisible: state.appui.isStickyHeaderVisible,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  setNavbarState: (show: boolean) =>
    dispatch({
      type: show ? AppUiActionEnum.STICKY_HEADER_SHOW : AppUiActionEnum.STICKY_HEADER_HIDE,
    }),
  setUserIsLoggedIn: (user: string) =>
    dispatch<LoginSuccessAction>({
      type: AuthActionTypes.LOGIN_SUCCESS,
      username: user,
    }),
});
export const AppShell = connect(mapStateToProps, mapDispatchToProps)(AppShellInternal);
