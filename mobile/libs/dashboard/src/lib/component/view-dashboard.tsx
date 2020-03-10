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
import {
  LoadDashboardAction,
  DashboardsState,
  TimeRangeState,
  NextDasboard,
  PreviousDasboard,
  DashboardsStore,
  TimeRangeStore,
} from '@vu/store';
import { RouteChildrenProps } from 'react-router';
import { Row, Container, Col, CardHeader, Card, CardBody } from 'reactstrap';
import { Swipeable } from 'react-swipeable';
import { Dispatch } from 'redux';
import { Link } from 'react-router-dom';
import { isEqual } from 'lodash';
import { VibrationPattern, vibrate } from '@vu/utils';
import { AppTitle, SetTitleAction, AppUiActionEnum } from '@vu/app-shell';
import { resolve } from '../resolver';
import { ViewDashboards } from '@vu/vis';

type PropsFromMap = {
  dashboard: DashboardsState;
  time: { start: Date; end: Date };
};

type DispatchFromMap = {
  nextDashboard: (a) => void;
  prevDashboard: (a) => void;
  setTitle: (title: AppTitle) => void;
  reloadData: (dashboardId: string, p: { start: Date; end: Date }) => void;
};

export type ViewDashboardProp = PropsFromMap &
  DispatchFromMap &
  DispatchProp &
  RouteChildrenProps<{ dashboardId: string; visId: string }>;
export type ViewDashboardState = {};

const mapStateToProps = (state: DashboardsStore & TimeRangeStore): PropsFromMap => {
  return {
    dashboard: state.dashboard,
    time: state.timerange,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchFromMap => ({
  setTitle: (title: AppTitle) => dispatch<SetTitleAction>({ type: AppUiActionEnum.SET_TITLE, title: title }),
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
     *
     */
    constructor(props: Readonly<ViewDashboardProp>) {
      super(props);
    }
    /**
     * Will be called when any prop is recieved
     *
     * @param {ViewDashboardProp} props
     * @param {ViewDashboardState} state
     */
    componentWillReceiveProps(props: ViewDashboardProp, state: ViewDashboardState) {
      if (
        !this.props.dashboard.loading &&
        (props.time.start !== this.props.time.start ||
          props.time.end !== this.props.time.end ||
          !isEqual(props.dashboard.current, this.props.dashboard.current) ||
          props.location.key !== this.props.location.key)
      ) {
        if (props.dashboard.current && props.dashboard.current.id !== this.props.match.params.dashboardId) {
          this.props.history.push(ViewDashboards(props.dashboard.current.id));
        }
        this.props.reloadData(props.match.params.dashboardId, {
          start: props.time.start,
          end: props.time.end,
        });
      }
      // For safety, try to update title
      try {
        this.props.setTitle({
          displayRightArrow:
            props.dashboard.dashboards &&
            props.dashboard.current &&
            props.dashboard.dashboards.findIndex((a) => a.id === props.dashboard.current.id) !==
              props.dashboard.dashboards.length - 1,
          displayLeftArrow:
            props.dashboard.dashboards &&
            props.dashboard.current &&
            props.dashboard.dashboards.findIndex((a) => a.id === props.dashboard.current.id) !== 0,
          heading: 'Dashboard',
          subHeading: props.dashboard.current
            ? props.dashboard.current.id.replace('dashboard:', '').replace(/[-_\s]/giu, ' ')
            : '',
        });
      } catch {}
    }
    shouldComponentUpdate(p: ViewDashboardProp, s: ViewDashboardState) {
      return !isEqual(p.dashboard.current, this.props.dashboard.current) || !!this.props.match.params.visId;
    }
    componentDidMount() {
      this.props.reloadData(this.props.match.params.dashboardId, {
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
                      <img width="100" src="/mobile/assets/loader.gif" />
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
      const dashboardId = this.props.match.params.dashboardId;
      const visId = this.props.match.params.visId;
      const datum = this.props.dashboard.current.data;
      try {
        const visToShow = datum.find((d) => d.id === visId);
        if (visId) {
          return (
            <Container fluid={true}>
              <Row>{resolve(visToShow, true, { dashboardId: dashboardId, key: visId }, {})}</Row>
              <div className="back-container mb-3">
                <Link to={'..'}>
                  <img src={'/mobile/assets/Calender_Arrow_Left.svg'} alt="" />
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
      } catch (e) {
        return <div>{e}</div>;
      }
    }
  },
);
