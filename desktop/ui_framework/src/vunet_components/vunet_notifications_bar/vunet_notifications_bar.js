
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
import './_vunet_notifications_bar.less';
import { BellIcon, DatabaseIcon, XIcon } from '@primer/octicons-react';
import VunetNotificationItem from '../vunet_notification_item/VunetNotificationItem';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';
import $ from 'jquery';

const _ = require('lodash');
const APIHelper = require('../utils/api_helper');

export class VunetNotificationsBar extends Component {

  apiController = {};

  constructor(props) {
    super(props);
    this.apiController = new APIHelper();
    this.state = {
      activeTab: 'alerts', // denotes currently open tab in the notification panel
      readTabsQueue: [], // A list of tabs that user has opened that need to be marked as read
      // notificationsFetched: true,
      alertCount: 0, // denotes unread alert notifications count
      backupCount: 0,  // denotes unread backup notifications count
      notificationsResults: null,  // denotes the notifications that the user has received during an active session
      alertNotifications: [], // list of alert notifications
      backupNotifications: [] // list of backup notifications
    };
    this.onTabChange = this.onTabChange.bind(this);
    this.fetchNotifications = this.fetchNotifications.bind(this);
    this.getNotificationLink = this.getNotificationLink.bind(this);
    this.updateUnreadCount = this.updateUnreadCount.bind(this);
    this.markNotificationsAsRead = this.markNotificationsAsRead.bind(this);
  }

  // Function called when user changes from one category to another category
  onTabChange = (event) => {
    if(this.state.readTabsQueue.indexOf(event.target.value) === -1) {
      this.setState({
        readTabsQueue: this.state.readTabsQueue.concat(event.target.value)
      });
    }
    const toBeMarked = [...this.state.readTabsQueue];
    this.markNotificationsAsRead(toBeMarked);
    this.setState({
      activeTab: event.target.value,
    });
  }

  // Function to calculate and update number of unread notifications
  updateUnreadCount = () => {

    const unreadAlertNotifications = this.state.alertNotifications.filter(function (notification) {
      return !notification.read;
    });

    const unreadBackupNotifications = this.state.backupNotifications.filter(function (notification) {
      return !notification.read;
    });

    this.setState({
      alertCount: unreadAlertNotifications.length,
      backupCount: unreadBackupNotifications.length
    });

    this.props.updateUnreadAlertCount(unreadAlertNotifications.length, unreadBackupNotifications.length);
  }

  // Function to fetch Notifications
  fetchNotifications = () => {
    let lastReceivedNotificationIndex = 0;

    this.apiController.getNotifications()
      .then(data => {
      // Checking if there are notifications fetched already
        if (this.state.notificationsResults) {
          if(this.state.notificationsResults.Notifications.length > 0) {
            const lastAlertNotification = this.state.notificationsResults.Notifications[0];

            // Comparing the last received notification and the latest received notification from the current API call
            // Until a match is found, all the notifications are new ones that should be added to the UI
            for (lastReceivedNotificationIndex = 0; lastReceivedNotificationIndex < data.Notifications.length;
              lastReceivedNotificationIndex++) {
              const latestAlertNotification = data.Notifications[lastReceivedNotificationIndex];
              if (_.isEqual(latestAlertNotification, lastAlertNotification)) {
                break;
              }
              const latestAlertNotificationCopy = { ...latestAlertNotification };
              latestAlertNotificationCopy.read = false;
              this.setState({
                alertNotifications: [latestAlertNotificationCopy].concat(this.state.alertNotifications)
              });
            }
          } else {
            // Adding new key 'read' and setting it to false to denote unread
            const notificationsData = data.Notifications.map(function (item) {
              const updatedNotificationObject = { ...item };
              updatedNotificationObject.read = false;
              return updatedNotificationObject;
            });

            this.setState({
              alertNotifications: notificationsData
            });
          }

          if(this.state.notificationsResults['Backup and Storage'].length > 0) {
            const lastBackupNotification = this.state.notificationsResults['Backup and Storage'][0];

            for (lastReceivedNotificationIndex = 0; lastReceivedNotificationIndex < data['Backup and Storage'].length;
              lastReceivedNotificationIndex++) {
              const latestBackupNotification = data['Backup and Storage'][lastReceivedNotificationIndex];
              if (_.isEqual(latestBackupNotification, lastBackupNotification)) {
                break;
              }
              const latestBackupNotificationCopy = { ...latestBackupNotification };
              latestBackupNotificationCopy.read = false;
              this.setState({
                backupNotifications: [latestBackupNotificationCopy].concat(this.state.backupNotifications)
              });
            }
          } else {
            const backupNotifications = data['Backup and Storage'].map(function (item) {
              const updatedNotificationObject = { ...item };
              updatedNotificationObject.read = false;
              return updatedNotificationObject;
            });

            this.setState({
              backupNotifications: backupNotifications
            });
          }
        } else {
          // When no notifications are present previously
          // Add new key 'read' and set it to false to denote unread
          const notificationsData = data.Notifications.map(function (item) {
            const updatedNotificationObject = { ...item };
            updatedNotificationObject.read = false;
            return updatedNotificationObject;
          });

          const backupNotifications = data['Backup and Storage'].map(function (item) {
            const updatedNotificationObject = { ...item };
            updatedNotificationObject.read = false;
            return updatedNotificationObject;
          });

          this.setState({
            alertNotifications: notificationsData,
            backupNotifications: backupNotifications
          });
        }

        this.updateUnreadCount();

        this.setState({
          notificationsResults: data
        });
      });
  }

