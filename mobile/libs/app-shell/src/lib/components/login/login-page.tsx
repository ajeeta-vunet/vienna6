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
import { isMobile } from '@vu/utils';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { AppShellStore } from '../../store';
import { AuthState } from '@vu/store';
import { LoginMobile } from './mobile-login';
import { DesktopLogin } from './desktop-login';
import queryString from 'query-string';
import { withRouter, RouteChildrenProps } from 'react-router';
import { DashboardsUrl } from '@vu/vis';
import { Redirect } from 'react-router-dom';

/**
 * Props for login Page
 */
export type LoginPageProps = {
  auth: AuthState;
  isMobile: boolean;
} & RouteChildrenProps;
class LoginPageInternal extends React.Component<LoginPageProps> {
  render() {
    if (this.props.auth.isAuthenticated && this.props.isMobile) {
      const returnUrl: string = (queryString.parse(this.props.location.search).return_url as string) || DashboardsUrl();
      return <Redirect to={returnUrl} />;
    } else if (this.props.auth.isAuthenticated && !this.props.isMobile) {
      window.location.href = window.location.origin + '/app/vienna';
    }
    if (!this.props.auth.initialized || this.props.auth.isAuthenticated) {
      return (
        <div className="kbn-loader-container">
          <div className="kbn-loader"></div>
        </div>
      );
    } else {
      // Will switch login page based on device type
      return this.props.isMobile ? <LoginMobile /> : <DesktopLogin />;
    }
  }
}

const mapStateToProps = (state: AppShellStore) => ({
  auth: state.auth,
  isMobile: state.appui.isMobile,
});

export const LoginPage = compose(withRouter, connect(mapStateToProps))(LoginPageInternal);
export default LoginPage;
