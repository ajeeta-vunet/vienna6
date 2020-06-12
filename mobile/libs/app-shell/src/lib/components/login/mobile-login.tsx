
import React from 'react';
import LoginForm from './login-form';
import { Row, Col, Container } from 'reactstrap';

/**
 * Will render the login page
 * The UI for login page for mobile devices
 *
 * @export
 * @function LoginMobile
 */
export const LoginMobile = () => (
    <div className="login-page">
      <Container fluid={true}>
        <Row className="vu-login mb-5">
          <Col>
            <div className="login-header text-center ">
              <img className="login_image" src="/assets/images/vunet_logo.svg" alt="" />
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