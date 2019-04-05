import _ from 'lodash';
import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';

import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { FilterManagerProvider } from 'ui/filter_manager';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { displayTwoTimeUnits } from 'ui/utils/vunet_get_time_values.js';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

require('ui/courier');
require('ui/config');
require('ui/notify');
require('angular-smart-table');
require('angular-moment');
require('plugins/kibana/event/styles/main.less');
require('plugins/kibana/event/directives/time_period_label');
require('plugins/kibana/event/directives/event_summary');
require('plugins/kibana/event/directives/event_detailed_info');
require('plugins/kibana/event/directives/additional_info');
require('plugins/kibana/event/directives/severity_widget');
require('angular-ui-bootstrap');

const app = uiModules.get('app/event', [
  'elasticsearch',
  'ngRoute',
  'kibana/courier',
  'kibana/config',
  'kibana/notify',
  'smart-table',
  'angularMoment',
  'ui.bootstrap'
]);

// Setting a custom pagination template.
app.config(function (stConfig) {
  stConfig.pagination.template = '/ui/vienna_data/pagination.html';
});

// This filter is used to convert the values received in seconds
// to format as shown below:
// Input(in seconds)	Filter Output
//  320	               5m 20s
//  3666	             1h 1m
app.filter('displayTwoTimeUnits', function () {
  return function (seconds) {
    const result = displayTwoTimeUnits(seconds);
    return result;
  };
});

