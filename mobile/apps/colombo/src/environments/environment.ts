/* ------------------------- NOTICE ------------------------------- /
/                                                                  /
/                   CONFIDENTIAL INFORMATION                       /
/                   ------------------------                       /
/     This Document contains Confidential Information or           /
/     Trade Secrets, or both, which are the property of VuNet      /
/     Systems Ltd.  This document may not be copied, reproduced,   /
/     reduced to any electronic medium or machine readable form    /
/     or otherwise duplicated and the information herein may not   /
/     be used, disseminated or otherwise disclosed, except with    /
/     the prior written consent of VuNet Systems Ltd.              /
/                                                                  /
/ ------------------------- NOTICE ------------------------------- /

/ Copyright 2015 VuNet Systems Ltd.
/ All rights reserved.
/ Use of copyright notice does not imply publication.
*/ // This file can be replaced during build by using the `fileReplacements` array.
// When building for testing, this file is replaced with `environment.testing.ts`.
// When building for internal testing, this file is replaced with `environment.staging.ts`.
// When building for production, this file is replaced with `environment.prod.ts`.

export const environment = {
  basePath: '/mobile/',
  assetsPath: '/mobile/assets/',
  production: false,
  // APIURL: 'https://localhost/',
  APIURL: 'https://192.168.8.207/',
};
