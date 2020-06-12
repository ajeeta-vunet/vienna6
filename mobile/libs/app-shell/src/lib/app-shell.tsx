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
import { ALL_DASHBOARDS_URL, AuthActionTypes, LoginSuccessAction, LoginChecked } from '@vu/store';
import { UserSettingStore, isMobile } from '@vu/utils';

export interface AppShellProps {
  config: {
    baseUrl: string;
    RouterBaseName: string;
  };
  appRoutes: AppRoute[];
  isAuthenticated: boolean;
  isMobile: boolean;
  isStickyHeaderVisible: boolean;
  setNavbarState: (arg0: boolean) => void;
  userIsLoggedIn: (user: string) => void;
}

/**
 *
 *
 * @returns {Promise<boolean>}
 */
async function isUserLoggedIn(): Promise<boolean> {
  try {
    if (!UserSettingStore.UserName) return false;
    const resp = await fetch(ALL_DASHBOARDS_URL());
    return resp.status === 200;
  } catch (error) {
    localStorage.clear();
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
    isUserLoggedIn().then((a) => {
      // Pass Username if session is present Otherwise send null
      this.props.userIsLoggedIn(a?UserSettingStore.UserName: null);
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
    const {isAuthenticated, isMobile} = this.props;
    return (
      <Router basename={this.props.config.RouterBaseName}>
        {isAuthenticated && isMobile ? <Header /> : null}
        {isAuthenticated && isMobile? <Sidebar /> : null}
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
        {isAuthenticated && isMobile ? <Footer /> : null}
      </Router>
    );
  }
}

const mapStateToProps = (state: AppShellStore) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isMobile: state.appui.isMobile,
  isStickyHeaderVisible: state.appui.isStickyHeaderVisible,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  setNavbarState: (show: boolean) =>
    dispatch({
      type: show ? AppUiActionEnum.STICKY_HEADER_SHOW : AppUiActionEnum.STICKY_HEADER_HIDE,
    }),
  userIsLoggedIn: (user: string) =>
  user?
    dispatch<LoginSuccessAction>({
      type: AuthActionTypes.LOGIN_SUCCESS,
      username: user,
    }) :  dispatch<LoginChecked>({
      type: AuthActionTypes.LOGIN_CHECKED,
    }),
});
export const AppShell = connect(mapStateToProps, mapDispatchToProps)(AppShellInternal);