app.directive('eventApp', function () {
  return {
    restrict: 'E',
    controllerAs: 'eventApp',
    controller: function (
      $http,
      $route,
      $routeParams,
      $scope,
      $timeout,
      AppState,
      config,
      confirmModal,
      courier,
      kbnUrl,
      Notifier,
      Private,
      timefilter
    ) {

      timefilter.enabled = true;

      const queryFilter = Private(FilterBarQueryFilterProvider);
      const filterManager = Private(FilterManagerProvider);
      const dashboardContext = Private(dashboardContextProvider);

      const notify = new Notifier({
        location: 'Events'
      });

      // We set the no of items to be displayed in a page
      // under events list.
      $scope.itemsByPage = 10;

      // Decide the maximum no of events to be shown under
      // event list.
      $scope.eventSampleSize = config.get('event:sampleSize');

      // Get the first part of the url containing the tenant
      // and bu id to prepare urls for api calls.
      // Example output: /vuSmartMaps/api/1/bu/1/
      let urlBase = chrome.getUrlBase();
      urlBase = urlBase + '/events_of_interest';

      // Get the index id set in the route
      const index = $route.current.locals.index;

      // This function is called when any severity type
      // is clicked in vusmartmaps.
      $scope.filter = function (severity) {
        if(index !== '') {
          $scope.severity = severity.split('_')[0];
          if (severity !== 'total') {
            // Add a new filter via the filter manager
            filterManager.add(
              // The field to filter for
              'severity',
              // The value to filter for
              $scope.severity,
              // Whether the filter is negated.
              // If you want to create a negated filter pass '-' here
              null,
              // The index 'id' for the filter
              index
            );
          }
        } else {
          const tenantBu = chrome.getTenantBu();
          notify.error('Please create index pattern "vunet-' + tenantBu[0] + '-' + tenantBu[1] +
                       '-notification-*"');
        }

      };

      // This function is called when any Rest Api fails
      const getErrorDetails = function (resp) {
        const err = new Error(resp.message);
        err.stack = resp.stack;
        notify.error(err);
      };

      // This function will check if the given input
      // if of type object.
      const isKeyAnObject = function (key) {
        if (key === null) {
          return false;
        }
        else if ((typeof key === 'function') || (typeof key === 'object')) {
          return true;
        }
        else {
          return false;
        }
      };

      // This function is used to set the css of widgets
      // used to display the severity based event count
      $scope.setCssForSeverityBasedWidgets = function (severity) {
        if (severity === 'critical') {
          return 'critical-meter';
        }
        else if (severity === 'error') {
          return 'error-meter';
        }
        else if (severity === 'warning') {
          return 'warning-meter';
        }
        else if (severity === 'information') {
          return 'information-meter';
        }
        else if (severity === 'total') {
          return 'total-meter';
        }
      };

      // We will call this function inside init(). This is
      // done to make the api calls to the backend on load.
      // We also call this function in the following cases:
      // 1. When the timefilter is changed.
      // 2. When the queryfilter is changed.
      // 3. When there is a auto refresh
      $scope.search = function () {
        // Initialising the data objects
        // when search function is called.
        $scope.listOfEvents = [];
        $scope.eventInfoList = [];

        // This is used to get the start time and end time
        // from the time filter which is used to prepare the
        // data for POST call to the backend.
        const timeDuration = timefilter.getBounds();
        $scope.timeDurationStart = timeDuration.min.valueOf();
        $scope.timeDurationEnd = timeDuration.max.valueOf();

        // make a post call to backend and get the severity based events json
        const httpResult = $http.post(urlBase + '/severity_based_events/', {
          extended: {
            es: {
              filter: dashboardContext()
            }
          },
          time: { 'gte': $scope.timeDurationStart, 'lte': $scope.timeDurationEnd }
        })
          .then(resp => resp.data)
          .catch(resp => { throw resp.data; });

        httpResult
          .then(function (resp) {
            if ((resp['Time-Periods']).length > 0) {
              // Prepare data sets to populate the severity
              // widgets based on severity type for a particular
              // time duration
              // sample data input coming from the back end.
              // {
              //   "Time-Periods": [
              //       {
              //           "period" : "selected_period",
              //     "critical": 33,
              //     "information": 37,
              //           "error": 33,
              //           "warning": 55,
              //           "total": 156
              //       },
              //       {
              //           "period" : "last_1_hour",
              //     "critical": 33,
              //     "information": 37,
              //           "error": 33,
              //           "warning": 55,
              //           "total": 156
              //       },
              //       {
              //           "period" : "last_1_day",
              //     "critical": 33,
              //     "information": 37,
              //           "error": 33,
              //           "warning": 55,
              //           "total": 156
              //       },
              //       {
              //           "period" : "last_7_days",
              //     "critical": 33,
              //     "information": 37,
              //           "error": 33,
              //           "warning": 55,
              //           "total": 156
              //       }
              //   ]
              // }
              $scope.severityWidgetList = [];

              const informationDict = {
                'type': 'information',
                'last_1_day': 0,
                'last_1_hour': 0,
                'last_7_days': 0,
                'selected_period': 0,
                'total': 0
              };

              const warningDict = {
                'type': 'warning',
                'last_1_day': 0,
                'last_1_hour': 0,
                'last_7_days': 0,
                'selected_period': 0,
                'total': 0
              };

              const errorDict = {
                'type': 'error',
                'last_1_day': 0,
                'last_1_hour': 0,
                'last_7_days': 0,
                'selected_period': 0,
                'total': 0
              };

              const criticalDict = {
                'type': 'critical',
                'last_1_day': 0,
                'last_1_hour': 0,
                'last_7_days': 0,
                'selected_period': 0,
                'total': 0
              };

              const totalDict = {
                'type': 'total',
                'last_1_day': 0,
                'last_1_hour': 0,
                'last_7_days': 0,
                'selected_period': 0,
                'total': 0
              };

              _.each(resp['Time-Periods'], function (item) {
                informationDict[item.period] = item.information;
                warningDict[item.period] = item.warning;
                errorDict[item.period] = item.error;
                criticalDict[item.period] = item.critical;
                totalDict[item.period] = item.total;
              });

              $scope.severityWidgetList.push(informationDict);
              $scope.severityWidgetList.push(warningDict);
              $scope.severityWidgetList.push(errorDict);
              $scope.severityWidgetList.push(criticalDict);
              $scope.severityWidgetList.push(totalDict);
            } else {
              $scope.severityWidgetList = undefined;
            }
            // get the object corresponding to the selected period from
            // the array of severityWidgetList
            const selectedPeriodObj = $scope.severityWidgetList.filter(function (obj) {
              return (obj.type === 'total');
            });
            $scope.totalEventsCount = selectedPeriodObj[0].selected_period;
          })
          .catch(function (resp) {
            $scope.severityBasedEventsCount = [];
            getErrorDetails(resp);
          });

        // make a post call to backend and get the list of events json
        const httpListOfEventsResult = $http.post(urlBase + '/list_of_events/', {
          extended: {
            es: {
              filter: dashboardContext()
            }
          },
          time: { 'gte': $scope.timeDurationStart, 'lte': $scope.timeDurationEnd },
          sample_size: parseInt($scope.eventSampleSize)
        })
          .then(resp => resp.data)
          .catch(resp => { throw resp.data; });

        httpListOfEventsResult
          .then(function (resp) {
            $scope.listOfEvents = resp.List_of_events;
            $scope.noOfEvents = $scope.listOfEvents.length;
            if ($scope.noOfEvents > 0) {

              // Get the first_id from the list
              const firstEventObj = {
                id: $scope.listOfEvents[0].id,
                summary: $scope.listOfEvents[0].summary
              };

              // Show the information related to first event
              $scope.showEventInformation(firstEventObj);

              // isSelected is a variable in smart tables which
              // is set to true when any row is selected in the
              // front end. // Highlight the selection of first
              // event on loading event page.
              $scope.listOfEvents[0].isSelected = true;
            }
          })
          .catch(function (resp) {
            $scope.listOfEvents = [];
            getErrorDetails(resp);
          });
      };

      // This function will be called when clicked on any particular event.
      $scope.showEventInformation = function (eventObj) {

        // isSelected is a variable in smart tables which
        // is set to true when any row is selected in the
        // front end. // Highlight the selection of first
        // event on loading event page.
        if ($scope.listOfEvents.length > 0) {
          $scope.listOfEvents[0].isSelected = false;
        }

        // We make a call to the backend to get the detailed information for
        // the clicked event.
        const httpShowEventResult = $http.get(urlBase + '/individual_event/' + eventObj.id + '/', {})
          .then(resp => resp.data)
          .catch(resp => { throw resp.data; });

        httpShowEventResult
          .then(function (resp) {
            const respData = resp;

            if (respData.hasOwnProperty('Ticket Information')) {
              // Extracting only the ticket id from the Ticket Information value.
              // Since the 'Ticket Information' will be a string
              // (Example: Ticket ID INC0248991 logged in ServiceNow)
              // We use split function split the string with white space as
              // break point and use only the ticket id (Example INC0248991)
              const ticketInfoArray = respData['Ticket Information'].split(' ');
              $scope.ticketId = ticketInfoArray[2];
            } else {
              $scope.ticketId = '';
            }

            // This function checks if there are Formatted fields
            // in a docSection and update the docSection fields
            // with formatted fields.
            const checkAndUseFormattedFields = function (docSection) {

              // Check if formatted fields exists and
              // replace the actual values with formatted
              // values
              if (_.has(docSection, 'Formatted_fields')) {
                for (const fkey in docSection.Formatted_fields) {
                  if (docSection.Formatted_fields.hasOwnProperty(fkey)) {
                    docSection[fkey] = docSection.Formatted_fields[fkey];
                  }
                }
                // Get rid of Formatted fields as we don't
                // display them.
                delete docSection.Formatted_fields;
              }
            };


            // This function takes the nested object as input and
            // prepares a section with table structure to be displayed in the
            // event details page.
            const prepareTabularSection = function (header, content) {
              // Initialising a dict to store the
              // section header, section sub header,
              // table headers and table rows
              const sectionJson = {};

              // List to store the table rows
              const tableRowsList = [];

              // Initialize a variable to store subheader.
              let subHeader = '';

              // List to store the table headers
              let tableHeaders = [];
              tableHeaders.push('Name');

              // We iterate over the nested object
              // and prepare a list containing
              // all the table headers. We get the
              // table headers first separately so that
              // we can use this as a look up and add
              // blank values for column which does not have
              // any value.
              for (const key in content) {
                if (content.hasOwnProperty(key)) {
                  const sectionObj = content[key];
                  for (const intKey in sectionObj) {
                    if (sectionObj.hasOwnProperty(intKey)) {
                      // Iterate over all the keys of the
                      // nested objects and prepare a list
                      // of unique elements(table headers)
                      // The _.union is used to merge
                      // two lists and remove the duplicates.
                      tableHeaders = _.union(tableHeaders, Object.keys(sectionObj[intKey]));
                    }
                  }
                }
              }

              // Get the length of tableHeaders list.
              const tableHeadersLength = tableHeaders.length;

              for (const key in content) {
                if (content.hasOwnProperty(key)) {
                  // Set the subheader value
                  subHeader = key;
                  const sectionObj = content[key];
                  for (const intKey in sectionObj) {
                    if (sectionObj.hasOwnProperty(intKey)) {
                      const sectionContent = sectionObj[intKey];

                      // Initializing tableRow (which is a row in table
                      // structure to be displayed) with empty string as element
                      // and length of tableHeaders as the size (no of elements in
                      // headers and no of elements in row will be same).
                      const tableRow = Array(tableHeadersLength).fill('');
                      // For the above code if tableHeadersLength = 3, Then the
                      // value for tableRow = ['', '', '']

                      // Set the first element in the row as the nested object
                      // header
                      tableRow[0] = intKey;

                      // Iterate over each item in the nested object and
                      // use tableHeaders as a look up and insert the
                      // table values at the corresponding index. If any
                      // intKey is not found for a nested object, The '' string
                      // value is retained for that column.
                      for (const contentKey in sectionContent) {
                        if (sectionContent.hasOwnProperty(contentKey)) {
                          const index = tableHeaders.indexOf(contentKey);
                          if (index !== -1) {
                            tableRow[index] = sectionContent[contentKey];
                          }
                        }
                      }
                      tableRowsList.push(tableRow);
                    }
                  }
                }
              }
              sectionJson.header = header;
              sectionJson.subHeader = subHeader;
              sectionJson.tableHeaders = tableHeaders;
              sectionJson.tableRowsList = tableRowsList;
              return sectionJson;
            };

            // Initialising the General list.
            const General = {};

            // Initialising the eventInfoDict list
            const eventInfoDict = {};

            // Initialising the additionalInfoDict to store
            // Nested objects.
            const additionalInfoDict = {};

            // Set the general list at the beginning of
            // eventInfoDict
            eventInfoDict.General = General;

            // We parse the response received from the back end
            // and put up all the objects under eventInfoDict,
            // nested objects under additionalInfoDict and others
            // inside General
            for (const key in respData) {
              if (!isKeyAnObject(respData[key])) {
                General[key] = respData[key];
              }
              else {

                // Flag which will be set to true if
                // the current object has any objects under it
                let isTwoLevelNestedObject = false;

                // Check for nested objects.
                const obj = respData[key];

                // Get formatted fields if exists for this section
                checkAndUseFormattedFields(obj);

                for (const item in obj) {

                  // check if the current object is one level
                  // or two level deep
                  if (isKeyAnObject(obj[item])) {
                    isTwoLevelNestedObject = true;

                    // Check for nested objects.
                    const nestedObj = obj[item];
                    for (const item in nestedObj) {
                      if (nestedObj.hasOwnProperty(item)) {
                        // Get formatted fields if exists for this section
                        checkAndUseFormattedFields(nestedObj[item]);
                      }
                    }
                  }
                }

                // Add the resp[key] under the appropriate
                // object list based on the Nesting level flag.
                if (isTwoLevelNestedObject) {
                  additionalInfoDict[key] = respData[key];
                } else {
                  eventInfoDict[key] = respData[key];
                }
              }
            }

            // Initializing the additionalInfoList which stores
            // all the nested objects to be rendered as different
            // sections
            $scope.additionalInfoList = [];

            // Iterate over each nested object and prepare tabular
            // structure. Sample additionalInfoDict is as shown below.
            // The first object 'R3' in the json below is obtained by
            // configuring an information rule with one group by field:'host'
            // in the front end. Similarly 'R2' information rule object
            // has two group by fields 'host' and 'ppid'.
            //  {
            //  "R3": {
            //     "host-Information": {
            //       "3542": {
            //         "fs-device_name": "none",
            //         "files total": 29556514529280
            //       },
            //       "inspiron": {
            //         "fs-device_name": "none",
            //         "files total": 29556514529280
            //       },
            //       "ranjan": {
            //         "fs-device_name": "none",
            //         "files total": 29556514529280
            //       }
            //     }
            //   },
            //   "R2": {
            //     "proc-ppid-Information": {
            //       "1179": {
            //         "Proc cpu System": 911380.33
            //       },
            //       "2542": {
            //         "Proc cpu System": 74465.71
            //       },
            //       "4547": {
            //         "Proc cpu System": 222052.08,
            //         "proc-mem-rss_p": 0.02
            //       },
            //       "11862": {
            //         "proc-cpu-user_p": 0.005,
            //         "Proc cpu System": 75097.67,
            //         "proc-mem-rss_p": 0.03
            //       },
            //       "19437": {
            //         "proc-cpu-user_p": 0.014,
            //         "Proc cpu System": 711595.33
            //       }
            //     }
            //   }
            // }
            for (const key in additionalInfoDict) {
              if (additionalInfoDict.hasOwnProperty(key)) {
                const sectionJson = prepareTabularSection(key, additionalInfoDict[key]);
                // sample sectionJson received after processing
                // to display in table format is as shown below:
                // {
                //   "header": "R3",
                //   "subHeader": "host-Information",
                //   "tableHeaders": ["Name", "fs-device_name", "fs total"]
                //   "tableRowsList": [
                //                  ["3542", "", 29556514529280],
                //                  ["inspiron","", 29556514529280],
                //                  ["ranjan", "", 29556514529280]
                //                ]
                // }
                $scope.additionalInfoList.push(sectionJson);
              }
            }

            // Get the length of eventInfoDict.
            const eventInfoDictLength = Object.keys(eventInfoDict).length;

            // Initialising the sublist to display data
            // column wise in the front end.
            let columnSection = [];

            // Initilising the mainlist to display data
            // column wise in the front end.
            $scope.eventInfoList = [];
            let count = 0;

            // Dividing the eventInfoDict to 2 parts
            // to display information in 2 columns in the
            // front end.
            for (const key in eventInfoDict) {
              if (eventInfoDict.hasOwnProperty(key)) {
                const d = {};
                d[key] = eventInfoDict[key];
                columnSection.push(d);
                count = count + 1;
                if (count === parseInt(eventInfoDictLength / 2)) {
                  $scope.eventInfoList.push(columnSection);
                  columnSection = [];
                }
              }
            }
            // After the last iteration over eventInfoDict,
            // Check for contents in the column section and
            // push it to eventInfoList.
            if (columnSection.length > 0) {
              $scope.eventInfoList.push(columnSection);
            }
          })
          .catch(function (resp) {
            $scope.eventInfoList = [];
            getErrorDetails(resp);
          });

        // Initialsing the comment object
        $scope.comment = {
          'commentString': ''
        };

        // This function is called when user posts a comment.
        $scope.postComment = function () {
          // Get the logged in user's information
          const currentUser = chrome.getCurrentUser();
          const username = currentUser[0];

          // ISO-8601 is a standard for time and duration display.
          // gives the output in UTC format.
          const currTime = new Date().toISOString();

          // Get rid of 'T' in the currTime obtained above.
          const timestamp = currTime.replace(/T/, ' ').replace(/\..+/, '');

          // make a post call to backend passing the comment object.
          const httpAddCommentResult = $http.post(urlBase + '/comments/', {
            'summary': eventObj.summary,
            'username': username,
            'timestamp': timestamp,
            'comment': $scope.comment.commentString
          })
            .then(resp => resp.data)
            .catch(resp => { throw resp.data; });

          httpAddCommentResult
            .then(function () {
              // Updating the UI with the comment added when
              // the response is SUCCESS.
              const commentObj = {
                'summary': eventObj.summary,
                'username': username,
                'timestamp': timestamp,
                'comment': $scope.comment.commentString
              };
              $scope.listOfComments.unshift(commentObj);
              $scope.comment.commentString = '';
            })
            .catch(function (resp) {
              getErrorDetails(resp);
            });
        };

        // This function makes a call to the backend and
        const displayComments = function () {

          // setting the event summary as the query parameter
          // to be passed to the backend.
          const eventSummary = encodeURIComponent(eventObj.summary);
          const displayCommentsUrl = urlBase + '/comments/' +
            '?event_summary=' + eventSummary;

          // Api call to get list of comments
          const httpViewCommentResult = $http.get(displayCommentsUrl, {})
            .then(resp => resp.data)
            .catch(resp => { throw resp.data; });

          httpViewCommentResult
            .then(function (resp) {
              $scope.listOfComments = resp;
            })
            .catch(function (resp) {
              $scope.comments_list = [];
              getErrorDetails(resp);
            });
        };
        displayComments();
      };

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

      function init() {
        const docTitle = Private(DocTitleProvider);
        docTitle.change(VunetSidebarConstants.EVENTS);
        $scope.$emit('application.load');
        $scope.search();
      }

      // When the time filter changes
      $scope.$listen(timefilter, 'fetch', $scope.search);

      // When a filter is added to the filter bar
      $scope.$listen(queryFilter, 'fetch', $scope.search);

      // When auto refresh happens
      $scope.$on('courier:searchRefresh', $scope.search);

      $scope.$on('fetch', $scope.search);

      init();
    }
  };
});
