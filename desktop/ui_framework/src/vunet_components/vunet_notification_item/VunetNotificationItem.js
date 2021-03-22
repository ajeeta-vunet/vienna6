
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

import React from 'react';
import './_vunet_notification_item.less';

// Using moment library to calculate relative time of the notification received
import moment from 'moment';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';

export default (props) => {

  const notificationRead = props.read ? 'read' : '';
  const isDarkThemeEnabled = props.darkTheme ? 'dark-theme' : 'light-theme';

  const timestamp = moment.utc(props.timestamp).local().format('YYYY-MM-DD HH:mm:ss');

  function getNotificationLink() {
    // If notification summary present, that will be used as search string
    // Also, we do not want any current applied filters/search to
    // to be preserved
    const referencePage = prepareLinkInfo(
      'event/',
      '',
      '',
      false,
      'summary',
      props.summary,
      'vunet-*-*-notification-*',
      'now/d',
      'now/d',
      undefined,
      props.private,
      props.timefilter);

    return ('/app/vienna#/' + referencePage);
  }

  if(props.notificationFor === 'events') {
    return (
      <a href={getNotificationLink()} className={`notification_item ${notificationRead} ${isDarkThemeEnabled}`}>

        <div className="notification_body">
          <div className={'severity-' + props.type} />
          <div className="notification_content">
            <p className="notification_title">{props.name}</p>
            <p className="notification_description">{props.summary}</p>
            <p className="notification_time">{moment(timestamp).fromNow()}</p>
          </div>
        </div>

      </a>
    );
  } else if(props.notificationFor === 'discovery') {
    return (
      <a href={'/app/vienna#/discovery'} className={`notification_item ${notificationRead} ${isDarkThemeEnabled}`}>

        <div className="notification_body">
          <div className={'severity-' + props.type} />
          <div className="notification_content">
            <p className="notification_title">{props.name}</p>
            <p className="notification_description">{props.summary}</p>
            <p className="notification_time">{moment(timestamp).fromNow()}</p>
          </div>
        </div>

      </a>
    );
  } else if(props.notificationFor === 'backup') {
    return (
      <a href={'/app/vienna#/berlin/backup'} className={`notification_item ${notificationRead} ${isDarkThemeEnabled}`}>

        <div className="notification_body">
          <div className={'severity-' + props.type} />
          <div className="notification_content">
            <p className="notification_title">{props.name}</p>
            <p className="notification_description">{props.summary}</p>
            <p className="notification_time">{moment(timestamp).fromNow()}</p>
          </div>
        </div>

      </a>
    );
  }
};
