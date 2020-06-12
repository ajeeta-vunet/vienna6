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

import { Card, CardHeader, CardBody, Row, Col, Button, Fade } from 'reactstrap';
import React, { Component } from 'react';
import { SeverityValues, ALERT_SEVERITY_URL } from '../store';
import { toTitleCase } from '@vu/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { vuHttp } from '@vu/http';
import { TimeRangeStore } from '@vu/store';

export interface SeverityApiResponse {
  'Time-Periods': AlertSummary[];
}

export interface AlertSummary {
  period: string;
  critical: number;
  information: number;
  warning: number;
  total: number;
  error: number;
}

type AlertEventProps = {
  displayFilter: SeverityValues;
  filter: (a: SeverityValues) => void;
} & TimeRangeStore;
/**
 * State of Alert Event Page
 */
type AlertEventState = { displayFade: boolean; data: AlertSummary[] };

/**
 * Alert Event Component
 * Handles routes /alerts
 */
export class AlertEventCard extends Component<AlertEventProps, AlertEventState> {
  constructor(props: Readonly<AlertEventProps>) {
    super(props);
    this.state = { displayFade: false, data: [] };
    let {
      props: {
        timerange: { end, start },
      },
    } = this;
    vuHttp
      .post$<unknown, SeverityApiResponse>(ALERT_SEVERITY_URL, {
        extended: {
          es: {
            filter: {
              bool: {
                must:
                  props.displayFilter === '*' ? [] : [{ match_phrase: { severity: { query: props.displayFilter } } }],
              },
            },
          },
        },
        time: { gte: start.getTime(), lte: end.getTime() },
        format: 'alerts_format',
      })
      .subscribe(({ 'Time-Periods': TimePeriod }) => {
        this.setState({ data: TimePeriod });
      });
  }
  /**
   * Will fade in out a message
   */
  displayFilterAppliedNotification() {
    // any because VS code infer wrong type
    let timer: any;
    clearTimeout(timer);
    this.setState({ displayFade: true });
    timer = setTimeout(() => {
      this.setState({ displayFade: false });
    }, 2000);
  }

  render() {
    const {
      state: { data },
      props: { filter, displayFilter },
    } = this;
    const timePeriodData = data[0];


    /**
     * We will return null if there is no data. Otherwise null exception will thrown.
     */
    if (!data || !data.length) return <></>;
    return (
      <Card className="mb-2 shadow alert-main">
        <CardHeader>Event Summary</CardHeader>
        <CardBody className="px-2">
          <Row>
            <div className="text-center alert-summary-left">
              <h1
                onClick={() => {
                  this.displayFilterAppliedNotification();
                  filter('*');
                }}
                className="a-count a-count-big d-inline-block"
              >
                {timePeriodData.total}
              </h1>
              <p className="filter-name">
                <strong>Total</strong>
              </p>
            </div>
            <div className="alert-summary-right">
              <Row>
                {(['critical', 'error', 'warning', 'information'] as SeverityValues[]).map((severity) => (
                  <Col
                    xs={3}
                    className="text-center"
                    onClick={() => {
                      this.displayFilterAppliedNotification();
                      severity === displayFilter ? filter('*') : filter(severity);
                    }}
                  >
                    <Button
                      color={severity === displayFilter || displayFilter === '*' ? severity : 'light'}
                      className="circular a-count text-white"
                    >
                      {timePeriodData[severity]}
                    </Button>
                    <p
                      className={
                        'text-truncate filter-name text-' +
                        (severity === displayFilter || displayFilter === '*' ? severity : 'light')
                      }
                    >
                      {toTitleCase(severity)}
                    </p>
                  </Col>
                ))}
                <Col xs={12}>
                  <Fade in={this.state.displayFade} className="text-center text-information">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    Filter {toTitleCase(displayFilter)} applied.
                  </Fade>
                </Col>
              </Row>
            </div>
          </Row>
        </CardBody>
      </Card>
    );
  }
}
