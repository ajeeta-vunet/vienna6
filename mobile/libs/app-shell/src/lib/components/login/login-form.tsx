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
import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { connect, DispatchProp } from 'react-redux';
import { Redirect, withRouter, RouteChildrenProps } from 'react-router';
import { compose } from 'redux';
import queryString from 'query-string';
import { AuthState, LoginFormState, LoginUser } from '@vu/store';
import { DashboardsUrl } from '@vu/vis';
import { AppShellStore } from '../../store/app-shell-store';

export type LoginFormProps = { auth: AuthState } & DispatchProp & RouteChildrenProps;
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
  constructor(props: LoginFormProps) {
    super(props);
    this.state = {
      name: '',
      password: '',
      errors: {},
      isLoading: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.isValid = this.isValid.bind(this);
  }
  private isValid = () => this.state.name && this.state.password;

  private onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.dispatch<any>(LoginUser(this.state));
  }

  private onChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.name === 'name') this.setState({ [e.target.name]: e.target.value });
    if (e.target.name === 'password') this.setState({ [e.target.name]: e.target.value });
  }
  render() {
    if (this.props.auth.isAuthenticated) {
      const returnUrl: string = (queryString.parse(this.props.location.search).return_url as string) || DashboardsUrl();
      return <Redirect to={returnUrl} />;
    }
    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup className="mb-5">
          <Label for="name" className="mb-1">
            Username
          </Label>
            <Input
              type="text"
              name="name"
              id="name"
              className="user-icon"
              placeholder="Enter your username"
              value={this.state.name}
              onChange={this.onChange}
              tabIndex={1}
            />
        </FormGroup>
        <FormGroup className="mb-5">
          <Label for="name" className="mb-1">
            Password
          </Label>
            <Input
              type="password"
              name="password"
              id="password"
              className="password-icon"
              placeholder="Enter your password"
              value={this.state.password}
              onChange={this.onChange}
              tabIndex={2}
            />
        </FormGroup>
        {this.props.auth.error ? <Alert color="danger">{this.props.auth.error}</Alert> : null}
        <div className="text-center">
          <Button
            color="info"
            type="submit"
            className="login-btn"
            disabled={!this.isValid || this.props.auth.loggingIn}
            tabIndex={3}
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

// export default LoginForm;
export const LoginForm = compose(withRouter, connect(mapStateToProps))(LoginFormInternal);
export default LoginForm;
