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
import 'angular-cron-jobs';
import 'angular-cron-jobs/src/angular-cron-jobs.less';

import moment from 'moment';
import { DocTitleProvider } from 'ui/doc_title';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { getTenantData } from 'ui/utils/vunet_tenant_data';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import { ReportConstants, createReportEditUrl, createReportPrintUrl } from './report_constants';
import { logUserOperation } from 'plugins/kibana/log_user_operation';
import { migrateLegacyQuery } from 'ui/utils/migrateLegacyQuery';
import { updateVunetObjectOperation } from 'ui/utils/vunet_object_operation';
import { getTenantEmailGroups } from 'ui/utils/vunet_tenant_email_groups';
import { getValueToStoreInKibana, getSavedObject } from 'ui/utils/kibana_object.js';
import { VunetSidebarConstants } from 'ui/chrome/directives/vunet_sidebar_constants';

require('ui/directives/searchable_multiselect.js');

uiRoutes
  .when(ReportConstants.CREATE_PATH, {
    template: require('plugins/kibana/report/report.html'),
    resolve: {
      printReport: function () { return false; },
      reportcfg: function (savedReports) {
        return savedReports.get();
      },
      company_name: function ($http, chrome) {
        return getTenantData($http, chrome);
      },
      // Fetch all the email groups for the tenants
      email_groups: function ($http, chrome) {
        return getTenantEmailGroups($http, chrome);
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
      printReport: function () { return false; },
      reportcfg: function (savedReports, $route, courier) {
        return savedReports.get($route.current.params.id)
          .catch(courier.redirectWhenMissing({
            'report': ReportConstants.LANDING_PAGE_PATH
          }));
      },
      company_name: function () { return ''; },
      isNewReport: function () {
        return false;
      },
      loadedReportId: function ($route) {
        return $route.current.params.id;
      },
      // Fetch all the email groups for the tenants
      email_groups: function ($http, chrome) {
        return getTenantEmailGroups($http, chrome);
      },
    }
  })
  .when(createReportPrintUrl(':id'), {
    template: require('plugins/kibana/report/report.html'),
    resolve: {
      printReport: function () { chrome.setVisible(false); return true; },
      reportcfg: function (savedReports, $route, courier) {
        return savedReports.get($route.current.params.id)
          .then(function (report) {
            return report;
          })
          .catch(courier.redirectWhenMissing({
            'report': '/reports'
          }));
        // Please note that we are not catching Not-Allowed here as print
        // button won't be available to those who can't access the report
      },
      company_name: function () { return ''; },
      isNewReport: function () {
        return false;
      },
      loadedReportId: function ($route) {
        return $route.current.params.id;
      },
    },
  });


uiModules
  .get('app/report', [
    'kibana/notify',
    'kibana/courier',
    'angular-cron-jobs',
    'kibana/config'
  ])
  .directive('reportApp', function () {
    return {
      restrict: 'E',
      controllerAs: 'reportApp',
      controller: reportAppEditor,
    };
  });

function reportAppEditor($scope, $route, Notifier, $routeParams, $location, Private, $http, AppState, courier,
  timefilter, kbnUrl, config, $rootScope, StateService) {

  const filterBar = Private(FilterBarQueryFilterProvider);

  const notify = new Notifier({
    location: 'Report'
  });

  // Configuration for 'cronSelection' directive to
  // allow multiple selection in a select box.
  $scope.cronConfig = {
    allowMultiple: true
  };

  $scope.reportFormats = ['pdf', 'csv'];

  // Fetch all the dashbords for the logged in user and
  // populate in the dashboard link list
  Promise.resolve(getSavedObject('dashboard', ['title', 'allowedRolesJSON'], 10000, Private))
    .then(function (response) {
      $scope.dashboardList = response;
      // If the user doesn't want to use the dashboard link in the report then
      // they can choose None.
      $scope.dashboardList.unshift({ id: 'None', title: 'None', allowedRolesJSON: [] });
    });

  // Initialization of the height for report page conatiner. Set timeout has been used so the the topbar is formed before the caculations
  setTimeout(function () {
    const kuiLocalNavHeight = $('.kuiLocalNav').height();
    const topbarHeight = $('.topbar-container').height();
    const heightToSet = $(window).height() - topbarHeight - kuiLocalNavHeight;
    $('.report-body-container').height(heightToSet);
  }, 10);

  // Set the landing page for alerts section
  $scope.landingPageUrl = () => `#${ReportConstants.LANDING_PAGE_PATH}`;
  $scope.forms = {};

  $scope.selectEmailGroupList = [];

  // Since vienna is in a iframe, we use the window.parent to
  // get the url in the browser.
  $scope.shipperAddress = window.parent.location.href;
  $scope.reportDate = new Date();
  let isNewReport = $route.current.locals.isNewReport;
  const loadedReportId = $route.current.locals.loadedReportId;
  const reportcfg = $scope.reportcfg = $route.current.locals.reportcfg;
  logUserOperation($http, 'GET', 'report', reportcfg.title, reportcfg.id);

  const allowedRoles = reportcfg.allowedRolesJSON ? JSON.parse(reportcfg.allowedRolesJSON) : [];

  let isScheduleInvalid = false;

  // Object to store the user selected values
  // in report scheduling
  $scope.cronObj = {};
  $scope.enable_scheduling = false;
  $scope.disalbeReportFormat = false;
  $scope.recipientsList = [];

  // Is scheduling enabled... Used by time restore during report save
  $scope.isScheduleEnabled = function () {
    return $scope.enable_scheduling;
  };

  // Check if report scheduling configuration
  // exists and load them else we initialize it
  // to empty.
  if (reportcfg.scheduleFrequency !== '') {
    $scope.cronObj.value = reportcfg.scheduleFrequency;
    $scope.enable_scheduling = true;
  } else {
    $scope.cronObj.value = '';
  }

  // This function is called to disable input elements if the user
  // doesn't have permission to create things
  $scope.disableInputElements = false;
  if (!chrome.canManageObject()) {
    $scope.disableInputElements = true;
  }

  const reportEmailBody = reportcfg.reportEmailBody;
  $scope.opts = { reportEmailBody: reportEmailBody };
  const reportFormat = reportcfg.reportFormat;
  const reportDashboardLink = reportcfg.reportDashboardLink;
  // Load the recipients information in the UI.
  $scope.recipientsData = [];

  if (reportcfg.recipientsList) {
    $scope.recipientsData = JSON.parse(reportcfg.recipientsList);
    for (let index = 0; index < $scope.recipientsData.length; index++) {
      if ($scope.recipientsData[index].selectEmailGroupList === undefined || $scope.recipientsData[index].selectEmailGroupList === '') {
        $scope.recipientsData[index].selectEmailGroupList = [];
      }
      else {
        // Here the emailgroups will contain only name as following.
        // emailgroups = admin, dba, network
        // To populate in the multiselect directive the format should be as following
        // emailgroup = [{"name":"admin", "name":"dba"}]
        // So we need to build a dictionary from the input
        const emailGroups = $scope.recipientsData[index].selectEmailGroupList.split(',');
        const emailGroup = [];
        for (let index = 0; index < emailGroups.length; index++) {
          emailGroup.push({ name: emailGroups[index] });
        }
        $scope.recipientsData[index].selectEmailGroupList = emailGroup;
      }
    }
  }
  // If data exists in the back end populate the UI
  // with it else create a new object.
  if ($scope.recipientsData.length &&
    $scope.recipientsData[0].role !== '') {
    const currentUser = chrome.getCurrentUser();

    // Display the recipient configurations
    $scope.recipientsList = $scope.recipientsData;
  }
  $scope.printReport = $route.current.locals.printReport;

  // Store $route.current.locals.printReport value in rootScope
  // to access in outside of controller.
  $rootScope.printReport = $route.current.locals.printReport;

  if ($scope.printReport !== true) {

    $scope.allEmailGroups = $route.current.locals.email_groups.attributes;

    // Get all the user groups configured
    const postCall = $http({
      method: 'GET',
      url: chrome.getUrlBase() + '/user_groups/'
    })
      .then(resp => resp.data)
      .catch(resp => {
        throw resp.data;
      });

    postCall.then(function (data) {
      $scope.userGroups = [];
      // Get the current logged in user role
      const currentUser = chrome.getCurrentUser();

      // Display only those user groups with ViewObject permissions
      // All ManageObject user roles will also have Viewobject permissions in them.
      $scope.userGroups = data.user_groups.filter(role => role.permissions.indexOf('ViewObject') >= 0);
    }).catch(function () {
      $scope.userGroups = [];
      notify.error('Failed to find user roles');
    });
  }
  // we need a list of recipients in this format
  // ['obj1', 'obj2', obj3']
  // To achive this we are initialising dataObj to
  // {role: '', recipients: ''} every time this function
  // is called so that we can push the user selected object
  // into the list.
  $scope.addRecipients = function () {
    const dataObj = { role: '', recipients: '', selectEmailGroupList: [] };
    $scope.recipientsList.push(dataObj);
    isScheduleInvalid = false;
  };

  // To delete a recipient
  $scope.removeRecipients = function (index) {
    $scope.recipientsList.splice(index, 1);
    // When no recipient is added but check box is checked
    // make isScheduleInvalid = true so that save button is disabled
    if (!$scope.recipientsList.length && $scope.enable_scheduling) {
      isScheduleInvalid = true;
    }
  };

  // Reset the schedule frequency when enable scheduling
  // is unchecked.
  $scope.toggleEnableSchedule = function () {
    $scope.enable_scheduling = !$scope.enable_scheduling;
    if (!$scope.enable_scheduling) {
      $scope.cronObj.value = '';
      isScheduleInvalid = false;
    }
    else {
      // The default value to be shown to the user
      $scope.cronObj.value = '* * * * *';
    }
  };

  // Set whether the current logged in user be allowed to create a new
  // object or not
  $scope.creation_allowed = false;
  if (chrome.canManageObject()) {
    $scope.creation_allowed = true;
  }

  let userRoleCanModify = false;

  // Set a flag whether the current user's role can modify this object
  userRoleCanModify = chrome.canCurrentUserModifyPermissions(allowedRoles);

  // If user can modify the existing object or is allowed to create an object
  if (userRoleCanModify && chrome.canManageObject()) {
    $scope.topNavMenu = [{
      key: 'save',
      description: 'Save Report',
      template: require('plugins/kibana/report/panels/save.html'),
      testId: 'reportSaveButton'
      //disableButton() {
      //  return Boolean(isScheduleInvalid || !$scope.forms.reportcfgForm.$valid);
      //},
    },
    {
      key: 'download',
      description: 'Download Report',
      testId: 'reportDownloadButton',
      run: function () { $scope.downloadReport(); },
      disableButton() {
        return Boolean(!reportcfg.id);
      },
    },
    {
      key: 'email',
      description: 'Email Report',
      testId: 'reportEmailButton',
      run: function () { $scope.emailReport(); }
      //disableButton() {
      //  return Boolean(!$scope.forms.reportcfgForm.$valid);
      //}
    }];
  } else {
    $scope.topNavMenu = [{
      key: 'download',
      description: 'Download Report',
      testId: 'reportDownloadButton',
      run: function () { $scope.downloadReport(); },
      disableButton() {
        return Boolean(!reportcfg.id);
      },
    },
    {
      key: 'email',
      description: 'Email Report',
      testId: 'reportEmailButton',
      run: function () { $scope.emailReport(); },
      disableButton() {
        return Boolean(!$scope.forms.reportcfgForm.$valid);
      },
    }];
  }

  // We will enable it when we integrate with backend: Bharat
  // when reports tab (/report/) is hit, company_name
  // is fetched from the api '/vuSmartMaps/api/1/'
  // else company name is fetched from the reportcfg
  // object stored.
  if ($route.current.locals.company_name !== '') {
    $scope.company_name = $route.current.locals.company_name.enterprise_name;
  } else {
    $scope.company_name = $route.current.locals.reportcfg.company_name || '';
  }


  $scope.sections = [{ id: '', description: '', visuals: [] }];

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

  // Let us set the global time selector based on the time we had saved in
  // the report
  if (!$scope.printReport && reportcfg.timeTo && reportcfg.timeFrom) {
    // If the report is saved with 'absolute' mode prepare a moment object
    // for 'from' and 'to' time values and save it in timefilter.
    if (reportcfg.timeTo.startsWith('now')) {
      timefilter.time.to = reportcfg.timeTo;
      timefilter.time.from = reportcfg.timeFrom;
      timefilter.time.mode = 'quick';
    } else {
      timefilter.time.mode = 'absolute';
      timefilter.time.to = moment(reportcfg.timeTo);
      timefilter.time.from = moment(reportcfg.timeFrom);
    }

  }
  $scope.$on('$destroy', reportcfg.destroy);

  const matchQueryFilter = function (filter) {
    return filter.query && filter.query.query_string && !filter.meta;
  };

  const getQuery = function () {
    if (!_.isUndefined(reportcfg.searchSource.getOwn('query'))) {
      return migrateLegacyQuery(reportcfg.searchSource.getOwn('query'));
    }
  };

  const stateDefaults = {
    title: reportcfg.title,
    panels: reportcfg.panelsJSON ? JSON.parse(reportcfg.panelsJSON) : [],
    options: reportcfg.optionsJSON ? JSON.parse(reportcfg.optionsJSON) : {},
    uiState: reportcfg.uiStateJSON ? JSON.parse(reportcfg.uiStateJSON) : {},
    query: getQuery() || { query: '', language: config.get('search:queryLanguage') },
    filters: _.reject(reportcfg.searchSource.getOwn('filter'), matchQueryFilter),
  };

  $scope.show_toolbar = false;

  const $state = $scope.state = new AppState(stateDefaults);
  const $uiState = $scope.uiState = $state.makeStateful('uiState');
  $scope.sections = reportcfg.sectionJSON ? JSON.parse(reportcfg.sectionJSON) : [{ id: '', description: '', visuals: [] }];



  if ($scope.sections.length === 0) {
    $scope.sections.push({ id: '', description: '', visuals: [] });
  }
  $scope.$watchCollection('state.options', function (newVal, oldVal) {
    if (!angular.equals(newVal, oldVal)) $state.save();
  });

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
    // update model.query to $scope
    if ($state.query) {
      $scope.model = {
        query: $state.query
      };
    } else {
      // default query
      $scope.model = {
        query: { language: config.get('search:queryLanguage') }
      };
    }

    updateQueryOnRootSource();

    const docTitle = Private(DocTitleProvider);

    // Always display doc title as 'Reports'
    // if (reportcfg.id) {
    //   docTitle.change(reportcfg.title);
    // }
    docTitle.change(VunetSidebarConstants.REPORTS);

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

  // Update the filters and query to the searchSource
  function updateQueryOnRootSource(query) {

    let filters = filterBar.getFilters();

    // If search_string is available, create the query and add it to the filters
    const searchString = chrome.getSearchString();

    if (searchString !== '') {
      filters = _.union(filters, [{
        query: {
          query_string: {
            query: searchString,
            analyze_wildcard: true
          }
        }
      }]);
    }

    // update the filters to the searchSource
    reportcfg.searchSource.set('filter', filters);

    // update the query to searchSource.
    if (query) {
      reportcfg.searchSource.set('query', query);
    }

    $scope.refresh();
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
    showReportFormat();
    $scope.refresh();
  };

  // This function is called when a user removes an existing section.
  // Everything about the section is lost..
  $scope.removeSection = function (section) {
    $scope.sections = _.without($scope.sections, section);
    showReportFormat();
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
    showReportFormat();
  };

  // This function is called when a user clicks on UP arrow icon to move
  // a visualization to the above place.
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
  // a visualization to the below place.
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
  if ($scope.printReport === true) {

    // We get shipperUrl
    $scope.shipperAddress = 'https://127.0.0.1/app/vienna';

    // Prepare $scope.shipperAddressUrl by taking some part of $scope.shipperAddress
    // This is to redirect when user clicks on url in the pdf file.
    //const shipperUrl = $scope.shipperAddress.split('/');
    $scope.shipperAddressUrl = 'https://127.0.0.1/app/vienna';

    // We will enable above once we get backend integration done: Bharat

    // This is to remove some classes and add ones required for making the
    // report printable
    $('#globalChromeContent').removeClass('content-normal');
    $('#globalChromeContent').addClass('content-report');
    $('#globalAppWrapper').removeClass('app-wrapper-normal');
    $('#globalAppWrapper').addClass('app-wrapper-report');
  }

  // This function is used to prepare the query parameters
  // for the url to generate reports.
  const getQueryParamsForReportUrl = function () {
    let fromTime = '';
    let toTime = '';
    let mode = '';

    // If 'absoulute' mode is selected in time filter
    // we prepare the 'from' and 'to' time in the format:
    // 'DD-MMM-YYYY HH:mm:ss'
    if (timefilter.time.mode === 'absolute') {
      mode = 'quick';
      fromTime = moment.unix(timefilter.time.from / 1000).format('DD-MMM-YYYY HH:mm:ss');
      toTime = moment.unix(timefilter.time.to / 1000).format('DD-MMM-YYYY HH:mm:ss');
    } else {
      mode = timefilter.time.mode;
      fromTime = timefilter.time.from;
      toTime = timefilter.time.to;
    }


    const queryParams = '?_g=(time:(from:\'' + fromTime + '\',mode:' + mode + ',to:\'' + toTime + '\'))';
    return queryParams;
  };

  // This function is called to email report to recipients configured.
  $scope.emailReport = function () {

    // To notify user that things will happen, we throw a confirm modal
    const option = confirm('Report will be generated and sent to the configured email ids. Press Ok to continue?');


    // If user pressed ok, we send a request to backend
    if (option) {

      let url = chrome.getUrlBase();
      url = url + '/reports/' + reportcfg.id + '/?action=email';
      const queryParams = getQueryParamsForReportUrl();

      const data = { 'url_query': queryParams };

      const posting = $http({
        method: 'POST',
        url: url,
        data: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      posting
        .then(function () {
          // Nothing to be done..
        })
        .catch(function () {
          notify.error('Unable to email the report');
        });
    }
  };


  // This function is called to print a report. Backend returns the pdf report
  $scope.downloadReport = function () {

    if ($scope.opts.reportFormat === 'csv') {
      const queryParams = getQueryParamsForReportUrl();
      const data = { 'url_query': queryParams };
      StateService.downloadCSVReport(reportcfg.id, 'download', data)
        .then (function () {
        })
        .catch(function () {
          notify.error('Unable to download the csv report');
        });
    }
    else if ($scope.opts.reportFormat === 'pdf') {
      $scope.kbnTopNav.close('download');
      $scope.reportDate = new Date();
      let url = reportcfg.id;
      // Check whether any dashboard is added to the report.
      // Send this argument to phantomjs. Because based on this argument, we are
      // calculating the waiting time and page size for the dashboard.
      $scope.isDashboardUsed = 'false';
      $scope.sections.forEach(function (sec) {
        sec.visuals.forEach(function (vis) {
          if (vis.visType === 'dashboard') {
            $scope.isDashboardUsed = 'true';
            return;
          }
        });
      });


      // Get query parameters for downloading report.
      const queryParams = getQueryParamsForReportUrl();

      url = url + queryParams;

      // Get current user
      const currentUser = chrome.getCurrentUser();
      const tenantBu = chrome.getTenantBu();
      const searchString = chrome.getSearchString();

      const httpResult = $http({
        method: 'POST',
        url: '/vienna_print_report/',
        data: {
          reportName: url,
          timeDuration: timeDurationHours,
          username: currentUser[0],
          userRole: currentUser[1],
          permissions: currentUser[2],
          tenantId: tenantBu[0],
          buId: tenantBu[1],
          shipperUrl: $scope.shipperAddress,
          searchString: searchString,
          isDashboardUsed: $scope.isDashboardUsed
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
    }
  };

  function saveReport(reportcfg) {
    const permissionsDict = {};
    let permissionsFlag = true;

    $state.save();
    let recipientsList = [];

    // If there exists a user group in recipient list, then it should have atleast
    // view permissions for the report
    angular.forEach($scope.opts.allowedRoles, function (roleObj) {
      permissionsDict[roleObj.name] = roleObj.permission;
    });

    angular.forEach($scope.recipientsList, function (recipient) {
      if (permissionsDict[recipient.role] === undefined || permissionsDict[recipient.role] === '') {
        permissionsFlag = false;
      }
    });

    if (!permissionsFlag) {
      alert('All the roles in the recipent list must have atleast view permission of the report');
      return;
    }

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
    reportcfg.scheduleFrequency = $scope.cronObj.value;
    reportcfg.reportEmailBody = $scope.opts.reportEmailBody;
    reportcfg.reportFormat = $scope.opts.reportFormat;
    reportcfg.reportDashboardLink = $scope.opts.reportDashboardLink;
    // Take a copy of recipientslist and assign to a new variable.
    // In the report object, save only the name of the email groups
    // with comma separated string not in dictionary format.
    recipientsList = JSON.parse(JSON.stringify($scope.recipientsList));
    _.each(recipientsList, function (recipient) {
      const selectEmailGroupList = recipient.selectEmailGroupList;
      recipient.selectEmailGroupList = getValueToStoreInKibana(selectEmailGroupList, 'name');
    });
    if (recipientsList.length && recipientsList[0].role === '') {
      // Use only the configured recipients. If the role of first
      // recipient is empty then skip the first 'recipient' object.
      reportcfg.recipientsList = angular.toJson(recipientsList.slice(0, 1));
    } else {
      reportcfg.recipientsList = angular.toJson(recipientsList);
    }
    // collect the report owner details, his role and permissions.
    // If owners name is not populated. It is a new report.
    // Collect owner details.
    if (!_.has(reportcfg.owner, 'name')) {
      reportcfg.owner = angular.toJson($scope.owner);
    }
    // if a report is loaded and saved as another
    // report, It is a new report. Hence set the flag to true.
    if (loadedReportId !== reportcfg.id) {
      isNewReport = true;
    }

    reportcfg.save(isNewReport)
      .then(function (id) {
        reportcfg.id = id;
        $scope.kbnTopNav.close('save');
        if (id) {
          notify.info(`Saved Report as "${reportcfg.title}"`);
          // Update the backend for this object's operation
          updateVunetObjectOperation([reportcfg], 'report', $http, 'modify', chrome);

          if (reportcfg.id !== $routeParams.id) {
            kbnUrl.change('/report/{{id}}', { id: reportcfg.id });
          }

          // Log the user operation
          logUserOperation($http, 'POST', 'report', reportcfg.title, reportcfg.id);
        }
      })
      .catch(notify.fatal);
  }

  $scope.save = function () {
    if (reportcfg.title === 'Home') {
      // We can't allow anyone to save a Home Report so inform the user
      // about it
      //
      // There is some problem here... when we return first time,
      // things work fine but if a user press save with 'Home' again,
      // we end up throwing an error.. Can't find where the error is
      // coming from... need to look at this later..
      alert('You cannot create a report with name "Home". Please use a different name');
    } else {
      $state.title = reportcfg.title;
      saveReport(reportcfg);
    }
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
    $scope.cur_section.visuals.push({ id: hit.id, title: hit.title, visType: hit.type.name, type: 'visualization' });
    showReportFormat();
  };

  // called by the saved-object-finder when a user clicks a dashboard
  $scope.addDashboard = function (hit) {
    $scope.cur_section.visuals.push({ id: hit.id, title: hit.title, visType: 'dashboard', type: 'dashboard' });
    showReportFormat();
  };

  // Show report formats based on the vis type added to the section.
  function showReportFormat() {
    $scope.disalbeReportFormat = false;
    $scope.sections.forEach(function (sec) {
      sec.visuals.forEach(function (vis) {
        // if more than 1 section is addded or more than 1 viz is added or
        // the viz is not data table or search then show only pdf format.
        if ($scope.sections.length > 1 || sec.visuals.length > 1 || (vis.visType !== 'table' && vis.visType !== 'search')) {
          //$scope.reportFormats = ['pdf'];
          $scope.disalbeReportFormat = true;
          $scope.opts.reportFormat = 'pdf';
          return;
        }
      });
    });
  }

  // called by the saved-object-finder when a user clicks a vis
  $scope.addSearch = function (hit) {
    $scope.cur_section.visuals.push({ id: hit.id, title: hit.title, visType: 'search', type: 'search' });
    showReportFormat();
  };

  // Function called when the search query is added in search bar in the UI
  $scope.updateQueryAndFetch = function (query) {
    $scope.model.query = migrateLegacyQuery(query);
    updateQueryOnRootSource(query);
  };

  // Setup configurable values for config directive, after objects are initialized
  $scope.opts = {
    reportcfg: reportcfg,
    ui: $state.options,
    allowedRoles: allowedRoles,
    userRoleCanModify: userRoleCanModify,
    save: $scope.save,
    addVis: $scope.addVis,
    addDashboard: $scope.addDashboard,
    addSearch: $scope.addSearch,
    owner: $scope.owner,
    reportEmailBody: reportEmailBody,
    reportFormat: reportFormat,
    reportDashboardLink: reportDashboardLink
  };

  // Adds selected email group to the list
  $scope.addEmailGroup = function (item, itemIndex) {
    // item = item {"name":"admin"}
    // itemIndex is the index of the recipients list
    // To populate in the multiselect directive the format should be as following
    // item = {"name":"admin"}
    $scope.recipientsList[itemIndex].selectEmailGroupList.push({ name: item.name });
  };

  // Removes the selected email group from the list
  $scope.removeEmailGroup = function (index, itemIndex) {
    // itemIndex is the index of the recipients list
    // index is the index of the selected item in the selectEmailGroupList
    $scope.recipientsList[itemIndex].selectEmailGroupList.splice(index, 1);
  };
  showReportFormat();
  init();
}
