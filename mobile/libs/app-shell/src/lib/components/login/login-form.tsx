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

import React, { ChangeEvent } from 'react';
import { Button, Form, FormGroup, Label, Input, Alert, Row, Col, Container, CardBody, Card } from 'reactstrap';
import { connect, DispatchProp } from 'react-redux';
import { AuthState, LoginFormState, LoginUser } from '@vu/store';
import { Captcha, MillisecondsInOne } from '@vu/utils';
import { AppShellStore } from '../../store/app-shell-store';
import { merge, Subject, timer, of } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';

export type LoginFormProps = {
  auth: AuthState;
} & DispatchProp;
/**
 * Will render the login form only
 * will login if correct username and password is entered
 * will redirect to return_url if specified otherwise will redirect to /dashboard
 *
 * @export
 * @class LoginForm
 * @extends {React.Component<LoginFormProps, LoginFormState>}
 */
class LoginFormInternal extends React.Component<LoginFormProps, LoginFormState> {
  refreshed$ = new Subject();
  constructor(props: LoginFormProps) {
    super(props);
    this.state = {
      name: '',
      password: '',
      captchaKey: '',
      captchaSolution: '',
      captchaImage: '',
      errors: {},
      isLoading: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.isValid = this.isValid.bind(this);

    /**
     * This will refresh the captcha after every 1 minute.
     */
    merge(of(true), this.refreshed$.pipe(exhaustMap(() => timer(MillisecondsInOne.MINUTE)))).subscribe(() =>
      this.refreshCaptcha(),
    );
  }

  /**
   * Will return if input state is valid or not
   * login button is enabled/disabled based on this state
   */
  private isValid = () =>
    this.state.name &&
    this.state.password &&
    this.state.password.length >= 4 &&
    (this.state.captchaKey === 'no_captcha' || this.state.captchaKey === '' || (this.state.captchaSolution && this.state.captchaSolution.length >= 6));
  
  /**
   * Will be used to refreh captcha
   */
  private refreshCaptcha = () => {
    Captcha.subscribe(
      (captcha) => {
        this.setState({
          captchaKey: captcha.key,
          captchaImage: captcha.image_url,
        });
        this.refreshed$.next();
      },
      () => {
        this.setState({
          captchaKey: 'no_captcha',
        });
      },
    );
  };

  /**
   * Will be called when login button is clicked
   */
  private onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.dispatch<any>(LoginUser(this.state, this.props.auth.duplicateSession));
  }

  /**
   * Will be called when any input element/state is changed
   */
  private onChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.name === 'name')
      this.setState({
        [e.target.name]: e.target.value,
      });
    if (e.target.name === 'password')
      this.setState({
        [e.target.name]: e.target.value,
      });
    if (e.target.name === 'captchaSolution')
      this.setState({
        [e.target.name]: e.target.value,
      });
    if (e.target.name === 'captchaKey')
      this.setState({
        [e.target.name]: e.target.value,
      });
  }
  render() {
    return (
      <Form onSubmit={this.onSubmit} autoComplete="off">
        <FormGroup className="mb-vh">
          <Label for="name" className="mb-1">
            Username
          </Label>
          <Input
            type="text"
            name="name"
            id="name"
            className="user-icon"
            value={this.state.name}
            onChange={this.onChange}
            tabIndex={1}
          />
        </FormGroup>
        <FormGroup className="mb-vh">
          <Label for="password" className="mb-1">
            Password
          </Label>
          <Input
            type="password"
            name="password"
            id="password"
            className="password-icon"
            value={this.state.password}
            onChange={this.onChange}
            tabIndex={2}
          />
        </FormGroup>
        {(this.state.captchaKey !== 'no_captcha' && this.state.captchaKey !== '' )? (
          <Container className="border mb-3 bg-white captcha">
            <FormGroup>
              <Label for="captchaSolution" className="mb-1">
                Type the characters you see in this image
              </Label>
              <Row className="py-2">
                <Col className="col-auto">
                  <img src={this.state.captchaImage} alt="Captcha challenge" />
                </Col>
                <Col className="col-auto px-0 refresh-btn">
                  <FontAwesomeIcon title="Refresh Captcha" icon={faRedo} size="2x" onClick={this.refreshCaptcha} />
                </Col>
                <Col>
                  <Input
                    type="text"
                    name="captchaSolution"
                    id="captchaSolution"
                    className="captcha"
                    placeholder="Solve CAPTCHA"
                    value={this.state.captchaSolution}
                    onChange={this.onChange}
                    tabIndex={3}
                  />
                </Col>
                <Col sm="12">
                  <p className="mt-2 mb-0 captcha-message">Captcha letters are case sensitive and to be entered in Upper Case only</p>
                </Col>
              </Row>
            </FormGroup>
          </Container>
        ) : (
          undefined
        )}
        {this.props.auth.error && !this.props.auth.duplicateSession? <Alert color="danger">{this.props.auth.error.toString()}</Alert> : null}
        {this.props.auth.duplicateSession? 
        <Card color="secondary" className="text-white mb-3">
          <CardBody>
            <h4>A session is already active!</h4>
            <p>You have another active session. If you click 'Sign In', your existing session will be terminated.</p>
          </CardBody>
        </Card>
        
        : null}
        <div className="text-center">
          <Button
            color="info"
            type="submit"
            className="login-btn"
            disabled={!this.isValid() || this.props.auth.loggingIn}
            tabIndex={4}
          >
            Sign In
          </Button>
        </div>
      </Form>
    );
  }
}
const mapStateToProps = (state: AppShellStore) => ({
  auth: state.auth,
});

export const LoginForm =connect(mapStateToProps)(LoginFormInternal);
export default LoginForm;