  // Called for forming link for 'View All' notifications
  getNotificationLink = (notificationSummary) => {
    // If notification summary present, that will be used as search string
    // Also, we do not want any current applied filters/search to
    // to be preserved
    const referencePage = prepareLinkInfo(
      'event/',
      '',
      '',
      false,
      'summary',
      notificationSummary,
      'vunet-*-*-notification-*',
      'now/d',
      'now/d',
      undefined,
      this.props.private,
      this.props.timefilter);

    return ('/app/vienna#/' + referencePage);
  };

  // Function takes an array of categories as parameter
  // Marks all the notifications under the category as read
  markNotificationsAsRead = (toBeMarked) => {
    for(let i = 0; i < toBeMarked.length; i++) {
      const category = toBeMarked[i];

      if(category === 'alerts') {
        let oldAlertNotifications = [...this.state.alertNotifications];
        oldAlertNotifications = oldAlertNotifications.map((notification) => {
          if(!notification.read) {
            notification.read = true;
          }
          return notification;
        });
        this.setState({
          alertNotifications: oldAlertNotifications
        });
      } else if(category === 'backup') {
        let oldBackupNotifications = [...this.state.backupNotifications];
        oldBackupNotifications = oldBackupNotifications.map((notification) => {
          if(!notification.read) {
            notification.read = true;
          }
          return notification;
        });
        this.setState({
          backupNotifications: oldBackupNotifications
        });
      }
    }

    this.updateUnreadCount();
  }

  componentDidMount() {
    // this.setState({ notificationsFetched: false })
    this.fetchNotifications();
    const viewAllNotificationsLink = this.getNotificationLink('');
    $('#viewAllNotifications').attr('href', viewAllNotificationsLink);

    this.notificationsPoll = setInterval(() => {
      this.fetchNotifications();
    }, this.props.pollingTime);

  }

  componentWillReceiveProps(props) {
    // When notification bar is closed from an open state
    if(!props.notificationBarStatus && this.props.notificationBarStatus) {
      // Mark notifications as read
      const toBeMarked = [...this.state.readTabsQueue];
      this.markNotificationsAsRead(toBeMarked);

      this.setState({
        readTabsQueue: []
      });
    }

    // When notification bar is opened from a closed state
    if(props.notificationBarStatus && !this.props.notificationBarStatus) {
      if(this.state.readTabsQueue.indexOf(this.state.activeTab) === -1) {
        this.setState({
          readTabsQueue: this.state.readTabsQueue.concat(this.state.activeTab)
        });
      }
    }

  }

