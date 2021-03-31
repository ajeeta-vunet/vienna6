import { uiModules } from 'ui/modules';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { EventConsole } from './EventConsole.js';
import chrome from 'ui/chrome';

import {
  fetchListOfEvents,
  fetchColumnSelectorInfo,
  fetchUserList,
  fetchFilterFields,
  fetchPreferences,
} from './api_calls';

require('ui/courier');
require('ui/config');
require('ui/notify');
require('plugins/kibana/event/styles/main.less');
require('angular-moment');

const app = uiModules.get('app/event', [
  'elasticsearch',
  'ngRoute',
  'kibana/courier',
  'kibana/config',
  'kibana/notify',
  'angularMoment',
]);

//Event react component
app.directive('eventConsole', (reactDirective) => {
  return reactDirective(EventConsole, [
    'listOfEvents',
    'columnSelectorInfo',
    'updateColumnSelector',
    'userList',
    'eventConsoleMandatoryFields',
    'canUpdateEvent',
    'filterFields',
    'itsmPreferencesEnabled',
  ]);
});

app.directive('eventApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'eventApp',
    controller: function ($route, $scope, config, $http, Private, timefilter, AppState) {
      timefilter.enabled = true;

      const queryFilter = Private(FilterBarQueryFilterProvider);
      const dashboardContext = Private(dashboardContextProvider);

      //for api call
      $scope.dashboardContext = dashboardContext;

      // Decide the maximum no of events to be shown under
      // event list.
      $scope.eventSampleSize = config.get('event:sampleSize');

      //Decide the fields that needs to be mandatory in Event listing.
      $scope.eventConsoleMandatoryFields = config.get('eventConsoleMandatoryFields');

      //this flag is used to determine whether user has ManageEvents permission or not.
      $scope.canUpdateEvent = chrome.canManageEvents();

      $scope.loadingEvents = true;

      //this holds the data related to what should be display in teh Top Navigation bar of events console page.
      $scope.topNavMenu = [{
        key: 'refresh',
        description: 'Refresh',
        run: function () {
          $scope.refresh();
        },
        testId: 'eventConsoleRefreshButton',
      }];

      // We will call this function inside init(). This is
      // done to make the api calls to the backend on load.
      // We also call this function in the following cases:
      // 1. When the timefilter is changed.
      // 2. When the queryfilter is changed.
      // 3. When there is a auto refresh
      $scope.search = function () {
        // This is used to get the start time and end time
        // from the time filter which is used to prepare the
        // data for POST call to the backend.
        const timeDuration = timefilter.getBounds();
        const timeDurationStart = timeDuration.min.valueOf();
        const timeDurationEnd = timeDuration.max.valueOf();
        const dashboardContext = Private(dashboardContextProvider);

        fetchListOfEvents(
          $http,
          chrome,
          dashboardContext,
          timeDurationStart,
          timeDurationEnd
        ).then((data) => {
          $scope.listOfEvents = data;
          $scope.loadingEvents = false;
        });

        fetchColumnSelectorInfo($http, chrome).then((data) => {
          $scope.columnSelectorInfo = data;
        });
      };

      if($scope.canUpdateEvent) {
        fetchUserList($http, chrome).then((data) => {
          $scope.userList = data;
        });
      }
      else{
        $scope.userList = [];
      }

      // API call to fetch the filter fields which will be used to filter events.
      fetchFilterFields($http, chrome).then((data) => {
        $scope.filterFields = data;
      });

      // API call to fetch the ITSM preferences set by logged-in user.
      fetchPreferences($http, chrome).then(() => {
        $scope.itsmPreferencesEnabled = true;
      })
        .catch((err) => {
          $scope.itsmPreferencesEnabled = false;
        });

      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.EVENTS);
        $scope.$emit('application.load');
        $scope.search();
      }

      // Initializing the query value in the event Appstate
      const stateDefaults = {
        // Setting title to 'Events' as there are no event
        // objects created.
        title: 'Events',
        query: {
          'query_string': {
            'query': '*',
            'analyze_wildcard': true
          }
        }
      };

      $scope.state = new AppState(stateDefaults);

      //passing these to the EventConsole react component
      $scope.updateColumnSelector = $route.current.locals.updateColumnSelector;
      $scope.columnSelectorInfo =  $route.current.locals.columnSelectorInfo;
      $scope.userList = $route.current.locals.userList;
      $scope.filterFields = $route.current.locals.filterFields;
      $scope.itsmPreferencesEnabled = $route.current.locals.itsmPreferencesEnabled;

      // When the time filter changes
      $scope.$listen(timefilter, 'fetch', $scope.search);

      // When a filter is added to the filter bar
      $scope.$listen(queryFilter, 'fetch', $scope.search);

      // When auto refresh happens
      $scope.$on('courier:searchRefresh', $scope.search);

      $scope.$on('fetch', $scope.search);

      $scope.refresh = function () {
        $scope.search();
      };

      init();
    },
  };
});
