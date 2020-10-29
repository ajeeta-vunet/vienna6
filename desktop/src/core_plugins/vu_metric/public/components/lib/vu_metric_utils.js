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

import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';

// This function is called when the 'View More' link
// in the metric visualization is clicked. This will
// handle the redirection to a dashboard or events of
// interest page based on users input to reference page.
export const goToReferenceLink = function (Private, getAppState, timefilter, refLink, metricFilter, value) {

  let referencePage = '';
  let searchString = '';
  let fieldName = undefined;
  let fieldValue = '';

  if (refLink.useMetricFilter && metricFilter !== undefined) {
    // We need to use the filter applied for this metric
    searchString = metricFilter;
  }
  if (refLink.searchString !== undefined && refLink.searchString !== '') {
    // If additional search string is given combine it with search string
    // from metric
    if (searchString !== '') {
      searchString = '(' + searchString + ') AND (' + refLink.searchString + ')';
    } else {
      searchString = refLink.searchString;
    }
  }
  if (refLink.useFieldAsFilter) {
    fieldName = refLink.field;
    fieldValue = value;
  }
  if (refLink.type === 'dashboard') {
    referencePage = prepareLinkInfo(
      'dashboard/',
      refLink.dashboard.id,
      searchString,
      refLink.retainFilters,
      fieldName,
      fieldValue,
      undefined,
      undefined,
      undefined,
      getAppState,
      Private,
      timefilter);
  }
  else if (refLink.type === 'event') {
    referencePage = prepareLinkInfo(
      'event/',
      '',
      searchString,
      refLink.retainFilters,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      getAppState,
      Private,
      timefilter);
  }

  /* we are not using kbnUrl to change the url or to navigate to a page. This is because change of the url change
   was happening after one more update in the component. The same was seem in UTM aslo where we fixed this by running one 
   more digest cycle by calling $apply(). But here we did not even use kbnUrl, instead we are using current-route 
   and window.location.href  
  */

  // kbnUrl.change('/' + referencePage);

  const currentRoute = window.location.href;

  // We are finding the index of vienna#/ in the current url
  let indexOfVienna = currentRoute.indexOf('vienna#/')

  // Now we slice the current route string till index found + 8 (+8 so that it consists vienna#/ )
  let currentRouteWithoutReferencePage = currentRoute.slice(0, indexOfVienna + 8)

  // Here we add the string slice from current and the reference link string coming from prepareLinkInfo
  let newRouteWithReferencePage = currentRouteWithoutReferencePage + referencePage

  window.location.href = newRouteWithReferencePage;

};


