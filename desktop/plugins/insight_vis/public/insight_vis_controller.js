import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';
import { getImages } from 'ui/utils/vunet_image_utils.js';
import { render } from 'mustache';
import MarkdownIt from 'markdown-it';
import 'angular-sanitize';
import '../../../node_modules/quill/dist/quill.snow.css';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';

require('quill');
require('ng-quill');

const chrome = require('ui/chrome');
const _ = require('lodash');

const markdownIt = new MarkdownIt({
  html: false,
  linkify: true,
});
// get the insight_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/insight_vis', [
  'kibana',
  'ngSanitize',
  'ngQuill',
]);

module.controller('insightVisController', function (
  $scope,
  Private,
  Notifier,
  $http,
  getAppState,
  $rootScope,
  timefilter,
  kbnUrl,
  StateService,
  $sce
) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const dashboardContext = Private(dashboardContextProvider);

  // Get the first part of the url containing the tenant
  // and bu id to prepare urls for api calls.
  // Example output: /vuSmartMaps/api/1/bu/1/
  const urlBase = chrome.getUrlBase();
  // Returns HTML render for html Instght
  $scope.render = (a, b) => $sce.trustAsHtml(render(a, b));
  // Returns HTML render for Markdown Instght
  $scope.renderMd = (a, b) => $sce.trustAsHtml(markdownIt.render(render(a, b)));

  // This function will determine weather a reference link is present or not
  $scope.hasLink = function (refLink) {
    return (typeof refLink === 'string') || refLink.enabled;
  }

  // If all the configured insights in visualizaton has N.A.,
  // then show custom error message
  $scope.validateData = function (data) {
    let showNoDataToShow = true;
    data.forEach(insight => {
      // Check if the insight type is text, if so check the array value is not N.A.
      if(insight.insightType === 'text') {
        if(typeof insight.metadata.value[0] !== 'undefined' && insight.metadata.value[0] !== 'N.A.') {
          showNoDataToShow = false;
        }
      }
      // Else check all the keys in Value object is N.A.
      else {
        let value;
        // eslint-disable-next-line guard-for-in
        for (value in insight.data) {
          if(insight.data[value] !== 'N.A.') {
            showNoDataToShow = false;
          }
        }
      }
    });
    return showNoDataToShow;
  };

  //Function to decide whether to show/hide a particular insight in Insight Vis
  $scope.showInsight = function (insight) {

    // Check if the insight type is text, if so check the array value is not N.A.
    if(insight.insightType === 'text') {
      if(typeof insight.metadata.value[0] !== 'undefined' && insight.metadata.value[0] !== 'N.A.') {
        return true;
      }
    }
    // Else check all the keys in Value object is N.A.
    else {
      let value;
      // eslint-disable-next-line guard-for-in
      for (value in insight.data) {
        if(insight.data[value] !== 'N.A.')return true;
      }
    }
    return false;

  };

  // This function is called when the 'View More' link
  // in the metric visualization is clicked. This will
  // handle the redirection to a dashboard or events of
  // interest page based on users input to reference page.
  $scope.viewDashboardForThisMetric = function (refLink)
  {
    // If referenceLink is disabled then do nothing
    if (!$scope.hasLink(refLink)) {
      return;
    }

    let referencePage = '';

    if (typeof refLink === 'string') {
      // If the Dashboard name has a space in it. Replace the space with hyphen -
      refLink = refLink.split(" ").join("-")
      referencePage = prepareLinkInfo(
        'dashboard/',
        refLink,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        getAppState,
        Private,
        timefilter
      );
    } else if (refLink.type === 'dashboard') {
      referencePage = prepareLinkInfo(
        'dashboard/',
        refLink.dashboard.id,
        refLink.searchString,
        refLink.retainFilters,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        getAppState,
        Private,
        timefilter
      );
    } else if (refLink.type === 'event') {
      referencePage = prepareLinkInfo(
        'event/',
        '',
        refLink.searchString,
        refLink.retainFilters,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        getAppState,
        Private,
        timefilter
      );
    }

    // Have changed from kbnUrl.redirect(url) to kbnUrl.change(url)
    // kbnUrl.redirect(url): will replace the current url with new url
    // will not add it to the browser's history
    // kbnUrl.change(url): will navigate to the new url
    // and add this url to the browser's history
    kbnUrl.change('/' + referencePage);
  };

  // This function prepares data sets from the
  // user entered data and makes a POST call to the
  // back end to get the response data.
  $scope.search = function run() {

    // If user hasn't configured bmv and insights yet, return
    if (!$scope.vis.params.bmv && !$scope.vis.params.insights) {
      return;
    }

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    const bmv = $scope.vis.params.bmv;
    const insights = $scope.vis.params.insights;
    const body = {
      request_type: 'insight',
      bmv: bmv || [],
      insights: insights || [],
      esFilter: esFilter,
    };

    // Get the selected time duration from time filter
    const timeDuration = timefilter.getBounds();
    const timeDurationStart = timeDuration.min.valueOf();
    const timeDurationEnd = timeDuration.max.valueOf();

    body.time = {
      'gte': timeDurationStart,
      'lte': timeDurationEnd
    };

    // THis flag has been used to show loading as api is being called
    $scope.loadingInsights = true;

    // Get the updated iconDict with uploaded images.
    // make API call after iconDict has been populated.
    getImages(StateService).then(function (iconDict) {
      const httpResult = $http.post(urlBase + '/insights/', body)
        .then((resp) => resp.data)
        .catch((resp) => {
          throw resp.data;
        });

      // Perform operation after getting response.
      httpResult.then(function (resp) {
        _.each(resp.insights, (insight) => {
          insight.image = iconDict[insight.group];
        });
        $scope.isLoaded = true;
        $scope.data = resp.insights;
      });
    });
  };

  // This is bad, there should be a single event that triggers a refresh of data.
  // When there is a change in business metric vis configuration
  $scope.$watchMulti(['vis.params.insights', 'vis.params.bmv'], $scope.search);

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);
});
