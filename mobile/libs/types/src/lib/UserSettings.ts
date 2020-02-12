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

export interface UserSettings {
  password: string;
  mobile_kpi: string;
  allow_console_login: string;
  tenant_id: number;
  status: string;
  permissions: string;
  bu_id: number;
  name: string;
  email: string;
  home_page: string;
  session_config: {
    session_idle_timeout: number;
  };
  user_group: string;
  active: string;
}
