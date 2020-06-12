import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { LoginForm } from './login-form';

/**
 * Will render the login page
 * The UI for login page for desktop devices
 *
 * @export
 * @function DesktopLogin
 */
export const DesktopLogin = () => (
    <Container fluid={true} className="login-outer-container">
      <Row>
        <Col md={{ size: '4', offset: 1 }} className="vunet-login-container">
          <div className="login-form my-4">
            <img className="logo" src="/assets/images/login_logo.svg" />
            <div className="login-text d-block mb-vh">Login to Get Smarter Insights.</div>
            <div className="login-form-container" ng-if="!loggedin">
              <LoginForm />
            </div>
          </div>
          <div className="footer py-2">
            Copyright &reg; Team VuNet Systems - {new Date().getFullYear()}. All Rights Reserved.
          </div>
        </Col>
        <Col md="7" className="vunet-login-right-bg-container d-none d-md-block">
          <Container className="vunet-login-right-bg">
            <Row>
              <div className="col-md-9 login-text-subheader">Welcome to Smarter Operations with</div>
            </Row>
            <Row>
              <div className="col-md-9 login-text-header">vuSmartMaps</div>
            </Row>
            <Row>
              <div className="col-md-9 login-text">
                With one single pane of glass, visualizing and interacting with your application infrastructure and
                business data will never be the same again. vuSmartMaps brings in everything you want to monitor, analyse
                and correlate in one place
              </div>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );