import _ from 'lodash';
import $ from 'jquery';
import angular from 'angular';
import chrome from 'ui/chrome';
import { saveAs } from '@elastic/filesaver';

import 'plugins/kibana/report/saved_report/saved_reports';
import 'plugins/kibana/report/components/panel/panel';
import 'ui/vis/editors/default/sidebar';
import 'ui/collapsible_sidebar';
import 'ui/share';
import 'ui/query_bar';
import 'ui/courier';
import 'ui/timefilter';

import moment from 'moment';
import { DocTitleProvider } from 'ui/doc_title';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { getTenantData } from 'ui/utils/vunet_tenant_data';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import { ReportConstants, createReportEditUrl, createReportPrintUrl } from './report_constants';
import { logUserOperation } from 'plugins/kibana/log_user_operation';

uiRoutes
  .when(ReportConstants.CREATE_PATH, {
    template: require('plugins/kibana/report/report.html'),
    resolve: {
      printReport: function () {return false;},
      reportcfg: function (savedReports) {
        return savedReports.get();
      },
      company_name: function ($http, chrome) {
        return getTenantData($http, chrome);
      },
      // This flag indicates if new report is being
      // created.
      isNewReport: function () {
        return true;
      }
    }
  })
  .when(createReportEditUrl(':id'), {
    template: require('plugins/kibana/report/report.html'),
    resolve: {
      printReport: function () {return false;},
      reportcfg: function (savedReports, $route, courier) {
        return savedReports.get($route.current.params.id)
          .catch(courier.redirectWhenMissing({
            'report': ReportConstants.LANDING_PAGE_PATH
          }));
      },
      company_name: function () {return '';},
      isNewReport: function () {
        return false;
      },
      loadedReportId: function ($route) {
        return $route.current.params.id;
      }
    }
  })
  .when(createReportPrintUrl(':id'), {
    template: require('plugins/kibana/report/report.html'),
    resolve: {
      printReport: function () {chrome.setVisible(false); return true;},
      reportcfg: function (savedReports, $route, courier) {
        return savedReports.get($route.current.params.id)
          .catch(courier.redirectWhenMissing({
            'report': '/reports'
          }));
        // Please note that we are not catching Not-Allowed here as print
        // button won't be available to those who can't access the report
      },
      company_name: function () {return '';},
    },
    isNewReport: function () {
      return false;
    }
  });


uiModules
  .get('app/report', [
    'kibana/notify',
    'kibana/courier'
  ])
  .directive('reportApp', function () {
    return {
      restrict: 'E',
      controllerAs: 'reportApp',
      controller: reportAppEditor,
    };
  });

