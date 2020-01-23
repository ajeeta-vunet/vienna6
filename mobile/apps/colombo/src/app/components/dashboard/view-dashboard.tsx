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
 
 * Copyright 2020 VuNet Systems Ltd.
 * All rights reserved.
 * Use of copyright notice does not imply publication.
*/

import React, { Component } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { LoadDashboardAction, DashboardsState, TimeRangeState, NextDasboard, PreviousDasboard } from '@vu/store';
import { RouteChildrenProps } from 'react-router';
import { Row, Container, Col, CardHeader, Card, CardBody } from 'reactstrap';
import { Swipeable } from 'react-swipeable';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';
import { isEqual } from 'lodash';
import { resolve } from '../../vis-resolver';
import { ColomboAppStore } from '../../store';
import { environment } from '../../../environments/environment';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VibrationPattern, vibrate } from '@vu/utils';
import { ViewDashboards } from '@vu/colombo-lib';

type PropsFromMap = {
  dashboard: DashboardsState;
  time: { start: Date; end: Date };
};

type DispatchFromMap = {
  nextDashboard: (a) => void;
  prevDashboard: (a) => void;
  reloadData: (dashboardId: string, p: { start: Date; end: Date }) => void;
};

export type ViewDashboardProp = PropsFromMap & DispatchFromMap & DispatchProp & RouteChildrenProps;
export type ViewDashboardState = {};

const mapStateToProps = (state: ColomboAppStore): PropsFromMap => {
  return {
    dashboard: state.dashboard,
    time: state.timerange,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchFromMap => ({
  // Function for Navigating to next Dashboard
  nextDashboard: (a) => {
    if (Math.abs(a.deltaX) > 100) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = dispatch<any>(NextDasboard());
      if (res) {
        vibrate(VibrationPattern.NavigationSuccess);
      } else {
        vibrate(VibrationPattern.NavigationNotFulfiled);
      }
    }
  },
  // Function for Navigating to previous Dashboard
  prevDashboard: (a) => {
    if (Math.abs(a.deltaX) > 100) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = dispatch<any>(PreviousDasboard());
      if (res) {
        vibrate(VibrationPattern.NavigationSuccess);
      } else {
        vibrate(VibrationPattern.NavigationNotFulfiled);
      }
    }
  },
  // Function for Reloading Data
  reloadData: (dashboardId: string, p: TimeRangeState) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch<any>(LoadDashboardAction(dashboardId, p.start, p.end)),
});

/**
 * View Dashboard Page Component
 * Displays a Dashboard containing Visualizations
 * Handles routes /dashboard/:dashboardId
 */
export const ViewDashboardPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  class InternalViewDashboard extends Component<ViewDashboardProp, ViewDashboardState> {
    /**
     * Will be called when any prop is recieved
     *
     * @param {ViewDashboardProp} p
     * @param {ViewDashboardState} s
     */
    componentWillReceiveProps(p: ViewDashboardProp, s: ViewDashboardState) {
      if (
        !this.props.dashboard.loading &&
        (p.time.start !== this.props.time.start ||
          p.time.end !== this.props.time.end ||
          !isEqual(p.dashboard.current, this.props.dashboard.current) ||
          p.location.key !== this.props.location.key)
      ) {
        // TODO: Not a proper way, But react isn't documented well
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (p.dashboard.current && p.dashboard.current.id !== (this.props.match.params as any).dashboardId) {
          // Todo update URL
          this.props.history.push(ViewDashboards(p.dashboard.current.id));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.props.reloadData((p.match.params as any).dashboardId, {
          start: p.time.start,
          end: p.time.end,
        });
      }
    }
    shouldComponentUpdate(p: ViewDashboardProp, s: ViewDashboardState) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !isEqual(p.dashboard.current, this.props.dashboard.current) || !!(this.props.match.params as any).visId;
    }
    componentDidMount() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.props.reloadData((this.props.match.params as any).dashboardId, {
        start: this.props.time.start,
        end: this.props.time.end,
      });
    }
    render() {
      if (!this.props.dashboard.current) {
        return (
          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <Card>
                  <CardHeader>Loading</CardHeader>
                  <CardBody className="text-center py-5">
                    {this.props.dashboard.loading ? (
                      <FontAwesomeIcon icon={faSpinner} className="text-primary" size="6x" spin />
                    ) : (
                      'Dashboard load failed.'
                    )}
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dashboardId = (this.props.match.params as any).dashboardId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const visId = (this.props.match.params as any).visId;
      const datum = this.props.dashboard.current.data;
      const visToShow = datum.find(d => d.id === visId);
      if (visId) {
        return (
          <Container fluid={true}>
            <Row>{resolve(visToShow, true, { dashboardId: dashboardId, key: visId }, {})}</Row>
            <div className="back-container">
              <Link to={'..'}>
                <img src={environment.assetsPath + 'Calender_Arrow_Left.svg'} alt="" />
                Back
              </Link>
            </div>
          </Container>
        );
      }
      return (
        // tslint:disable
        <Swipeable onSwipedLeft={this.props.nextDashboard} onSwipedRight={this.props.prevDashboard}>
          <Container fluid={false}>
            <Row className="mb-5">
              {datum.length === 0 ? (
                <Col span={12}>
                  <Card>
                    <CardHeader>No Visualizations</CardHeader>
                    <CardBody>Visualizations are either not supported or dosn't exist for this dashboard.</CardBody>
                  </Card>
                </Col>
              ) : (
                datum.map((value, index) => {
                  return resolve(
                    value,
                    false,
                    { dashboardId: dashboardId, key: value.id },
                    {
                      key: index,
                    },
                  );
                })
              )}
            </Row>
          </Container>
        </Swipeable>
      );
    }
  },
);
