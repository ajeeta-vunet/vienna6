var _ = require('lodash');

var logoUrl = require('./logo.png');

require('./directives/chart_directive');
require('./directives/expression_directive');
require('./directives/docs');
require('./main.less');

var timelionLogo = require('plugins/timelion/header.png');

require('ui/chrome')
.setBrand({
  'logo': 'url(' + timelionLogo + ') left no-repeat',
  'smallLogo': 'url(' + timelionLogo + ') left no-repeat'
}).setTabs([]);

var app = require('ui/modules').get('apps/timelion', []);

require('plugins/timelion/services/saved_sheets');
require('plugins/timelion/services/_saved_sheet');

require('ui/saved_objects/saved_object_registry').register(require('plugins/timelion/services/saved_sheet_register'));

// TODO: Expose an api for dismissing notifications
var unsafeNotifications = require('ui/notify')._notifs;
var ConfigTemplate = require('ui/ConfigTemplate');

require('ui/routes')
  .when('/:id?', {
    template: require('plugins/timelion/index.html'),
    reloadOnSearch: false,
    resolve: {
      savedSheet: function (courier, savedSheets, $route) {
        return savedSheets.get($route.current.params.id)
        .catch(courier.redirectWhenMissing({
          'search': '/'
        }));
      }
    }
  });

app.controller('timelion', function (
  $scope, $http, timefilter, AppState, courier, $route, $routeParams, kbnUrl, Notifier, config, $timeout) {
  timefilter.enabled = true;
  var notify = new Notifier({
    location: 'Timelion'
  });

  var defaultExpression = '.es(*)';
  var savedSheet = $route.current.locals.savedSheet;
  var blankSheet = [defaultExpression];

    // config panel templates
  $scope.configTemplate = new ConfigTemplate({
    load: require('plugins/timelion/partials/load_sheet.html'),
    save: require('plugins/timelion/partials/save_sheet.html'),
    options: require('plugins/timelion/partials/sheet_options.html'),
    docs: '<timelion-docs></timelion-docs>'
  });

  if (config.get('timelion:showTutorial', true)) {
    $scope.configTemplate.toggle('docs');
  }

  $scope.state = new AppState(getStateDefaults());
  function getStateDefaults() {
    return {
      sheet: savedSheet.timelion_sheet,
      selected: 0,
      columns: savedSheet.timelion_columns,
      interval: savedSheet.timelion_interval
    };
  }

  var init = function () {
    $scope.running = false;
    $scope.committedSheet = _.clone($scope.state.sheet);
    $scope.safeSearch();

    $scope.$listen($scope.state, 'fetch_with_changes', $scope.search);
    $scope.$listen(timefilter, 'fetch', $scope.search);

    $scope.opts = {
      save: save,
      savedSheet: savedSheet,
      state: $scope.state,
      search: $scope.search,
      dontShowHelp: function () {
        config.set('timelion:showTutorial', false);
        $scope.configTemplate.toggle('docs');
      }
    };
  };

  var refresher;
  $scope.$watchCollection('timefilter.refreshInterval', function (interval) {
    if (refresher) $timeout.cancel(refresher);
    if (interval.value > 0 && !interval.pause) {
      function startRefresh() {
        refresher = $timeout(function () {
          if (!$scope.running) $scope.search();
          startRefresh();
        }, interval.value);
      };
      startRefresh();
    }
  });

  $scope.toggle = function (property) {
    console.log(property);
    $scope[property] = !$scope[property];
  };

  $scope.newSheet = function () {
    kbnUrl.change('/', {});
  };

  $scope.newCell = function () {
    $scope.state.sheet.push(defaultExpression);
    $scope.state.selected = $scope.state.sheet.length - 1;
    $scope.safeSearch();
  };

  $scope.removeCell = function (index) {
    _.pullAt($scope.state.sheet, index);
    $scope.safeSearch();
  };

  $scope.setActiveCell = function (cell) {
    $scope.state.selected = cell;
  };

  $scope.search = function () {
    $scope.state.save();
    $scope.running = true;

    $http.post('/timelion/sheet', {
      sheet: $scope.committedSheet,
      time: _.extend(timefilter.time, {
        interval: $scope.state.interval
      }),
    })
    // data, status, headers, config
    .success(function (resp) {
      dismissNotifications();
      $scope.stats = resp.stats;
      $scope.sheet = resp.sheet;
      _.each(resp.sheet, function (cell) {
        if (cell.exception) {
          $scope.state.selected = cell.plot;
        }
      });
      $scope.running = false;
    })
    .error(function (resp) {
      $scope.sheet = [];
      $scope.running = false;

      var err = new Error(resp.message);
      err.stack = resp.stack;
      notify.error(err);

    });
  };

  $scope.commitAndSearch = function () {
    $scope.committedSheet = _.clone($scope.state.sheet);
    $scope.search();
  };

  $scope.safeSearch = _.debounce($scope.search, 500);

  function save() {
    savedSheet.id = savedSheet.title;
    savedSheet.timelion_sheet = $scope.committedSheet;
    savedSheet.timelion_interval = $scope.state.interval;
    savedSheet.timelion_columns = $scope.state.columns;
    savedSheet.save().then(function (id) {
      $scope.configTemplate.close('save');
      if (id) {
        notify.info('Saved sheet as "' + savedSheet.title + '"');
        if (savedSheet.id !== $routeParams.id) {
          kbnUrl.change('/{{id}}', {id: savedSheet.id});
        }
      }
    });
  };

  function dismissNotifications() {
    unsafeNotifications.splice(0, unsafeNotifications.length);
  }

  init();
});
