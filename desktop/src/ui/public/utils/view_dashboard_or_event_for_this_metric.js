import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';

// This will handle the redirection to a dashboard or event based on provided reference link
export function viewDashboardOrEventForThisMetric(
  getAppState,
  Private,
  timefilter,
  kbnUrl,
  refLink) {
  let referencePage = '';
  let searchString = '';

  // We currently do not support metric internal filters to be passed to
  // the drilled down dashboard.

  if (refLink.searchString !== undefined && refLink.searchString !== '') {
    // If additional search string is given combine it with search string
    // from metric
    if (searchString !== '') {
      searchString = '(' + searchString + ') AND (' + refLink.searchString + ')';
    } else {
      searchString = refLink.searchString;
    }
  }

  if (refLink.type === 'dashboard') {
    referencePage = prepareLinkInfo(
      'dashboard/',
      refLink.dashboard.id,
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

  // Have changed from kbnUrl.redirect(url) to kbnUrl.change(url)
  // kbnUrl.redirect(url): will replace the current url with new url
  // will not add it to the browser's history
  // kbnUrl.change(url): will navigate to the new url
  // and add this url to the browser's history
  kbnUrl.change('/' + referencePage);
}