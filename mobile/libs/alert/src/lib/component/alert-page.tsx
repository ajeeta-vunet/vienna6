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

import React, { Component } from 'react';
import { Container, Card, CardBody } from 'reactstrap';
import { RouteChildrenProps } from 'react-router';
import { ALERT_URL, AlertDetails } from '../store';

import { AlertComponent } from './alert-component';
import { Link } from 'react-router-dom';
import './alert.scss';
import { vuHttp } from '@vu/http';

/**
 * Type for alertPage Props
 */
type AlertProps = RouteChildrenProps<{ alertId: string }>;
type AlertState = { alert: AlertDetails; error?: boolean };

/**
 * Alert Page Component
 * Handles routes /alerts
 */
export class AlertPage extends Component<AlertProps, AlertState> {
  /**
   * Creates an instance of AlertPageDashboard.
   * @param {Readonly<AlertProps>} props
   */
  constructor(props: Readonly<AlertProps>) {
    super(props);
    this.state = { alert: undefined };

    vuHttp
      .get$<AlertDetails>(ALERT_URL(props.match.params.alertId))
      .subscribe((alert) => this.setState({ alert }));
  }
  componentDidCatch() {
    this.setState({ error: true });
  }

  /**
   * Will be used to update alerts if time changes
   *
   * @param {AlertProps} props
   * @param {AlertState} state
   */
  componentWillReceiveProps(props: AlertProps, state: AlertState) {}

  /**
   * Will render the alert page content
   *
   * @returns JSX Element
   */
  render() {
    const {
      state: { alert },
    } = this;

    if (!alert)
      return (
        <Container className="py-3" fluid={true}>
          <Card>
            <CardBody className="text-center">
              <img width="100" src="/assets/images/loader.gif" />
            </CardBody>
          </Card>
        </Container>
      );
    return (
      <Container className="py-3 alert-container" fluid={true}>
        <AlertComponent data={alert} />
        <div className="back-container mb-3">
          <Link to={'.'}>
            <img src="/assets/images/Calender_Arrow_Left.svg" alt="" />
            Back
          </Link>
        </div>
      </Container>
    );
  }
}
