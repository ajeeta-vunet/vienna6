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
import { RouteComponentProps, RouteProps } from 'react-router-dom';
import { AuthorizedRoute } from './authorized-route';

export interface PrivateRouteProps extends RouteProps {
  component:React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
}

/**
 * Can be used in place of <Route /> element
 * It uses AuthorizedRoute and renders component only if a user is authorized
 * @extends {Route}
 */
export const PrivateRoute = ({ component, ...rest }: PrivateRouteProps) => (
  <AuthorizedRoute component={component} authorizer={() => true} {...rest} />
);
