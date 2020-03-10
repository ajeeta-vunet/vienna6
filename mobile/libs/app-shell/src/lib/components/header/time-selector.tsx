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

import { Card, CardHeader, CardBody, Row, Col, Collapse } from 'reactstrap';
import DatePicker, { DateInput } from '@trendmicro/react-datepicker';
import { TimeRangeEnum, TimeRangeState, CustomStartTimeRangeAction, CustomEndTimeRangeAction } from '@vu/store';
import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Dispatch } from 'redux';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { AppShellStore } from '../../store/app-shell-store';
import { AppUiActionEnum } from '../../store';

const mapStateToProps = (state: AppShellStore): TSProps => ({
  time: state.timerange,
  isTimeSelectorOpen: state.appui.isTimeSelectorOpen,
  startDate: moment(state.timerange.start).format('YYYY-MM-DD'),
  // startTime: moment(state.timerange.start).format('hh:mm:ss'),
  /** We set date to start of the day */

  startTime: '00:00:00',
  endDate: moment(state.timerange.end).format('YYYY-MM-DD'),
  // endTime: moment(state.timerange.end).format('hh:mm:ss'),
  /** We set date to end of the day so if user select from today to today he get same response
   * as in the vienna */

  endTime: '23:59:59',
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  SetTime: (timeRange: TimeRangeEnum) => {
    dispatch({ type: timeRange });
    dispatch({ type: AppUiActionEnum.TIMESELECTOR_CLOSE });
  },
  SetStartDate: (e: Date) => {
    dispatch({
      type: TimeRangeEnum.TIME_SET_START,
      start: e,
      title: 'Custom',
    } as CustomStartTimeRangeAction);
  },
  SetEndDate: (e: Date) => {
    dispatch({
      type: TimeRangeEnum.TIME_SET_END,
      end: e,
      title: 'Custom',
    } as CustomEndTimeRangeAction);
  },
});

/**
 * Proptype for this Component
 */
type TSProps = {
  isTimeSelectorOpen: boolean;
  time: TimeRangeState;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};
type TSDispatch = {
  SetTime: (timeRange: TimeRangeEnum) => void;
  SetStartDate: (e: Date) => void;
  SetEndDate: (e: Date) => void;
};

/**
 * Renders the time selector
 */
export const TimeSelector = connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  class InTimeSelector extends React.Component<TSProps & TSDispatch, { absoluteOpen: boolean }> {
    constructor(props: TSProps & TSDispatch & DispatchProp) {
      super(props);
      this.state = { absoluteOpen: false };
      this.ToggleMode.bind(this);
    }
    ToggleMode = (a: boolean) => {
      this.setState(() => {
        return { absoluteOpen: a };
      });
    };
    render() {
      return (
        <Card className={'time-selector ' + (this.props.isTimeSelectorOpen ? '' : 'hidden')}>
          <CardHeader className="bg-white text-primary" onClick={() => this.ToggleMode(false)}>
            TIME RANGE
            {this.state.absoluteOpen ? <FontAwesomeIcon className="ml-1" icon={faChevronDown} /> : null}
          </CardHeader>
          <Collapse isOpen={!this.state.absoluteOpen}>
            <CardBody className="py-1">
              <Row className="text-secondary time-selector-row">
                <Col colSpan={6}>
                  <ul>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_15_MIN)}>Last 15 minute</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_1_HOUR)}>Last 1 hour</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_4_HOUR)}>Last 4 hours</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_12_HOUR)}>Last 12 hours</li>
                  </ul>
                </Col>
                <Col colSpan={6}>
                  <ul>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_24_HOUR)}>Last 24 hours</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_7_DAYS)}>Last 7 days</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_MONTH)}>Last Month</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_LAST_YEAR)}>Last Year</li>
                  </ul>
                </Col>
              </Row>
              <Row className="text-secondary time-selector-row">
                <Col colSpan={6}>
                  <ul>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_TODAY)}>Today</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_WEEK)}>This week</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_MONTH)}>This month</li>
                  </ul>
                </Col>
                <Col colSpan={6}>
                  <ul>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_YEAR)}>This Year</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_YESTERDAY)}>Yesterday</li>
                    <li onClick={() => this.props.SetTime(TimeRangeEnum.TIME_RANGE_DAYBEFORE_YESTERDAY)}>
                      Day before yesterday
                    </li>
                  </ul>
                </Col>
              </Row>
            </CardBody>
          </Collapse>

          <CardHeader className="bg-white text-primary" onClick={() => this.ToggleMode(true)}>
            ABSOLUTE DATE PICKER
            {!this.state.absoluteOpen ? <FontAwesomeIcon className="ml-1" icon={faChevronDown} /> : null}
          </CardHeader>
          <Collapse isOpen={this.state.absoluteOpen}>
            <CardBody>
              <Row className="text-secondary time-selector-row">
                <div className="col-md-6">
                  <h6 className="text-secondary">From</h6>
                  <Row>
                    <div className="col-12">
                      <DateInput
                        value={this.props.startDate}
                        onChange={(value: string) => {
                          this.props.SetStartDate(new Date(value + 'T' + this.props.startTime));
                        }}
                      />
                    </div>
                    {/* <div className="col-6">
                      <TimeInput
                        value={this.props.startTime}
                        onChange={(value: string) => {
                          this.props.SetStartDate(
                            new Date(this.props.startDate + ' ' + value)
                          );
                        }}
                      />
                    </div> */}
                    <div className="pt-2 col-12 text-center">
                      <DatePicker
                        date={this.props.time.start}
                        onSelect={(value: string) => {
                          this.props.SetStartDate(new Date(value + 'T' + this.props.startTime));
                        }}
                      />
                    </div>
                  </Row>
                </div>
                <div className="col-md-6">
                  <h6 className="text-secondary">To</h6>
                  <Row>
                    <div className="col-12">
                      <DateInput
                        value={this.props.endDate}
                        onChange={(value: string) => {
                          this.props.SetEndDate(new Date(value + 'T' + this.props.endTime));
                        }}
                      />
                    </div>
                    {/* <div className="col-6">
                      <TimeInput
                        value={this.props.endTime}
                        onChange={(value: string) => {
                          this.props.SetEndDate(
                            new Date(this.props.endDate + ' ' + value)
                          );
                        }}
                      />
                    </div> */}
                    <div className="pt-2 col-12 text-center">
                      <DatePicker
                        date={this.props.time.end}
                        onSelect={(value: string) => {3421
                          this.props.SetEndDate(new Date(value + 'T' + this.props.endTime));
                        }}
                      />
                    </div>
                  </Row>
                </div>
              </Row>
            </CardBody>
          </Collapse>
        </Card>
      );
    }
  },
);