  componentWillUnmount() {
    clearInterval(this.notificationsPoll);
  }

  // Rendering final JSX of Vunet Notification Bar
  render() {

    const notificationBarActive = this.props.notificationBarStatus ? 'active' : '';
    const isDarkThemeEnabled = this.props.darkTheme ? 'dark-theme' : 'light-theme';

    return (
      <div id="notificationsPanel" className={`${notificationBarActive} ${isDarkThemeEnabled}`}>
        <div className="header">
          <p>Notifications</p>
          <a id="viewAllNotifications">View All</a>
          <a id="closeNotifications" onClick={this.props.hideNotificationsPanel}><XIcon aria-label="Close"/></a>
        </div>

        <div className="notifications-container">

          <div className="tabs-header">
            <ul>
              <li>
                <label
                  id="alertsNotificationLabel"
                  htmlFor="alertsRadio"
                  className={this.state.activeTab === 'alerts' ? 'notification-tab-active' : ''}
                >
                  <BellIcon aria-label="Alerts" /> Alerts
                  {
                    this.state.alertCount > 0 &&
                    <span
                      id="alertsNotificationsCount"
                      className={this.state.activeTab === 'alerts' ? 'badge active' : 'badge'}
                    >
                      { this.state.alertCount }
                    </span>
                  }
                </label>
              </li>
              <li>
                <label
                  id="backupNotificationsLabel"
                  htmlFor="backupRadio"
                  className={this.state.activeTab === 'backup' ? 'notification-tab-active' : ''}
                >
                  <DatabaseIcon aria-label="Backups & Storage" /> Backup & Storage
                  {
                    this.state.backupCount > 0 &&
                    <span
                      id="backupsNotificationsCount"
                      className={this.state.activeTab === 'backup' ? 'badge active' : 'badge'}
                    >
                      { this.state.backupCount }
                    </span>
                  }
                </label>
              </li>
            </ul>
          </div>

          <div className="tabs-content">
            <input
              id="alertsRadio"
              type="radio"
              name="notificationsRadio"
              className="notifications-radio"
              value="alerts"
              checked={this.state.activeTab === 'alerts'}
              onChange={this.onTabChange}
            />
            <div id="alertsContent" className="tab-content-item">
              {
                this.state.alertNotifications.length > 0 ? (
                  this.state.alertNotifications.map((notification, index) => (
                    <VunetNotificationItem
                      darkTheme={this.props.darkTheme}
                      name={notification.name}
                      summary={notification.summary}
                      type={notification.type}
                      timestamp={notification.timestamp}
                      key={index}
                      read={notification.read}
                      private={this.props.private}
                      timefilter={this.props.timefilter}
                      kbnUrl={this.props.kbnUrl}
                    />
                  ))
                ) : (
                  <div className="no-notifications-div">
                    <p>Good job! 👏</p>
                    <br />
                    <p>You have no new notifications.</p>
                  </div>
                )
              }
            </div>
            <input
              id="backupRadio"
              type="radio"
              name="notificationsRadio"
              className="notifications-radio"
              value="backup"
              checked={this.state.activeTab === 'backup'}
              onChange={this.onTabChange}
            />
            <div id="backupAndStorageContent" className="tab-content-item">
              {
                this.state.backupNotifications.length > 0 ? (
                  this.state.backupNotifications.map((notification, index) => (
                    <VunetNotificationItem
                      darkTheme={this.props.darkTheme}
                      name={notification.name}
                      summary={notification.summary}
                      type={notification.type}
                      timestamp={notification.timestamp}
                      key={index}
                      read={notification.read}
                      private={this.props.private}
                      timefilter={this.props.timefilter}
                      kbnUrl={this.props.kbnUrl}
                    />
                  ))
                ) : (
                  <div className="no-notifications-div">
                    <p>Good job! 👏</p>
                    <br />
                    <p>You have no new notifications.</p>
                  </div>
                )
              }
            </div>
          </div>

        </div>

      </div>
    );
  }
}
