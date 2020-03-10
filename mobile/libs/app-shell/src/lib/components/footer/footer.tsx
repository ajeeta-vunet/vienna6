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
import { Container, Row } from 'reactstrap';
import { FooterIcon } from './footer-icon';
import { SettingsUrl, AlexaUrl, UserUrl } from '../../config';
import { AlertsUrl } from '@vu/alert';
import { DashboardsUrl } from '@vu/vis';

/**
 * Icons to display
 */
const icons: { icon: string; to: string }[] = [
  { icon: 'Dashboard', to: DashboardsUrl() },
  { icon: 'User', to: UserUrl },
  { icon: 'Voice', to: AlexaUrl },
  { icon: 'Notification', to: AlertsUrl },
  {
    icon: 'Settings',
    to: SettingsUrl,
  },
];
/**
 * Render the footer
 */
export const Footer = () => (
  <div>
    <div className="footer-placeholder"></div>
    <Container fluid={true} className="footer-container">
      <Row className="footer-row">
        {icons.map((v) => (
          <FooterIcon key={v.icon} iconName={v.icon} to={v.to} />
        ))}
      </Row>
    </Container>
  </div>
);