function reportAppEditor($scope, $route, Notifier, $routeParams, $location, Private, $http, AppState, courier, timefilter, kbnUrl) {

  const filterBar = Private(FilterBarQueryFilterProvider);

  const notify = new Notifier({
    location: 'Report'
  });

  // Set the landing page for alerts section
  $scope.landingPageUrl = () => `#${ReportConstants.LANDING_PAGE_PATH}`;
  $scope.forms = {};

  // Since vienna is in a iframe, we use the window.parent to
  // get the url in the browser.
  $scope.shipperAddress = window.parent.location.href;
  $scope.reportDate = new Date();
  let isNewReport = $route.current.locals.isNewReport;
  const loadedReportId = $route.current.locals.loadedReportId;
  const reportcfg = $scope.reportcfg = $route.current.locals.reportcfg;
  logUserOperation($http, 'GET', 'report', reportcfg.title, reportcfg.id);

  const allowedRoles = reportcfg.allowedRolesJSON ? JSON.parse(reportcfg.allowedRolesJSON) : [];

  let userRoleCanModify = false;

  // Get the RBAC stuff here...
  // For an admin used, we always show modify permissions during save..
  // const userRoleCanModify = false;
  if (chrome.isCurrentUserAdmin()) {
    userRoleCanModify = true;
  } else {
    // Set a flag whether the current user's role can modify this object
    userRoleCanModify = chrome.canCurrentUserModifyPermissions(allowedRoles);
  }

  // If user can modify the existing object or is allowed to create an object
  if(userRoleCanModify && chrome.canCurrentUserCreateObject()) {
    $scope.topNavMenu = [{
      key: 'save',
      description: 'Save Report',
      template: require('plugins/kibana/report/panels/save.html'),
      testId: 'reportSaveButton',
      disableButton() {
        return Boolean(!$scope.forms.reportcfgForm.$valid);
      },
    },
    {
      key: 'download',
      description: 'Download Report',
      testId: 'reportSaveButton',
      run: function () { $scope.downloadReport(); },
    }];
  } else {
    $scope.topNavMenu = [{
      key: 'download',
      description: 'Download Report',
      testId: 'reportSaveButton',
      run: function () { $scope.downloadReport(); }
    }];
  }

  // We will enable it when we integrate with backend: Bharat
  // when reports tab (/report/) is hit, company_name
  // is fetched from the api '/vuSmartMaps/api/1/'
  // else company name is fetched from the reportcfg
  // object stored.
  if($route.current.locals.company_name !== '') {
    $scope.company_name = $route.current.locals.company_name.enterprise_name;
  } else {
    $scope.company_name = $route.current.locals.reportcfg.company_name || '';
  }

  $scope.printReport = $route.current.locals.printReport;
  $scope.sections = [{ id: '', description: '', visuals: [] }];
  $scope.enable_scheduling = false;
  // Populate owner, if its available from the backend, use that,
  // otherwise use current user: Bharat
  $scope.owner = {};
  if (_.has(reportcfg.owner, 'name')) {
    $scope.owner = JSON.parse(reportcfg.owner);
  } else {
    const currentUser = chrome.getCurrentUser();
    $scope.owner.name = currentUser[0];
    $scope.owner.role = currentUser[1];
    $scope.owner.permission = currentUser[2];
  }

  if (reportcfg.timeTo && reportcfg.timeFrom) {
    timefilter.time.to = reportcfg.timeTo;
    timefilter.time.from = reportcfg.timeFrom;
  }

  $scope.$on('$destroy', reportcfg.destroy);

  const matchQueryFilter = function (filter) {
    return filter.query && filter.query.query_string && !filter.meta;
  };

  const extractQueryFromFilters = function (filters) {
    const filter = _.find(filters, matchQueryFilter);
    if (filter) return filter.query;
  };

  const stateDefaults = {
    title: reportcfg.title,
    panels: reportcfg.panelsJSON ? JSON.parse(reportcfg.panelsJSON) : [],
    options: reportcfg.optionsJSON ? JSON.parse(reportcfg.optionsJSON) : {},
    uiState: reportcfg.uiStateJSON ? JSON.parse(reportcfg.uiStateJSON) : {},
    query: extractQueryFromFilters(reportcfg.searchSource.getOwn('filter')) || { query_string: { query: '*' } },
    filters: _.reject(reportcfg.searchSource.getOwn('filter'), matchQueryFilter),
  };

  $scope.show_toolbar = false;
  $scope.show_searchbar = false;

  const $state = $scope.state = new AppState(stateDefaults);
  const $uiState = $scope.uiState = $state.makeStateful('uiState');
  $scope.sections = reportcfg.sectionJSON ? JSON.parse(reportcfg.sectionJSON) : [{ id: '', description: '', visuals: [] }];
  $scope.schedule = JSON.parse(reportcfg.schedule);

  if(_.has($scope.schedule, 'frequency')) {
    $scope.enable_scheduling = true;
  }

  if($scope.sections.length === 0)
  {
    $scope.sections.push({ id: '', description: '', visuals: [] });
  }
  $scope.$watchCollection('state.options', function (newVal, oldVal) {
    if (!angular.equals(newVal, oldVal)) $state.save();
  });

  // This function will be called when we change
  // the report scheduling options using the
  // select box in section 2
  $scope.updateTimeFilter = function () {
    if($scope.schedule.frequency === 'daily')
    {
      timefilter.time.to = 'now';
      timefilter.time.from = 'now-24h';
    }
    else if($scope.schedule.frequency === 'weekly')
    {
      timefilter.time.to = 'now';
      timefilter.time.from = 'now-7d';
    }
    else if($scope.schedule.frequency === 'monthly')
    {
      timefilter.time.to = 'now';
      timefilter.time.from = 'now-30d';
    }
  };

  $scope.refresh = _.bindKey(courier, 'fetch');

  timefilter.enabled = true;
  $scope.timefilter = timefilter;
  const timeDuration = timefilter.getBounds();
  $scope.timeDurationStart = timeDuration.min.valueOf();
  $scope.timeDurationEnd = timeDuration.max.valueOf();
  $scope.$listen(timefilter, 'fetch', $scope.refresh);
  const duration = moment.duration(timeDuration.max.diff(timeDuration.min));
  const timeDurationHours = duration.asHours();

  courier.setRootSearchSource(reportcfg.searchSource);

  function init() {
    updateQueryOnRootSource();

    const docTitle = Private(DocTitleProvider);
    if (reportcfg.id) {
      docTitle.change(reportcfg.title);
    }

    initPanelIndices();
    $scope.$emit('application.load');
  }

  function initPanelIndices() {
    // find the largest panelIndex in all the panels
    let maxIndex = getMaxPanelIndex();

    // ensure that all panels have a panelIndex
    $scope.state.panels.forEach(function (panel) {
      if (!panel.panelIndex) {
        panel.panelIndex = maxIndex++;
      }
    });
  }

  $scope.getReportTitle = function () {
    return reportcfg.title;
  };

  function getMaxPanelIndex() {
    let index = $scope.state.panels.reduce(function (idx, panel) {
      // if panel is missing an index, add one and increment the index
      return Math.max(idx, panel.panelIndex || idx);
    }, 0);
    return ++index;
  }

  function updateQueryOnRootSource() {
    const filters = filterBar.getFilters();
    if ($state.query) {
      reportcfg.searchSource.set('filter', _.union(filters, [{
        query: $state.query
      }]));
    } else {
      reportcfg.searchSource.set('filter', filters);
    }
  }

  // update root source when filters update
  $scope.$listen(filterBar, 'update', function () {
    updateQueryOnRootSource();
    $state.save();
  });

  // update data when filters fire fetch event
  $scope.$listen(filterBar, 'fetch', $scope.refresh);

  $scope.newReport = function () {
    kbnUrl.change('/report', {});
  };

  // This function is called when a user is adding a new section. It
  // adds an empty section into list of sections
  $scope.addSection = function () {
    $scope.sections.push({ id: '', description: '', visuals: [] });
    $scope.refresh();
  };

  // This function is called when a user removes an existing section.
  // Everything about the section is lost..
  $scope.removeSection = function (section) {
    $scope.sections = _.without($scope.sections, section);
  };

  // This function is called when a user clicks on add visualization.
  // Add visualization throws up a list of visualization available
  // to choose from but this function is called to set the current
  // section under which a visualization is to be added
  $scope.addVisToSection = function (section) {
    $scope.cur_section = section;
  };

  $scope.showVisForSection = function (section) {
    return $scope.cur_section === section;
  };

  $scope.closeVisForSection = function () {
    return $scope.cur_section = undefined;
  };

  // This function is called when a user deletes a visuzliation from
  // a section.
  $scope.removeVisFromSection = function (section, vis) {
    section.visuals = _.without(section.visuals, vis);
  };

  // This function is called when a user clicks on UP arrow icon to move
  // a visuzliation to the above place.
  $scope.moveVisUpInSection = function (section, vis) {
    const index = section.visuals.indexOf(vis);
    if (index === 0) {
      return;
    }
    const visUp = section.visuals[index - 1];
    section.visuals[index - 1] = vis;
    section.visuals[index] = visUp;
  };

  // This function is called when a user clicks on DOWN arrow icon to move
  // a visuzliation to the below place.
  $scope.moveVisDownInSection = function (section, vis) {
    const index = section.visuals.indexOf(vis);
    if (index === section.visuals.length - 1) {
      return;
    }
    const visDown = section.visuals[index + 1];
    section.visuals[index + 1] = vis;
    section.visuals[index] = visDown;
  };

  // This will be used to populate the shipper url in the report
  if($scope.printReport === true) {

    // We get shipperUrl
    $scope.shipperAddress = chrome.getShipperUrl();
    // We will enable above once we get backend integration done: Bharat

    // This is to remove some classes and add ones required for making the
    // report printable
    $('#globalChromeContent').removeClass('content-normal');
    $('#globalChromeContent').addClass('content-report');
    $('#globalAppWrapper').removeClass('app-wrapper-normal');
    $('#globalAppWrapper').addClass('app-wrapper-report');
  }

  // This function is called to print a report. Backend returns the pdf
  // report
  $scope.downloadReport = function () {
    $scope.kbnTopNav.close('download');
    $scope.reportDate = new Date();
    const url = reportcfg.id;

    // Get current user
    const currentUser = chrome.getCurrentUser();
    const tenantBu = chrome.getTenantBu();

    const httpResult = $http({
      method: 'POST',
      url: '/vienna_print_report/',
      data: { reportName: url,
        timeDuration: timeDurationHours,
        username: currentUser[0],
        userRole: currentUser[1],
        permissions: currentUser[2],
        tenantId: tenantBu[0],
        buId: tenantBu[1],
        shipperUrl: $scope.shipperAddress
      },
      responseType: 'blob'
    })
      .then(resp => resp.data)
      .catch(resp => { throw resp.data; });

    httpResult
      .then(function (resp) {
        const blob = new Blob([resp], { type: 'application/pdf' });
        const fileName = reportcfg.title + '.pdf';
        saveAs(blob, fileName);
      }).catch(function () {
        notify.error('Unable to print the report');
      });
  };

  $scope.filterResults = function () {
    updateQueryOnRootSource();
    $state.save();
    $scope.refresh();
  };

  // Disable global timer in vienna when the
  // report scheduling is checked and
  // Initialise the schedule object
  $scope.handleChangeInReportType = function (enableScheduling) {
    $scope.enable_scheduling = enableScheduling;
    if($scope.enable_scheduling) {
      $scope.schedule = { 'frequency': 'daily', 'recipients': '' };
    } else {
      $scope.schedule = {};
    }
  };

  function saveReport(reportcfg) {
    $state.save();
    reportcfg.sectionJSON = angular.toJson($scope.sections);
    reportcfg.panelsJSON = angular.toJson($state.panels);
    reportcfg.uiStateJSON = angular.toJson($uiState.getChanges());

    // We will enable this with RBAC support: Bharat
    reportcfg.allowedRolesJSON = angular.toJson($scope.opts.allowedRoles);
    reportcfg.timeFrom = timefilter.time.from;
    reportcfg.timeTo = timefilter.time.to;
    reportcfg.optionsJSON = angular.toJson($state.options);
    reportcfg.schedule = angular.toJson($scope.schedule);
    reportcfg.company_name = $scope.company_name;

    // collect the report owner details, his role and permissions.
    // If owners name is not populated. It is a new report.
    // Collect owner details.
    if (!_.has(reportcfg.owner, 'name')) {
      reportcfg.owner = angular.toJson($scope.owner);
    }
    // if a report is loaded and saved as another
    // report, It is a new report. Hence set the flag to true.
    if(loadedReportId !== reportcfg.id) {
      isNewReport = true;
    }

    reportcfg.save(isNewReport)
      .then(function (id) {
        reportcfg.id = id;
        $scope.kbnTopNav.close('save');
        if (id) {
          if (reportcfg.id !== $routeParams.id) {
            kbnUrl.change('/report/{{id}}', { id: reportcfg.id });
          }
          logUserOperation($http, 'POST', 'report', reportcfg.title, reportcfg.id);
        }
      })
      .catch(notify.fatal);
  }

  $scope.save = function () {
    // Notify the user if report scheduling is enabled.
    // Once user confirms set the global time picker to
    // the scheduled time selected.
    if($scope.enable_scheduling === true) {
      const confirmSaveOperation = confirm('You have enabled scheduling to generate this report '
            + $scope.schedule.frequency + ' .The time selection will be updated accordingly. Please'
            + ' click \'OK\' to proceed.');

      // If user clicks 'OK' for the confirm box
      // update the global time picker.
      if (confirmSaveOperation === true) {
        $scope.updateTimeFilter();
      } else {
        return;
      }
    }
    $state.title = reportcfg.title;
    saveReport(reportcfg);
  };

  let pendingVis = _.size($state.panels);
  $scope.$on('ready:vis', function () {
    if (pendingVis) pendingVis--;
    if (pendingVis === 0) {
      $state.save();
      $scope.refresh();
    }
  });

  // listen for notifications from the grid component that changes have
  // been made, rather than watching the panels deeply
  $scope.$on('change:vis', function () {
    $state.save();
  });

  // called by the saved-object-finder when a user clicks a vis
  $scope.addVis = function (hit) {
    $scope.cur_section.visuals.push({ id: hit.id, title: hit.title, type: 'visualization' });
  };

  // called by the saved-object-finder when a user clicks a vis
  $scope.addSearch = function (hit) {
    $scope.cur_section.visuals.push({ id: hit.id, title: hit.title, type: 'search' });
  };

  // Show the reportcfgboard operational butttons on clicking the show toolbar button
  $scope.toggleToolbar = function () {
    $scope.show_toolbar = !$scope.show_toolbar;
  };

  // Expand search bar and close it on clicking the search button
  $scope.showSearchbar = function () {
    $scope.show_searchbar = !$scope.show_searchbar;
  };

  // if a search query exists. Do not collapse the
  // searchbar. Need not check for $scope.state.query as
  //$scope.state.query.query_string.query always exists
  if ($scope.state.query.query_string.query !== '*') {
    $scope.show_searchbar = true;
  }

  // Setup configurable values for config directive, after objects are initialized
  $scope.opts = {
    reportcfg: reportcfg,
    ui: $state.options,
    allowedRoles: allowedRoles,
    userRoleCanModify: userRoleCanModify,
    save: $scope.save,
    addVis: $scope.addVis,
    addSearch: $scope.addSearch,
  };

  init();
}
