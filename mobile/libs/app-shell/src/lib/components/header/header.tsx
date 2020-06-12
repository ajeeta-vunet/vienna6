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

import React from 'react';
import { connect } from 'react-redux';
import { AuthState, TimeRangeState, DashboardsState } from '@vu/store';
import { Navbar, NavbarBrand } from 'reactstrap';
import { Dispatch } from 'redux';
import { TimeSelector } from './time-selector';
import { AppUiState, AppUiActionEnum } from '../../store';
import { AppShellStore } from '../../store/app-shell-store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
/** Type for props recieved from Map */
type PropFromMap = {
  auth: AuthState;
  dashboard: DashboardsState;
  appui: AppUiState;
  time: TimeRangeState;
};

/** Type for Dispatch recieved from Map */
type DispatchProps = {
  toggleSidebar: () => void;
  toggleTimeselector: () => void;
};

/** Type for Header recieved from Element */
type HeaderProps = PropFromMap & DispatchProps;

/** The mapstate function for Header component, will map states
 * @function
 */
const mapState = (state: AppShellStore): PropFromMap => ({
  auth: state.auth,
  appui: state.appui,
  dashboard: state.dashboard,
  time: state.timerange,
});

/** The mapDispatch function for Header component, will map states
 * @function  mapDispatch
 * @param {(dispatch: Dispatch)}
 * @returns {DispatchProps} DispatchProps
 */
const mapDispatch = (dispatch: Dispatch): DispatchProps => ({
  toggleSidebar: () => dispatch({ type: AppUiActionEnum.SIDEBAR_TOGGLE }),
  toggleTimeselector: () => dispatch({ type: AppUiActionEnum.TIMESELECTOR_TOGGLE }),
});

/**
 * Render the header part of every page
 */
export const Header = connect(
  mapState,
  mapDispatch,
)((props: HeaderProps) => (
  <Navbar className={(props.appui.isSidebarOpen ? 'expanded ' : '') + (props.appui.isStickyHeaderVisible ? ' ' : '')}>
    <div className="vu-header-bg"></div>
    {props.auth.isAuthenticated ? (
      <button className="navbar-toggler" type="button" onClick={props.toggleSidebar}>
        <span className="navbar-toggler-bar top-bar"></span>
        <span className="navbar-toggler-bar middle-bar"></span>
        <span className="navbar-toggler-bar bottom-bar"></span>
      </button>
    ) : (
      undefined
    )}
    <NavbarBrand className="w-100 mb-2" href="/vunet/">
      <img src='/assets/images/Logo.svg' alt="" />
      <span className="brand-name">vuSmartMaps</span>
    </NavbarBrand>

    <div className="w-100 mb-3 bottom-bar">
    <p className="dashboard-title text-white font-weight-bold mb-1">{props.appui.title.heading}</p>
      <div className="d-flex">
        <div className="text-white">
          {props.appui.title.displayLeftArrow ? (
            <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
          ) : null}
          <span className="mr-2">
            {props.appui.title.subHeading}
          </span>
          {props.appui.title.displayRightArrow ? (
            <FontAwesomeIcon icon={faChevronRight} />
          ) : null}
        </div>
        <div className="ml-auto text-white time-selection-container">
          <div onClick={props.toggleTimeselector}>
            <img
              src={'/assets/images/Time.svg'}
              alt="Time Selector"
              className={'time-icon ' + (props.dashboard.loading ? 'fa-spin' : '')}
            />
            <span className="px-2">{props.time.display}</span>
            <img
              src={'/assets/images/' + (props.appui.isTimeSelectorOpen ? 'Collapse.svg' : 'Expand.svg')}
              className="time-arrow"
              alt={props.appui.isTimeSelectorOpen ? 'Collapse' : 'Expand'}
            />
          </div>
          <TimeSelector />
        </div>
      </div>
    </div>
  </Navbar>
));
