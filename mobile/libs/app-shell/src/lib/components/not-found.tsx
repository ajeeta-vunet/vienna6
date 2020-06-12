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
              : 'Something is not working as expected... Please reach out to your support!'}
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
