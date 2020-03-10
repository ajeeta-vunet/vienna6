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
import LoginForm from './login-form';
import { Row, Col, Container } from 'reactstrap';

/**
 * Will render the login page
 * The UI for login page
 *
 * @export
 * @function LoginPage
 */
export const LoginPage = () => (
  <div className="login-page">
    <Container fluid={true}>
      <Row className="vu-login mb-5">
        <Col>
          <div className="login-header text-center ">
            <img className="login_image" src='/mobile/assets/vunet_logo.svg' alt="" />
            <p className="login_wtsl">Welcome to the Smart life with</p>
            <h3 className="login_vsm">vuSmartMaps</h3>
          </div>
          <LoginForm />
        </Col>
      </Row>
    </Container>
    <Container fluid={true} className="vu-login-footer-bg text-center">
      <Row>
        <Col>
          <div className="nh mb-2">
            <a href="https://vunetsystems.com/support/">Need help?</a>
          </div>
          {/* <p className="o text-center mb-5">
            By using vuSmartMaps, you confirm you have read and understood our
            <Link className="pp" to={'/privacy'}>
              Privacy policy
            </Link>
          </p> */}
          <p className="cr">Copyright &copy; Team Vunet Systems - {new Date().getFullYear()}, All Rights Reserved</p>
        </Col>
      </Row>
    </Container>
  </div>
);

export default LoginPage;
