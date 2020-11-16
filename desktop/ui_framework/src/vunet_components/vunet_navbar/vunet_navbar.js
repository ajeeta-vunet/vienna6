
// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React, { Component } from 'react';
import { QuestionIcon, ScreenFullIcon, BellIcon, PersonIcon, ArchiveIcon,
  BookIcon, CommentDiscussionIcon, PeopleIcon, KebabHorizontalIcon, SearchIcon } from '@primer/octicons-react';
import { VunetNotificationsBar } from '../vunet_notifications_bar/vunet_notifications_bar';
import { VunetNavbarConstants } from './vunet_navbar_constants';
import { VunetModal } from '../vunet_modal/vunet_modal';
import './_vunet_navbar.less';
import $ from 'jquery';
import PropTypes from 'prop-types';
const APIHelper = require('../utils/api_helper');
import { toggleFullscreen } from 'ui/utils/vunet_fullscreen';
const chrome = require('ui/chrome');

// Getting User Info from Chrome object
function getUserInfo() {
  return chrome.getCurrentUser();
}

// Getting the session timeout duration from Chrome object
function getSessionIdleTimeout() {
  return chrome.getSessionIdleTimeout();
}

export class VunetNavbar extends Component {

  constructor(props) {
    super(props);

    this.apiHelper = new APIHelper();
    this.session_idle_timeout = getSessionIdleTimeout();
    this.lastActiveTime = new Date().getTime();

    this.userData = null;
    this.userName = null;
    this.customerLogoImgPath = null;

    // Setting the current time as Last Active Time in the browser once the user logs in
    if (!(localStorage.getItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY)) ||
      (localStorage.getItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY) === '')) {
      window.localStorage.setItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY, this.lastActiveTime);
    }

    this.state = {
      fullScreen: false,
      notificationBarStatus: false,
      helpPopoverStatus: false,
      profilePopoverStatus: false,
      morePopoverStatus: false,
      hasAdminConsoleAccess: false,
      searchBoxFocusStatus: false,
      userSettingsModalStatus: false,
      diagnosticsModalStatus: false,
      confirmLogoutModalStatus: false,
      newAlertNotifications: 0,
      newBackupNotifications: 0,
      userSettingsFormData: {}, // Modal Data for User Settings Modal
      diagnosticsResultData: {  // Modal Data for Diagnostics Results Modal
        title: 'Diagnostics Data',
        isForm: false,
        class: 'run-diagnostic-modal-container',
        message: ''
      },
      diagnosticsRunning: false
    };

    this.updateUnreadAlertCount = this.updateUnreadAlertCount.bind(this);
    this.handleDarkThemeClick = this.handleDarkThemeClick.bind(this);
    this.toggleDarkThemeStatus = this.toggleDarkThemeStatus.bind(this);
    this.toggleNotificationBar = this.toggleNotificationBar.bind(this);
    this.toggleHelpPopover = this.toggleHelpPopover.bind(this);
    this.toggleProfilePopover = this.toggleProfilePopover.bind(this);
    this.toggleMorePopover = this.toggleMorePopover.bind(this);
    this.hideNotificationsPanel = this.hideNotificationsPanel.bind(this);
    this.handleSearchBoxFocus = this.handleSearchBoxFocus.bind(this);
    this.handleSearchBoxBlur = this.handleSearchBoxBlur.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.signOut = this.signOut.bind(this);
    this.runDiagnostic = this.runDiagnostic.bind(this);
    this.closeConfirmLogoutModal = this.closeConfirmLogoutModal.bind(this);
    this.showConfirmLogoutModal = this.showConfirmLogoutModal.bind(this);
    this.showUserSettingsModal = this.showUserSettingsModal.bind(this);
    this.closeUserSettingsModal = this.closeUserSettingsModal.bind(this);
    this.closeDiagnosticsModal = this.closeDiagnosticsModal.bind(this);
  }

  // This function is passed to VunetNotificationsBar
  // It is called there whenever a new notification appears
  // This updates the count here to show in the tooltip
  updateUnreadAlertCount = (alertCount, backupCount) => {
    this.setState({
      newAlertNotifications: alertCount,
      newBackupNotifications: backupCount
    });
  }

  // Manually clicking the toggle which in turn toggles dark theme
  handleDarkThemeClick = () => {
    $('#darkThemeToggleSwitch').click();
  }

  // Toggle dark theme across the application
  toggleDarkThemeStatus = () =>  {
    this.props.toggleDarkTheme(!this.props.appProps.darkTheme);
  }

  // Open or close notification bar
  toggleNotificationBar = () =>  {
    this.setState({
      notificationBarStatus: !this.state.notificationBarStatus
    });
  }

  // Open or close help popover menu
  toggleHelpPopover = () =>  {
    this.setState({
      profilePopoverStatus: false,
      morePopoverStatus: false,
      helpPopoverStatus: !this.state.helpPopoverStatus
    });
  }

  // Open or close profile popover menu
  toggleProfilePopover = () =>  {
    this.setState({
      helpPopoverStatus: false,
      morePopoverStatus: false,
      profilePopoverStatus: !this.state.profilePopoverStatus
    });
  }

  // Open or close more popover menu
  toggleMorePopover = () =>  {
    this.setState({
      helpPopoverStatus: false,
      profilePopoverStatus: false,
      morePopoverStatus: !this.state.morePopoverStatus
    });
  }

  // Closes the notification bar
  // This function is passed to the notification bar
  // This is called whenever user clicks the x icon in the notification panel
  hideNotificationsPanel = () => {
    this.setState({
      notificationBarStatus: false
    });
  }

  // Closes the logout confirmation modal
  closeConfirmLogoutModal = () => {
    this.setState({
      confirmLogoutModalStatus: false
    });
  }

  // Shows the logout confirmation modal
  showConfirmLogoutModal = () => {
    this.setState({
      confirmLogoutModalStatus: true
    });
  }

  // Opens General Settings modal
  showUserSettingsModal = () => {
    this.setState({
      userSettingsModalStatus: true
    });
  }

  // Closes General Settings modal
  closeUserSettingsModal = () => {
    this.setState({
      userSettingsModalStatus: false
    });
  }

  // Closes Run Diagnostics Modal
  closeDiagnosticsModal = () => {
    this.setState({
      diagnosticsModalStatus: false
    });
  }

  // Function to handle some CSS for when searchbox in help popover is focused
  handleSearchBoxFocus = () =>  {
    this.setState({
      searchBoxFocusStatus: true
    });
    $('#searchHelpInputGroup').addClass('focused');
    $('#searchHelpIcon').addClass('focused');
  }

  // Function to handle some CSS for when searchbox in help popover is blurred
  handleSearchBoxBlur = () =>  {
    this.setState({
      searchBoxFocusStatus: false
    });
    $('#searchHelpInputGroup').removeClass('focused');
    $('#searchHelpIcon').removeClass('focused');
  }

  // Function to handle search query from searchbox in help popover
  handleSearchInput = (e) => {
    if (e.key === 'Enter') {
      const query = $('#searchHelpInput').val();
      const url = VunetNavbarConstants.VUDOC_SEARCH_KEYWORD_URL + query;

      if (query !== undefined && query !== '') {
        window.open(url, '_blank');
      }
    }
  }

  // Function captures click that is recorded anywhere in the application
  handleClick = (e) => {
    if (this.state.helpPopoverStatus) {
      if (!this.helpPopoverNode.contains(e.target)) {
        this.setState({
          helpPopoverStatus: false
        });
      }
    } else if (this.state.profilePopoverStatus) {
      if (!this.profilePopoverNode.contains(e.target)) {
        this.setState({
          profilePopoverStatus: false
        });
      }
    } else if (this.state.morePopoverStatus) {
      if (!this.morePopoverNode.contains(e.target)) {
        this.setState({
          morePopoverStatus: false
        });
      }
    }
    this.updateLastActiveTime();
  }

  // Function to sign out user
  signOut = () => {
    this.apiHelper.logoutUser()
      .then(data => {
        if(data) {
          window.localStorage.username = '';
          window.localStorage.setItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY, '');
          this.apiHelper.stopIdleTimerAndGoToLoginPage();
        }
      });
  }

  // Function to run diagnostics and show report
  runDiagnostic = () => {
    this.setState({
      diagnosticsRunning: true
    });
    this.apiHelper.requestDiagnostic()
      .then(responseData => {
        try {
          if(responseData.length > 0) {
            let table = '<div>';
            responseData.forEach(data => {
              table += '<h4>' + data[0] + '</h4>';
              table += '<table class="table table-hover table-striped  table-bordered">';
              data[1].forEach(_data => {
                table += '<tr><td>' + _data[0] + '</td><td>' + _data[1] + '</td></tr>';
              });
              table += '</table></div>';
            });

            this.setState({
              diagnosticsResultData: {
                title: 'Diagnostics Data',
                isForm: false,
                class: 'run-diagnostic-modal-container',
                message: table
              },
              diagnosticsModalStatus: true,
              diagnosticsRunning: false
            });
          } else {
            throw 'No data available';
          }
        } catch(e) {
          this.setState({
            diagnosticsResultData: {
              title: 'Diagnostic Data',
              isForm: false,
              class: 'run-diagnostic-modal-container',
              message: 'No data found'
            },
            diagnosticsModalStatus: true,
            diagnosticsRunning: false
          });
        }
      });
  }

  // Function that updates lastActive time in local storage
  // Called whenever user does some activity in the application tab
  updateLastActiveTime = () => {
    // If username is not present, that means user has been logged out in another tab
    // So signing the user out
    if (!window.localStorage.username || window.localStorage.username === '') {
      window.localStorage.setItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY, '');
      this.apiHelper.stopIdleTimerAndGoToLoginPage();
    }
    this.lastActiveTime = new Date().getTime();
    window.localStorage.setItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY, this.lastActiveTime);
  }

  // Function is called when user submits the form in General Ssettings Modal
  onUserSettingsSubmit = (data) => {
    // SUbmit call of user-setting modal
    this.userData.password = data.newPassword;
    this.userData.email = data.email;
    const user = { user: this.userData };
    const dataToSend = user;
    this.apiHelper.editUser(data.name, dataToSend).then((responseData) => {
      //This is done to update email id in user table if user is on manage users tab
      if (responseData != null && window.location.href.includes('/berlin/user')) {
        window.location.href = VunetNavbarConstants.USER_SETTINGS_URL;
      }
    });
    this.setState(prevState => {
      const prevUserSettingsFormData = { ...prevState.userSettingsFormData };
      prevUserSettingsFormData.name = dataToSend.user.email;
      return { prevUserSettingsFormData };
    });
    this.setState({
      userSettingsModalStatus: false
    });
  }

  componentDidMount() {
    // When user performs any action check for idle timeout
    // and update the user's last activity time.
    document.addEventListener('mousedown', this.handleClick, false);
    document.addEventListener('mousemove', this.updateLastActiveTime, false);
    document.addEventListener('keydown', this.updateLastActiveTime, false);
    document.addEventListener('DOMMouseScroll', this.updateLastActiveTime, false);
    document.addEventListener('mousewheel', this.updateLastActiveTime, false);

    const currentUser = chrome.getCurrentUser();
    this.apiHelper.setUser(currentUser[0]);
    this.session_idle_timeout = getSessionIdleTimeout();

    // Getting Customer Logo is its present
    this.apiHelper.getUploadedImages()
      .then(data => {
        const tenantBuList = chrome.getTenantBu();
        if (data && data.logo) {
          this.customerLogoImgPath = '/ui/vienna_images/' + tenantBuList[0] + '/' +
          tenantBuList[1] + '/logo/' + data.logo[0]['file-name'];
        } else {
          this.customerLogoImgPath = null;
        }
      });

    // Getting some user details
    this.apiHelper.getCurrentUserInfo()
      .then(data => {
        this.userData = data;
        this.username = data.name;
        if(data.allow_console_login === 'Yes') {
          this.setState({
            hasAdminConsoleAccess: true
          });
        }
        this.setState({
          userSettingsFormData: {
            'name': data.name,
            'email': data.email,
            'newPassword': '',
            'confirmPassword': ''
          }
        });
      });

    // Session Expiry Implementation
    this.sessionTimer = setInterval(() => {
      // Get the current time.
      const currentTime = new Date();

      // Get the last active time from local storage.
      let lastActiveTime = window.localStorage.getItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY);
      lastActiveTime = parseInt(lastActiveTime);

      // If the user has by chance logged into a different tab
      // and logged out from there, we will check for browser Storage
      // and log the user out if its empty
      if (!window.localStorage.username || window.localStorage.username === '') {
        window.localStorage.setItem(VunetNavbarConstants.SESSION_LAST_ACTIVE_TIME_KEY, '');
        this.apiHelper.stopIdleTimerAndGoToLoginPage();
      }

      // If the difference between current time and last active time is
      // greater than session idle time out, we logout the user.
      const elapsedTime = currentTime.getTime() - lastActiveTime;
      if (elapsedTime >= this.session_idle_timeout) {
        // username becomes empty when the user logout.
        // If the user already logged out from any other tab, just redirect him
        // to login page
        if (!window.localStorage.username || window.localStorage.username === '') {
          this.apiHelper.stopIdleTimerAndGoToLoginPage();
        } else {
          // If the user is logged in, Log out the user.
          // This also calls the REST API to logout the user in the backend
          this.signOut();
        }
      }
    }, VunetNavbarConstants.SESSION_EXPIRY_CHECK_TIME_INTERVAL);

  }

  componentDidUpdate() {

  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
    document.removeEventListener('mousemove', this.updateLastActiveTime, false);
    document.removeEventListener('keydown', this.updateLastActiveTime, false);
    document.removeEventListener('DOMMouseScroll', this.updateLastActiveTime, false);
    document.removeEventListener('mousewheel', this.updateLastActiveTime, false);
    clearInterval(this.sessionTimer);
  }

  // Rendering final JSX of Vunet Navbar.
  render() {
    const currentUser = getUserInfo();
    const isNotificationUnavailable = () => {
      return !(chrome.canViewObject() || chrome.canManageDataSettings());
    };
    const notificationAccess = chrome.canViewObject() || chrome.canManageDataSettings();
    const canManageDiagnostic = chrome.canManageDiagnostic();
    let newPasswordToCompare = '';

    const diagnosticsRunningClassName = this.state.diagnosticsRunning ? 'disabled' : '';
    const manageDiagnosticsClassName = chrome.canManageDiagnostic() ? '' : 'disabled';

    const checkIfPasswordsMatch = (key, data) => {
      if (newPasswordToCompare === data) {
        return false;
      }
      else {
        return true;
      }
    };

    //Function to store new password so that it can be compared
    const storeEnteredPassword = (key, data) => {
      newPasswordToCompare = data;
    };

    const logoutConfirmationModalData = {
      isForm: false,
      title: 'Logout confirmation',
      message: '<h4> Are you sure you want to Logout ? </h4>'
    };

    const userSettingsModalData = {
      isForm: true,
      title: 'General Settings ',
      editData: this.state.userSettingsFormData,
      item: [{
        key: 'name',
        label: 'Username',
        id: true,
        type: 'text',
        name: 'username',
        props: {
          required: true,
        },
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        name: 'email',
        props: {
          required: true,
          pattern: '^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,5})+$'
        },
        errorText: 'Please enter a valid email address.'
      },
      {
        key: 'newPassword',
        label: 'New Password',
        type: 'password',
        helpText: 'Enter a strong password',
        name: 'newPassword',
        validationCallback: storeEnteredPassword,
        props: {
          required: true,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#-])[A-Za-z\\d@$!%*?&#-]{8,24}$'
        },
        errorText: `Your password must be a single word between 8-24 characters with atleast
                    one uppercase letter, one lowercase letter, one number and one special character
                    ( @$!%*?&amp;#- ).`
      },
      {
        key: 'confirmPassword',
        label: 'Confirm New Password',
        type: 'password',
        name: 'confirmNewPassword',
        validationCallback: checkIfPasswordsMatch,
        props: {
          required: true,
        },
        errorText: `The Passwords don't match.`
      }]
    };

    return (
      <div
        id="vunetNavbarContainer"
        className={'topbar-container ' + (this.props.appProps.darkTheme ? 'dark-theme' : 'light-theme')}
      >
        <nav className="navbar navbar-default vunet-navbar fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand navbar-logo-container" href="#">
              <img id="vunetLogoImg" alt="Home" src="/ui/vienna_images/vunet_logo.png" />
            </a>
            {
              this.customerLogoImgPath &&
              <a id="customerLogoContainer" className="navbar-brand navbar-logo-container">
                <img id="customerLogoImg" alt="Home" src={this.customerLogoImgPath} />
              </a>
            }
          </div>
          <ul className="nav navbar-nav">
            <li id="fullscreen" className="nav-item">
              <button className="nav-link nav-link-btn" onClick={toggleFullscreen}>
                <ScreenFullIcon aria-label="Fullscreen" />
              </button>
            </li>
            <li id="help" className="nav-item">
              <button
                className={'nav-link nav-link-btn ' + (this.state.helpPopoverStatus ? 'active' : '')}
                onClick={this.toggleHelpPopover}
              >
                <QuestionIcon aria-label="Help" />
              </button>
              <div
                id="helpPopover"
                className={'navbar-popover ' + (this.state.helpPopoverStatus ? ' active' : '')}
                ref={node => this.helpPopoverNode = node}
              >
                <p>Help</p>
                <hr/>
                <div id="searchHelpInputGroup" className="input-group">
                  <span id="searchHelpIcon" className="input-group-addon"><SearchIcon size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    id="searchHelpInput"
                    onFocus={this.handleSearchBoxFocus}
                    onBlur={this.handleSearchBoxBlur}
                    onKeyDown={this.handleSearchInput}
                    placeholder="Search our help center..."
                    aria-describedby="searchHelpIcon"
                  />
                </div>
                <p>Quick Links</p>
                <hr className="popover-list-item-border" />
                <ul
                  className="list-group list-group-flush"
                >
                  <a
                    href={VunetNavbarConstants.DATA_SOURCES_URL}
                    target="_blank"
                    className="list-group-item list-group-item-action popover-list-item"
                  >
                    <ArchiveIcon aria-label="Data Sources"/>
                    <span className="list-item-title">Data Sources</span>
                  </a>
                  <hr
                    className="popover-list-item-border"
                  />
                  <a
                    href={VunetNavbarConstants.USER_GUIDE_URL}
                    target="_blank"
                    className="list-group-item list-group-item-action popover-list-item"
                  >
                    <BookIcon aria-label="User Guide"/>
                    <span className="list-item-title">User Guide</span>
                  </a>
                  <hr
                    className="popover-list-item-border"
                  />
                  <a
                    href={VunetNavbarConstants.FAQS_URL}
                    target="_blank"
                    className="list-group-item list-group-item-action popover-list-item"
                  >
                    <CommentDiscussionIcon aria-label="FAQs"/>
                    <span className="list-item-title">FAQs</span>
                  </a>
                  <hr
                    className="popover-list-item-border"
                  />
                  <a
                    href={VunetNavbarConstants.SUPPORT_URL}
                    target="_blank"
                    className="list-group-item list-group-item-action popover-list-item"
                  >
                    <PeopleIcon aria-label="Support"/>
                    <span className="list-item-title">Support</span>
                  </a>
                </ul>
              </div>
            </li>
            <li
              id="notifications"
              className="nav-item"
            >
              <button
                className={'nav-link nav-link-btn ' + (this.state.notificationBarStatus ? 'active' : '')}
                disabled={isNotificationUnavailable()}
                onClick={this.toggleNotificationBar}
              >
                <BellIcon aria-label="Notifications" />
              </button>

              {
                (this.state.newAlertNotifications > 0 || this.state.newBackupNotifications > 0) &&
                <span className="new-notifications-badge" />
              }

              {
                (this.state.newAlertNotifications > 0 || this.state.newBackupNotifications > 0) &&
                <div className="vunet-tooltip new-notifications-tooltip">
                  <p id="newNotificationsBadge">
                    { (this.state.newAlertNotifications + this.state.newBackupNotifications) } new notifications
                  </p>
                  {this.state.newAlertNotifications > 0 &&
                    <p id="newAlertNotificationsBadge">{this.state.newAlertNotifications} Alerts</p>
                  }
                  {this.state.newBackupNotifications > 0 &&
                    <p id="newBackupNotificationsBadge">{this.state.newBackupNotifications} Backup & Storage</p>
                  }
                </div>
              }

              { isNotificationUnavailable() &&
                <span className="vunet-tooltip disabled-tooltip">You do not have the permission to view this item</span>
              }
            </li>
            <li id="profile" className="nav-item">
              <button
                className={'nav-link nav-link-btn ' + (this.state.profilePopoverStatus ? 'active' : '')}
                onClick={this.toggleProfilePopover}
              >
                <PersonIcon aria-label="Profile" />
              </button>
              <div
                id="profilePopover"
                className={'navbar-popover ' + (this.state.profilePopoverStatus ? 'active' : '')}
                ref={node => this.profilePopoverNode = node}
              >
                <div className="profile-title">
                  <div className="profile-picture-container">
                    <PersonIcon size={21} aria-label="Profile" />
                  </div>
                  <p id="profileTitle">{ currentUser[0] }</p>
                </div>
                <hr className="popover-list-item-border" />
                <ul className="list-group list-group-flush">
                  {
                    this.state.hasAdminConsoleAccess ?
                      <a
                        id="adminConsoleItem"
                        href="/admin-console"
                        target="_blank"
                        className="list-group-item list-group-item-action popover-list-item"
                      >
                          Admin Console
                      </a> :
                      <a
                        id="adminConsoleItem"
                        className="list-group-item list-group-item-action popover-list-item disabled"
                      >
                          Admin Console
                        <span className="vunet-tooltip disabled-tooltip">You do not have the permission to view this item</span>
                      </a>
                  }
                  <hr className="popover-list-item-border" />
                  <a className="list-group-item list-group-item-action popover-list-item" onClick={this.showUserSettingsModal}>
                    User Settings
                  </a>
                </ul>
                <button
                  type="button"
                  id="signOutBtn"
                  onClick={this.showConfirmLogoutModal}
                  className="btn btn-danger btn-block"
                >
                    Log Out
                </button>
              </div>
            </li>
            <li id="more" className="nav-item">
              <button
                className={'nav-link nav-link-btn ' + (this.state.morePopoverStatus ? ' active' : '')}
                onClick={this.toggleMorePopover}
              >
                <KebabHorizontalIcon aria-label="Support"/>
              </button>
              <div
                id="morePopover"
                className={'navbar-popover ' + (this.state.morePopoverStatus ? ' active' : '')}
                ref={node => this.morePopoverNode = node}
              >
                <ul className="list-group list-group-flush">
                  {/* <a
                    id="darkThemeTogglerContainer"
                    onClick={this.handleDarkThemeClick}
                    className="list-group-item list-group-item-action popover-list-item"
                  >
                    Dark Theme
                    <label id="darkThemeToggleSwitch" className="switch">
                      <input
                        type="checkbox"
                        checked={this.props.appProps.darkTheme ? 'checked' : null}
                        onChange={this.toggleDarkThemeStatus}
                      />
                      <span className="slider round" />
                    </label>
                  </a>
                  <hr className="popover-list-item-border" /> */}
                  <a
                    id="runDiagnosticsItem"
                    className={
                      `list-group-item list-group-item-action popover-list-item ` +
                      `${diagnosticsRunningClassName} ${manageDiagnosticsClassName}`
                    }
                    onClick={canManageDiagnostic && this.runDiagnostic}
                  >
                    Run Diagnostics
                    {!canManageDiagnostic &&
                      <span className="vunet-tooltip disabled-tooltip">You do not have the permission to view this item</span>}
                  </a>
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        {notificationAccess === true &&
          <VunetNotificationsBar
            private={this.props.appProps.private}
            timefilter={this.props.appProps.timefilter}
            kbnUrl={this.props.appProps.kbnUrl}
            updateUnreadAlertCount={this.updateUnreadAlertCount}
            pollingTime={VunetNavbarConstants.NOTIFICATIONS_POLLING_TIME_INTERVAL}
            darkTheme={this.props.appProps.darkTheme}
            notificationBarStatus={this.state.notificationBarStatus}
            hideNotificationsPanel={this.hideNotificationsPanel}
          />}

        <VunetModal
          showModal={this.state.userSettingsModalStatus}
          data={userSettingsModalData}
          onClose={this.closeUserSettingsModal}
          onSubmit={this.onUserSettingsSubmit}
          clickOutsideToCloseModal={false}
        />

        <VunetModal
          showModal={this.state.diagnosticsModalStatus}
          data={this.state.diagnosticsResultData}
          onClose={this.closeDiagnosticsModal}
          onSubmit={this.closeDiagnosticsModal}
          clickOutsideToCloseModal={false}
        />

        <VunetModal
          showModal={this.state.confirmLogoutModalStatus}
          data={logoutConfirmationModalData}
          onClose={this.closeConfirmLogoutModal}
          onSubmit={this.signOut}
          clickOutsideToCloseModal={true}
        />
      </div>
    );

  }
}

VunetNavbar.propTypes = {
  toggleDarkTheme: PropTypes.func,
  appProps: PropTypes.object
};
