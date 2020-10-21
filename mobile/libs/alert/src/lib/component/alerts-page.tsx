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
import { connect } from 'react-redux';
import { Container, Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { Dispatch } from 'redux';
import {
  LoadAlertsAction,
  AlertStore,
  Alert,
  AlertSetFilterAction,
  AlertActionEnum,
  MAX_ALERTS,
  SeverityValues,
} from '../store';

import { TimeRangeStore } from '@vu/store';
import { Link } from 'react-router-dom';
import './alert.scss';
import { AlertEventCard } from './alert-event-summary';
import { AppUiActionEnum, AppTitle, SetTitleAction } from '@vu/app-shell';
import { toTitleCase } from '@vu/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendar, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { AlertsUrl } from '../alert.module';

/**
 * Proptype for this Component
 *
 */
type TSProps = {
  /**
   * If alert is displayed full
   */
  full: boolean;
  /**
   * The data to be displayed
   */
  data: Alert;
};
/**
 * The component which will show an alert component
 *
 * @param {TSProps} props
 */
export const AlertComponent = (props: TSProps) => {
  const data = props.data;

  const regex = /([₹$-]*[\s]?\d[\d\.,]*[%\w]*)/iu;
  const summary = data.summary.replace(regex, '<div class="metricValue">$1</div>');
  const smallMetric = regex.exec(data.summary);
  return (
    <Col className="col-12 px-0">
      <Card className="vu-alert-card shadow">
        <CardHeader>
          <div className="left">
            <div className="heading">vuSmartMaps Notification</div>
            <div className="subheading">
              Status : <span className={'text-' + data.severity}>{toTitleCase(data.severity)}</span>
            </div>
          </div>
          <div className="right">
            <div className="px-1">
              <FontAwesomeIcon icon={faClock} className="text-accent" /> {moment(data.timestamp).format('YYYY-MM-DD')}
            </div>
            <div className="px-1">
              <FontAwesomeIcon icon={faCalendar} className="text-accent" /> {moment(data.timestamp).format('HH:MM A')}
            </div>
            {!props.full ? (
              <Link to={`${AlertsUrl}/${data.id}`} className="pl-1">
                <FontAwesomeIcon className="text-dark" icon={faExternalLinkAlt} />
              </Link>
            ) : null}
          </div>
        </CardHeader>
        <CardBody>
          <Row className="mb-2">
            <Col
              className={'col-5 left-content' + ((smallMetric && smallMetric[0].length>7) ? ' smallMetric' : '')}
              dangerouslySetInnerHTML={{ __html: summary }}
            ></Col>
            <Col className="col-7 right-content">
              <p>
                This condition has been active from{' '}
                <span className="event-date">{moment(data.timestamp).format('HH:MM A, DD MMM, YYYY')}</span>
                <br />
                {data.duration ? <b>(total duration of {Math.floor(data.duration / 60)} minutes now).</b> : null}
              </p>
              <p className="mb-0">{data.description}</p>
            </Col>
          </Row>
          {// Tags
          data.tags ? (
            <Row>
              <Col className="col-12">
                <div className="alert-card-heading h6">Tags</div>
                <div className="tags">
                  {/**
                   * Tags will come as // #random #tag
                   * We'll first split with spaces and then create a new span for each tag */}
                  {data.tags.split(' ').map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </Col>
            </Row>
          ) : null}
        </CardBody>
      </Card>
    </Col>
  );
};

/**
 * Type for alertPage Props
 */
type AlertProps = AlertStore & TimeRangeStore & DispatchProps;
type AlertState = {};

const mapStateToProps = (state: AlertStore & TimeRangeStore): AlertStore & TimeRangeStore => ({
  alert: state.alert,
  timerange: state.timerange,
});

type DispatchProps = {
  loadAlerts: (filter: SeverityValues) => void;
  setFilter: (filter: SeverityValues) => void;
  setTitle: (title: AppTitle) => void;
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  loadAlerts: (filter: SeverityValues) => dispatch<any>(LoadAlertsAction(filter)),
  setFilter: (f: SeverityValues) => dispatch<AlertSetFilterAction>({ type: AlertActionEnum.SET_FILTER, filter: f }),
  setTitle: (title: AppTitle) => dispatch<SetTitleAction>({ type: AppUiActionEnum.SET_TITLE, title: title }),
});

/**
 * Alert Page Component
 * Handles routes /alerts
 */
export const AlertsPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  class AlertPageDashboard extends Component<AlertProps, AlertState> {
    readonly filter = (alerts: Alert[], filter: string) =>
      alerts.filter((a) => filter === '*' || a.severity === filter);

    /**
     * Creates an instance of AlertPageDashboard.
     * @param {Readonly<AlertProps>} props
     */
    constructor(props: Readonly<AlertProps>) {
      super(props);
    }

    /**
     * Will be used to update alerts if time changes
     *
     * @param {AlertProps} props
     * @param {AlertState} state
     */
    componentWillReceiveProps(props: AlertProps, state: AlertState) {
      this.props.setTitle({
        heading: 'Alert',
        subHeading: toTitleCase(props.alert.displayFilter).replace(/^\*$/giu, 'All') + ' Alerts',
        displayLeftArrow: false,
        displayRightArrow: false,
      });
      if (
        !this.props.alert.loading && // If request is not already made
        (props.timerange.start !== this.props.timerange.start || // Start time is changed
        props.timerange.end !== this.props.timerange.end || // End time is changed
          props.alert.displayFilter !== this.props.alert.displayFilter) // Filter is changed
      ) {
        this.props.loadAlerts(props.alert.displayFilter);
      }
    }

    /**
     * Will render the alert page content
     *
     * @returns JSX Element
     */
    render() {
      const {
        props: { alert },
        props,
      } = this;

      if (!alert || alert.loading)
        return (
          <Container className="py-3" fluid={true}>
            <Card>
              <CardBody className="text-center">
                <img width="100" src="/assets/images/loader.gif" />
              </CardBody>
            </Card>
          </Container>
        );
      else if (!alert.loading && alert.alerts === undefined) {
        props.loadAlerts(alert.displayFilter);
      }

      let filteredAlerts = [];
      try {
        filteredAlerts = this.filter(alert.alerts, alert.displayFilter);
      } catch {}
      return (
        <Container className="py-3 alert-container" fluid={true}>
          <AlertEventCard displayFilter={alert.displayFilter} filter={props.setFilter} timerange={props.timerange} />

          {!alert.alerts || alert.alerts.length === 0 ? (
            <Card className="shadow">
              <CardBody>No alerts found</CardBody>
            </Card>
          ) : (
            <>
              {filteredAlerts.slice(0, MAX_ALERTS).map((v, i) => (
                <AlertComponent key={i} full={false} data={v} />
              ))}
              {filteredAlerts.length > 100 ? <p className="my-5 text-center">Only top 100 alerts are shown.</p> : null}
            </>
          )}
        </Container>
      );
    }
  },
);
