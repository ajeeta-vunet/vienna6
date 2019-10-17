import _ from 'lodash';
import moment from 'moment';
import { uiModules } from 'ui/modules';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { addSearchStringForUserRole } from 'ui/utils/add_search_string_for_user_role.js';

const module = uiModules.get('kibana/uvmap_vis', ['kibana']);
module.controller('UVMapVisController', function ($scope, Private, Notifier, $http, $rootScope, timefilter, kbnUrl) {
  const dashboardContext = Private(dashboardContextProvider);
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const notify = new Notifier({
    location: 'UVMapVis'
  });

  // To pass node placement type to the vis-map directive.
  $scope.nodePlacementType = 'dragNDrop';

  // When a node is dragged, at the end, this function is called.
  // It just prints the locations of the nodes in console. This
  // will help people to fix 'x', 'y' for different nodes,
  // data.nodes will print the nodes information
  // Function to update x and y values in visParamsConnection.
  $scope.onNodeDragEnd = function (draggedNodeList, positions) {
    const nodes = $scope.data.nodes;
    let visParamsConnection = $scope.vis.params.connection;
    visParamsConnection = visParamsConnection.split('\n');

    // Iterating through string array
    _.each(visParamsConnection, function (connectionEle, index) {
      const regexForXAndY = /x[\s]+[+-]*[0-9]+[\s]y[\s]+[+-]*[0-9]+/;
      // checking the string having name as substring
      if (_.includes(connectionEle, 'name')) {
        // Iterating through all nodes.
        _.each(nodes, function (node) {
          const lableVal = node.label.split(/<.+?>/g);
          // checking node lable in string as substring.
          // If so getting the id with that updating new x and y values.
          if (_.includes(connectionEle, lableVal[1])) {
            const updateXY = 'x ' + positions[node.id].x + ' y ' + positions[node.id].y;
            visParamsConnection[index] = connectionEle.replace(regexForXAndY, updateXY);
          }
        });
      }
    });
    // Reverting string array to string with updated x and y values
    const newParamsConnection = visParamsConnection.join('\n');
    // broadcasting an event with updated string.
    $rootScope.$broadcast('vusop:uvMapData', newParamsConnection);
  };


  // This function will gets called only when
  // connection has dashboard configured.
  function setDashboardDict() {

    // Get all the available dashboards to display
    const savedObjectsClient = Private(SavedObjectsClientProvider);
    const dashboardDict = {};
    return savedObjectsClient.find({
      type: 'dashboard',
      fields: ['title'],
      perPage: 1000
    }).then(response => {
      // Create dashboarad dictionary with title and id of dashboards
      // for showing in the dashboard selection list
      response.savedObjects.map(pattern => {
        const id = pattern.id;
        dashboardDict[pattern.get('title')] = id;
      });
      return dashboardDict;
    });
  }

  $scope.search = function run() {
    let connection = $scope.vis.params.connection;

    // Update dashboard title with dashboard id in connection
    // only if dashboard is there in connection.
    if (_.includes(connection, 'dashboard')) {

      setDashboardDict().then((dashboardDict) => {

        // Update connection by replacing dashboard name with dashboard id.
        connection = connection.split('\n');

        // Iterating through string array
        _.each(connection, function (connectionEle, index) {

          // Regex to get value within a qoutes.
          const regexForDashboardName = /["].+["]/ || /['].+[']/;

          // checking the string having dashboard as substring
          if (_.includes(connectionEle, 'dashboard')) {

            // Get the dashboard title configured within the quots and replace same with empty.
            // We are not allowing user to use dashboard title is having quotes, this will take care
            // of replacing quotes with empty in dashboard title, it just replace the quotes which are
            // not part of dashboard title
            const dashTitle = connectionEle.match(regexForDashboardName) &&
            connectionEle.match(regexForDashboardName)[0].replace(/["']/g, '');

            // Get the dashboard id using dashboard title.
            const dashboard = dashboardDict[dashTitle];
            // Replace dashboard name with dashboard id if dashboard is there, else just return connectionEle.
            connection[index] =  dashboard ? connectionEle.replace(connectionEle.match(regexForDashboardName)[0], '"' + dashboard + '"')
              : connectionEle;
          }
        });

        // Convert string array to single string.
        connection = connection.join('\n');

        // Make POST call after resolving of getting dashboard dict.
        makePostCall(connection);
      });
    } else {

      // Make POST cal for no dashboard configured.
      makePostCall(connection);
    }
  };

  // To make POST a call.
  function makePostCall(connection) {
    const expression = $scope.vis.params.expression;
    const colorSchema = $scope.vis.params.colorSchema || [];

    // If both expression and connection doesn't have anything, we don't have
    // anything to do..
    if (!expression && !connection) return;

    let esFilter = dashboardContext();

    //Get the search string assigned to the logged-in user's role.
    esFilter = addSearchStringForUserRole(esFilter);

    // As we want to display one single metric, we choose the interval as
    // current time selection + 1 second. This will make sure that ES always
    // returns one single metric.
    const timeDuration = timefilter.getBounds();
    const duration = moment.duration(timeDuration.max.diff(timeDuration.min));
    const timeDurationSeconds = Math.round(duration.asSeconds()) + 1;
    const timeInterval = timeDurationSeconds + 's';
    // Invoke the backend URL with all the details..
    const httpResult = $http.post('../api/uvmap_vis/run', {
      sheet: [expression],
      connection: [connection],
      colorSchema: colorSchema,
      extended: {
        es: {
          filter: esFilter
        }
      },
      time: _.extend(timefilter.time, {
        interval: timeInterval
      }),
    })
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    httpResult
      .then(function (resp) {
        $scope.data = resp.data;
      })
      .catch(function (resp) {
        $scope.data = [];
        const err = new Error(resp.message);
        err.stack = resp.stack;
        notify.error(err);
      });
  }

  // Function to be called when hovering a node
  $scope.doesNodeHasDashboard = function (hoveredNodeId) {
    if (hoveredNodeId in $scope.data.node_dashboard_dict) {
      return true;
    } else {
      return false;
    }
  };

  // Function to be called when a node is selected
  $scope.onNodeSelect = function (selectedNodeId) {
    if ($scope.doesNodeHasDashboard(selectedNodeId)) {
      const dashboardURL = '/dashboard/' + $scope.data.node_dashboard_dict[selectedNodeId].value;

      // Have changed from kbnUrl.redirect(url) to kbnUrl.change(url)
      // kbnUrl.redirect(url): will replace the current url with new url
      // will not add it to the browser's history
      // kbnUrl.change(url): will navigate to the new url
      // and add this url to the browser's history
      kbnUrl.change(dashboardURL);

      // We are forcing angular digest cycle to run to redirect to the
      // dashboard URL.
      // We could not able to figure out how to avoid forcing angular digest cycle..
      $scope.$apply();
    }
  };

  // following methods are passed to vis_map
  // these methods are invoked on occurance of various events in the UTM
  $scope.utmEventArgs = {
    onNodeSelect: $scope.onNodeSelect,
    onNodeDragEnd: $scope.onNodeDragEnd,
  };


  // This is bad, there should be a single event that triggers a refresh of data.

  // When the expression updates
  $scope.$watchMulti(['vis.params.expression', 'vis.params.connection', 'vis.params.interval', 'vis.params.colorSchema', ], $scope.search);

  // When the time filter changes
  $scope.$listen(timefilter, 'fetch', $scope.search);

  // When a filter is added to the filter bar?
  $scope.$listen(queryFilter, 'fetch', $scope.search);

  // When auto refresh happens
  $scope.$on('courier:searchRefresh', $scope.search);

  $scope.$on('fetch', $scope.search);

});
