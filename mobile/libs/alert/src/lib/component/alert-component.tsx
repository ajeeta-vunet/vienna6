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
import { Col, Card, CardHeader, CardBody, Row, Table } from 'reactstrap';
import { AlertDetails } from '../store';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { toTitleCase } from '@vu/utils';


/**
 * Proptype for this Component
 * 
 */
type TSProps = {
  /**
   * The data to be displayed
   */
  data: AlertDetails;
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
      <Card className="standalone vu-alert-card shadow">
        <CardHeader>
          <div className="left">
            <div className="heading">vuSmartMaps Notification</div>
            <div className="subheading">
              Status :{' '}
              <span className={"text-"+data.severity}>
                {toTitleCase(data.severity)}
              </span>
            </div>
          </div>
          <div className="right">
            <div className="px-1">
              <FontAwesomeIcon icon={faClock} className="text-accent" /> {moment(data.timestamp).format('YYYY-MM-DD')}
            </div>
            <div className="px-1">
              <FontAwesomeIcon icon={faCalendar} className="text-accent" /> {moment(data.timestamp).format('HH:MM A')}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Row className="mb-2">
            <Col
              className={'col-5 left-content' + ((smallMetric[0].length>7) ? ' smallMetric' : '')}
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
          {
          // Tags
          data.tags ? (
            <Row>
              <Col className="col-12">
                <div className="alert-card-heading h6">Tags</div>
                <div className="tags">
                  {data.tags.map((tag, i) => (
                    <span key={i} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Col>
            </Row>
          ) : null}
        </CardBody>
        {// History of similar events
        props.data.History
         && props.data.History.filter((h) => h["Event Count"] > 0).length
          ? (
          <>
            <hr />
            <h6 className="alert-card-heading px-2">Similar Events in Past</h6>
            <Table className="table-sm">
              <tbody>
                {props.data.History.filter((h) => h["Event Count"] > 0).map((h, i) => (
                  <tr key={i}>
                    <td className="text-primary">{h.name.replace(/[-_]/g, ' ')}</td>
                    <td>
                      {h["Event Count"]} incident spanning {h["Active For"]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : null}
        {// Rules and metric
        data.rules
          .filter((r) => r.metrics && r.metrics.length)
          .map((rule, i) => (
            <div key={i}>
              <hr />
              <h6 className="px-2 alert-card-heading">{rule.name}</h6>
              <Table className="table-sm" responsive={true}>
                <tbody>
                  <tr>
                    <td> Label</td>
                    <td> Insight</td>
                    <td> Duration</td>
                  </tr>
                  {rule.metrics.map((m, i) => (
                    <tr key={i}>
                      <td>{m.label}</td>
                      <td>{m.insights}</td>
                      <td>{m.formatted_value_for_event_duration}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}
      </Card>
    </Col>
  );
};
