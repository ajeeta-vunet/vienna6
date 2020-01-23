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
 
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
*/

import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { AuthState } from '@vu/store';
import { PrivateRouteProps } from './private-route';
import { DispatchProp, connect } from 'react-redux';
import { AppShellStore } from '../store/app-shell-store';
import { LoginUrl } from '../config';

/**
 * Properties for {AuthorizedRoute}
 *
 * @interface AuthorizedRouteProps
 * @extends {PrivateRouteProps}
 */
export interface AuthorizedRouteProps extends PrivateRouteProps {
  /**
   * accept a function that will map {AuthState} to boolean
   * true means user can access
   * false means user can't access
   *
   * @memberof AuthorizedRouteProps
   */
  authorizer: (store: AuthState) => boolean;
}
const mapStateToProps = (state: AppShellStore) => ({
  auth: state.auth,
});
/**
 * Can be used in place of <Route /> element
 * It extends Route and add functionality to add some validation
 * @extends {Route}
 * @param {(store: AuthState) => boolean} authorizer takes a function that recieves AuthState and return true or false that will decide if a user is authorized or not
 * @param {JSX.Element} component The type of component to render
 */
export const AuthorizedRoute = connect(mapStateToProps)(
  ({
    component,
    authorizer,
    auth,
    ...rest
  }: AuthorizedRouteProps & DispatchProp & { auth: AuthState }): JSX.Element => {
    const allowed = auth.isAuthenticated && authorizer(auth);
    return (
      <Route
        {...rest}
        render={(props: RouteComponentProps & React.ClassAttributes<typeof component>) =>
          allowed ? (
            React.createElement(component, props)
          ) : (
            <Redirect
              to={{
                pathname: LoginUrl,
                search: '?return_url=' + props.location.pathname,
              }}
            />
          )
        }
      />
    );
  },
);
