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
import { connect } from 'react-redux';
import LogoutButton from '../logout';
import { DashboardsState, LoadDashboardsAction } from '@vu/store';
import { AppShellStore } from '../../store/app-shell-store';
import { AppUiActionEnum } from '../../store';
import { NavLink } from 'react-router-dom';
import { ViewDashboards } from '@vu/vis';

/**
 * Props For Sidebar
 *
 * @interface SidebarStateProps
 */
interface SidebarStateProps {
  // Tell is sidebar open
  isSidebarOpen: boolean;
  // Store username displayed in sidebar
  user: string;
  // Store Dashboard state from redux
  dashboards: DashboardsState;
}

/**
 * Dispatch of Sidebar
 *
 * @interface SidebarDispatchProps
 */
interface SidebarDispatchProps {
  loadDash: () => void;
  closeSidebar: () => void;
}
type SidebarProps = SidebarStateProps & SidebarDispatchProps;
const mapStatetoProps = (state: AppShellStore) =>
  ({
    isSidebarOpen: state.appui.isSidebarOpen,
    user: state.auth.user,
    dashboards: state.dashboard,
  } as SidebarProps);
const mapDispatchToProps = (dispatch) => ({
  loadDash: () => dispatch(LoadDashboardsAction()),
  closeSidebar: () => dispatch({ type: AppUiActionEnum.SIDEBAR_CLOSE }),
});

/**
 * Will render the sidebar
 * The UI for Sidebar
 *
 * @export
 * @function Sidebar
 */
export const Sidebar = connect(
  mapStatetoProps,
  mapDispatchToProps,
)((props: SidebarProps) => {
  if (!props.user) {
    return null;
  }
  if (!props.dashboards.loading && props.dashboards.dashboards === undefined) {
    props.loadDash();
  }
  return (
    <div className={'vu-sidebar ' + (props.isSidebarOpen ? 'open' : 'closed')}>
      <div className="sidebar-username">{props.user}</div>
      <hr />
      <div className="sidebar-items">
        {props.dashboards.dashboards &&
          props.dashboards.dashboards.map((v) => (
            <NavLink
              className="sidebar-item"
              key={v.id}
              to={ViewDashboards(v.id)}
              onClick={props.closeSidebar}
              activeClassName="active"
            >
              {v.title}
            </NavLink>
          ))}
        <hr />
        <div className="sidebar-item sidebar-logout">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
});
