import { uiModules } from 'ui/modules';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';
import { EventConsole } from './EventConsole.js';
import chrome from 'ui/chrome';
import { apiProvider } from '../../../../../ui_framework/src/vunet_components/vunet_service_layer/api/utilities/provider.js';
import { EventConstants } from './event_constants.js';

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
    'fetchRawEvents',
  ]);
});

app.directive('eventApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'eventApp',
    controller: function (
      $route,
      $scope,
      config,
      $http,
      Private,
      timefilter,
      AppState
    ) {
      timefilter.enabled = true;

      const queryFilter = Private(FilterBarQueryFilterProvider);
      const dashboardContext = Private(dashboardContextProvider);

      //for api call
      $scope.dashboardContext = dashboardContext;

      // Decide the maximum no of events to be shown under
      // event list.
      $scope.eventSampleSize = config.get('event:sampleSize');

      //Decide the fields that needs to be mandatory in Event listing.
      $scope.eventConsoleMandatoryFields = config.get(
        'eventConsoleMandatoryFields'
      );

      //this flag is used to determine whether user has ManageEvents permission or not.
      $scope.canUpdateEvent = chrome.canManageEvents();

      $scope.loadingEvents = true;

      //this holds the data related to what should be display in teh Top Navigation bar of events console page.
      $scope.topNavMenu = [
        {
          key: 'refresh',
          description: 'Refresh',
          run: function () {
            $scope.refresh();
          },
          testId: 'eventConsoleRefreshButton',
        },
      ];

      const currentUser = chrome.getCurrentUser();
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

        const postBody = {
          extended: {
            es: {
              filter: dashboardContext(),
            },
          },
          time: {
            gte: timefilter.getBounds().min.valueOf(),
            lte: timefilter.getBounds().max.valueOf(),
          },
          sample_size: 10000,
        };

        apiProvider
          .post(EventConstants.FETCH_LIST_OF_EVENTS, postBody)
          .then((data) => {
            $scope.listOfEvents = data;
            $scope.loadingEvents = false;
            $scope.$apply();
          });

        apiProvider
          .getAll(`${EventConstants.FETCH_COLUMN_SELECTOR_INFO}${currentUser[0]}/`)
          .then((response) => {
            $scope.columnSelectorInfo = response;
          });
      };

      if ($scope.canUpdateEvent) {
        apiProvider.getAll(EventConstants.FETCH_USERS_LIST).then((data) => {
          $scope.userList = data;
        });
      } else {
        $scope.userList = [];
      }

      // API call to fetch the filter fields which will be used to filter events.
      const postBody = {
        field: [
          'alarm_state',
          'severity',
          'created_by',
          'category',
          'status',
          'assignee',
          'impact',
          'ip_address',
          'region',
          'source',
          'supressed_event',
        ],
      };
      apiProvider
        .post(EventConstants.FETCH_FILTER_FILEDS, postBody)
        .then((data) => {
          $scope.filterFields = data;
          $scope.$apply();
        });

      // API call to fetch the ITSM preferences set by logged-in user.
      apiProvider
        .getAllWithoutBU(EventConstants.CHECK_ITSM_PREFERENCES)
        .then(() => {
          $scope.itsmPreferencesEnabled = true;
        })
        // eslint-disable-next-line no-unused-vars
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
          query_string: {
            query: '*',
            analyze_wildcard: true,
          },
        },
      };

      //used to fetch list of correlated event under a correlation id
      $scope.fetchRawEvents = (correlationId) => {
        const postBody = {
          extended: {
            es: {
              filter: dashboardContext(),
            },
          },
          time: {
            gte: timefilter.getBounds().min.valueOf(),
            lte: timefilter.getBounds().max.valueOf(),
          },
          sample_size: 10000,
        };
        return apiProvider.post(
          `${EventConstants.FETCH_LIST_OF_CORRELATED_EVENTS}${correlationId}/`,
          postBody
        );
      };

      apiProvider.getAll(
        `${EventConstants.FETCH_COLUMN_SELECTOR_INFO}${currentUser[0]}/`
      )
        .then((data) => {
          $scope.columnSelectorInfo = data;
          $scope.$apply();
        });

      $scope.updateColumnSelector = () => {
        const updateColumnSelectorReact = function (fields, hiddenFields) {
          const postBody = {
            alert_details: {
              fields: fields,
              hidden_fields: hiddenFields,
            },
            ticket_details: {
              fields: [],
              hidden_fields: [],
            },
          };

          return apiProvider.post(
            `${EventConstants.UPDATE_COLUMN_SELECTOR_INFO}${currentUser[0]}/`,
            postBody
          );
        };
        return updateColumnSelectorReact;
      };

      $scope.state = new AppState(stateDefaults);

      //passing these to the EventConsole react component
      // $scope.updateColumnSelector = $route.current.locals.updateColumnSelector;
      // $scope.columnSelectorInfo = $route.current.locals.columnSelectorInfo;
      $scope.userList = $route.current.locals.userList;
      $scope.filterFields = $route.current.locals.filterFields;
      $scope.itsmPreferencesEnabled =
        $route.current.locals.itsmPreferencesEnabled;

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
