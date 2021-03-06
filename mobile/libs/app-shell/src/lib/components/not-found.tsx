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
import { Link } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { DashboardsUrl } from '@vu/vis';
import { connect } from 'react-redux';
import { AppShellStore } from '../store';
import { AuthState } from '@vu/store';
import { LoginUrl } from '../config';
import _ from 'lodash';
/**
 * Will render the default page
 * when any route is not matched
 *
 * @export
 * @returns
 */
export const NotfoundInternal = (props: { auth: AuthState; isMobile: boolean }) => {
  if (window.location !== window.parent.location) {
    setTimeout(window.parent.window.location.reload, 2000);
  }
  // If user lands in the not found page means user is trying to
  // log in to vuSmartMaps from external link or access pages directly
  // other than login
  // So check whether return_url key already exists in the local storage
  // If exists, remove that first.
  if (_.has(window.localStorage, 'return_url')) {
    window.localStorage.removeItem('return_url');
  }
  window.localStorage.setItem('return_url', window.location.hash);
  const {
    auth: { isAuthenticated },
    isMobile,
  } = props;
  return (
    <div className="container-fluid py-4 bg-white">
      <Row className="text-center">
        <Col sm="12" className="text-center">
          <img className="w-25" src="/assets/images/login_logo.png" />
        </Col>
        <Col sm="12">
          <img className="error-page-image" src="/assets/images/404_image.png" />
        </Col>
        <Col>
          <h4 className="mb-3">
            {isAuthenticated
              ? "The page you are looking isn't available."
              : <div className="error-page-message">
                  You have arrived at this page because of one of the following reasons:
                  <br />
                  <ol className="error-page-message-list">
                    <li>You were inactive for too long.</li>
                    <li>You logged in from another session.</li>
                    <li>You tried to access an invalid URL.</li>
                  </ol>
                  <div className="error-page-message-login-again">
                  Please login again
                  </div>
                </div>}
          </h4>
          {!isAuthenticated ? (
            <Link to={LoginUrl}>
              <Button color="primary" size="lg">
                Go back to Login
              </Button>
            </Link>
          ) : isMobile ? (
            <Link to={DashboardsUrl()}>
              <Button color="primary" size="lg">
                Go to Dashboards
              </Button>
            </Link>
          ) : (
            <a href="/app/vienna">
              <Button color="primary" size="lg">
                Go to Dashboards
              </Button>
            </a>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state: AppShellStore) => ({
  auth: state.auth,
  isMobile: state.appui.isMobile,
});

export const Notfound = connect(mapStateToProps)(NotfoundInternal);
export default Notfound;
