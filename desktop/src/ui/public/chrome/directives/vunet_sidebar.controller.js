import chrome from 'ui/chrome';
import { VunetSidebarConstants } from './vunet_sidebar_constants';

/* global $ */
class sidebarController {
  constructor($scope, $rootScope) {

    //This is a dictionary which maps the sidebar elements to the correspoding claim.
    //A user can view a particular sidebar tab only if he has the correspoding claim next to the tab.
    const sideBarTabsClaim = {
      [VunetSidebarConstants.ANALYTICS]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.STORYBOARDS]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.DASHBOARDS]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.SEARCH]: ['ManageObject'],
      [VunetSidebarConstants.EVENTS]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.REPORTS]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.ANALYTICS_CONFIGURATIONS]: ['ViewObject', 'ManageObject', 'ManageDataSources'],
      [VunetSidebarConstants.VISUALIZATIONS]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.ALERT_RULES]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.ANOMALY_DETECTION]: ['ViewObject', 'ManageObject'],
      [VunetSidebarConstants.MANAGE_RESOURCES]: ['ManageObject', 'ManageDataSources'],
      [VunetSidebarConstants.NETWORK_CONFIGURATION]: ['ManageDataSources'],
      [VunetSidebarConstants.DATA]: ['ManageDataSources', 'ManageDataEnrichment'],
      [VunetSidebarConstants.SOURCES]: ['ManageDataSources'],
      [VunetSidebarConstants.VUBLOCK]: [''],
      [VunetSidebarConstants.ENRICH]: ['ManageDataEnrichment'],
      [VunetSidebarConstants.DATA_STORE]: ['ManageDataSettings', 'ManageFiles'],
      [VunetSidebarConstants.STORAGE]: ['ManageDataSettings'],
      [VunetSidebarConstants.FILES]: ['ManageFiles'],
      [VunetSidebarConstants.DATA_RETENTION_SETTINGS]: ['ManageDataSettings'],
      [VunetSidebarConstants.SETTINGS]:
      ['ViewObject', 'ManageObject', 'ManageDataSources', 'ManageDataEnrichment',
        'ManageDataSettings', 'ManageFiles', 'ManagePrefrences', 'ManageUsers', 'ManageLicense'],
      [VunetSidebarConstants.PREFERENCES]: ['ManagePreferences'],
      [VunetSidebarConstants.DEFINITIONS]: ['ManageDataSources'],
      [VunetSidebarConstants.USER]: ['ManageUsers'],
      [VunetSidebarConstants.ABOUT]:
      ['ViewObject', 'ManageObject', 'ManageDataSources', 'ManageDataEnrichment', 'ManageDataSettings', 'ManageFiles',
        'ManagePrefrences', 'ManageUsers', 'ManageLicense', 'ManageAgent', 'DataFetchAPIs', 'ManageDiagnostic'],
      [VunetSidebarConstants.IMAGEMANAGR]: ['ManageFiles'],
      [VunetSidebarConstants.BACKUP]: ['ManageDataSettings']
    };

    // By default we have side bar open..
    $rootScope.isSideBarOpen = true;
    const baseUrl = '/app/vienna#';
    const berlinUrl = '/berlin/';
    $scope.data = [];

    // For clearing the active sublevel
    $scope.clearActive = function () {
      $scope.data.forEach(data => {
        $scope.subgroups = data.subgroups;
        $scope.subgroups.forEach(subgroup => {
          subgroup.active = false;
        });
      });
    };

    // For clearing the active first level
    $scope.clearParentActive = function () {
      $scope.data.forEach(data => {
        data.active = false;
      });
    };

    //To highlight the parent ul in sidebar
    $scope.parentHighlighSidebar = function () {
      $scope.data.forEach(data => {
        $scope.subgroups = data.subgroups;
        $scope.subgroups.forEach(subgroup => {
          if (subgroup.active === true) {
            data.active = true;
          }
        });
      });
    };

    //Data to feed to sidebar
    $scope.updateData = function () {
      $scope.data = [
        {
          id: VunetSidebarConstants.ANALYTICS,
          description: 'tooltip ',
          icon: 'icon-Analytics',
          pageurl: 'URL',
          active: false,
          subgroups: [
            { id: VunetSidebarConstants.STORYBOARDS,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/storyboards',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.STORYBOARDS]),
              active: false
            },
            { id: VunetSidebarConstants.SEARCH,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/discover',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.SEARCH]),
              active: false
            },
            { id: VunetSidebarConstants.EVENTS,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/event',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.EVENTS]),
              active: false },
            { id: VunetSidebarConstants.REPORTS,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/reports',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.REPORTS]),
              active: false
            },
          ],
          isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.ANALYTICS])
        },
        {
          id: VunetSidebarConstants.ANALYTICS_CONFIGURATIONS,
          description: ' ',
          icon: 'icon-Network',
          pageurl: '',
          active: false,
          subgroups: [
            { id: VunetSidebarConstants.VISUALIZATIONS,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/visualize',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.VISUALIZATIONS]),
              active: false
            },
            { id: VunetSidebarConstants.DASHBOARDS,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/dashboards',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.DASHBOARDS]),
              active: false
            },
            { id: 'Alert Rules',
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/alerts',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.ALERT_RULES]),
              active: false
            },
            {
              id: VunetSidebarConstants.ANOMALY_DETECTION,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/anomalys',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.ANOMALY_DETECTION]),
              active: false
            },
            // { id: 'Manage ML Rules', description: ' ', icon: '', pageurl: '' },
            // { id: 'Manage Automated insights Rules', description: ' ', icon: '', pageurl: '' },
            {
              id: VunetSidebarConstants.MANAGE_RESOURCES,
              description: ' ',
              icon: '',
              pageurl: baseUrl + '/management',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.MANAGE_RESOURCES]),
              active: false
            },
            {
              id: VunetSidebarConstants.NETWORK_CONFIGURATION,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'network_configuartion',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.NETWORK_CONFIGURATION]),
              active: false
            }
          ],
          isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.ANALYTICS_CONFIGURATIONS])
        },
        {
          id: VunetSidebarConstants.DATA,
          description: ' ',
          icon: 'icon-Data',
          pageurl: '',
          active: false,
          subgroups: [
            {
              id: VunetSidebarConstants.VUBLOCK,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'data_source/vuBlock',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.VUBLOCK]),
              active: false
            },
            {
              id: VunetSidebarConstants.SOURCES,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'data_source/configuration',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.SOURCES]),
              active: false
            },
            // { id: 'Adapt', description: ' ', icon: '', pageurl: '' },
            {
              id: VunetSidebarConstants.ENRICH,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'data_source/enrichment',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.ENRICH]),
              active: false
            }
          ],
          isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.DATA])
        },
        {
          id: VunetSidebarConstants.DATA_STORE,
          description: ' ',
          icon: 'icon-Data-Source',
          pageurl: '',
          active: false,
          subgroups: [
            {
              id: VunetSidebarConstants.STORAGE,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'data_source/storage',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.STORAGE]),
              active: false
            },
            {
              id: VunetSidebarConstants.FILES,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'data_source/files',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.FILES]),
              active: false
            },
            {
              id: VunetSidebarConstants.DATA_RETENTION_SETTINGS,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'data_source/settings',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.DATA_RETENTION_SETTINGS]),
              active: false
            },
          ],
          isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.DATA_STORE])
        },
        {
          id: VunetSidebarConstants.SETTINGS,
          description: ' ',
          icon: 'icon-Settings',
          pageurl: '',
          active: false,
          subgroups: [
            {
              id: VunetSidebarConstants.BACKUP,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'backup',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.BACKUP]),
              active: false
            },
            {
              id: VunetSidebarConstants.DEFINITIONS,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'definition',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.DEFINITIONS]),
              active: false
            },
            {
              id: VunetSidebarConstants.IMAGEMANAGR,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'image_manager',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.IMAGEMANAGR]),
              active: false
            },
            {
              id: VunetSidebarConstants.PREFERENCES,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'preferences',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.PREFERENCES]),
              active: false
            },
            {
              id: VunetSidebarConstants.USER,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'user',
              isModifyAllowed: chrome.hideShowSideBarTab(sideBarTabsClaim[VunetSidebarConstants.USER]),
              active: false
            },
            {
              id: VunetSidebarConstants.ABOUT,
              description: ' ',
              icon: '',
              pageurl: baseUrl + berlinUrl + 'about',
              isModifyAllowed: true,
              active: false
            }
          ],
          isModifyAllowed: true
        }
      ];
    };

    $scope.init = function () {

      // toggeling sidebar from topbar in closed/open view
      $scope.toggle_slimscroll = function (item) {
        if ($('#wrapper').hasClass('enlarged')) {
          $(item).css('overflow', 'inherit').parent().css('overflow', 'inherit');
          $(item).siblings('.slimScrollBar').css('visibility', 'hidden');
        } else {
          $(item).css('overflow', 'hidden').parent().css('overflow', 'hidden');
          $(item).siblings('.slimScrollBar').css('visibility', 'visible');
        }
      };

      this.$body = $('#body');
      this.$openLeftBtn = $('.open-left');
      this.$menuItem = $('#sidebar-menu a');

      // NAVIGATION HIGHLIGHT & OPEN PARENT
      $('#sidebar-menu ul li.has_sub a.active').parents('li:last').children('a:first').addClass('active').trigger('click');
      $scope.updateData();

    };

    // Start with initialization..
    $scope.init();

    //Open/Closed button fucntionality from topbar
    $rootScope.openLeftBar = function () {

      $rootScope.isSideBarOpen = !$rootScope.isSideBarOpen;

      $('#wrapper').toggleClass('enlarged');
      $('#wrapper').addClass('forced');

      if ($('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left')) {
        $('body').removeClass('fixed-left').addClass('fixed-left-void');
      } else if (!$('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left-void')) {
        $('body').removeClass('fixed-left-void').addClass('fixed-left');
      }

      if ($('#wrapper').hasClass('enlarged')) {
        $('.left ul').removeAttr('style');
      } else {
        $('.subdrop').siblings('ul:first').show();
      }

      $scope.toggle_slimscroll('.slimscrollleft');
      $('body').trigger('resize');
    };


    // Handling the click of firstlevel to show sublevels
    $scope.menuItemClick = function (e) {

      if (!$('#wrapper').hasClass('enlarged')) {
        // if ($(e.target).parent().hasClass('has_sub')) {

        // }
        if (!$(e.target).hasClass('subdrop')) {

          // hide any open menus and remove all other classes
          $('ul', $(e.target).parents('ul:first')).slideUp(200);
          $('a', $(e.target).parents('ul:first')).removeClass('subdrop');
          $('#sidebar-menu .pull-right i').removeClass('md-remove').addClass('md-add');

          // open our new menu and add the open class
          $(e.target).next('ul').slideDown(300);
          $(e.target).addClass('subdrop');
          $('.pull-right i', $(e.target).parents('.has_sub:last')).removeClass('md-add').addClass('md-remove');
          $('.pull-right i', $(e.target).siblings('ul')).removeClass('md-remove').addClass('md-add');
        } else if ($(e.target).hasClass('subdrop')) {
          $(e.target).removeClass('subdrop');
          $(e.target).next('ul').slideUp(200);
          $('.pull-right i', $(e.target).parent()).removeClass('md-remove').addClass('md-add');
        }
      }
    };


    // This function is used to highlight the active tab in sidebar
    $scope.highlightActiveSidebar = function () {
      const currentRoute = window.location.href;

      if (currentRoute.includes('/storyboard')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[0].subgroups[0].active = true;
      } else if (currentRoute.includes('/discover')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[0].subgroups[1].active = true;
      } else if (currentRoute.includes('/event')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[0].subgroups[2].active = true;
      } else if (currentRoute.includes('/report')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[0].subgroups[3].active = true;
      } else if (currentRoute.includes('/visualize')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[1].subgroups[0].active = true;
      } else if (currentRoute.includes('/dashboard')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[1].subgroups[1].active = true;
      } else if (currentRoute.includes('/alert')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[1].subgroups[2].active = true;
      } else if (currentRoute.includes('/anomaly')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[1].subgroups[3].active = true;
      } else if (currentRoute.includes('/management')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[1].subgroups[4].active = true;
      } else if (currentRoute.includes('network_configuartion')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[1].subgroups[5].active = true;
      } else if (currentRoute.includes('/berlin/data_source/vuBlock')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[2].subgroups[0].active = true;
      } else if (currentRoute.includes('/berlin/data_source/configuration')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[2].subgroups[1].active = true;
      } else if (currentRoute.includes('/berlin/data_source/enrichment/')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[2].subgroups[2].active = true;
      } else if (currentRoute.includes('/berlin/data_source/storage')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[3].subgroups[0].active = true;
      } else if (currentRoute.includes('data_source/files')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[3].subgroups[1].active = true;
      } else if (currentRoute.includes('/berlin/data_source/settings')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[3].subgroups[2].active = true;
      } else if (currentRoute.includes('/berlin/backup')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[4].subgroups[0].active = true;
      } else if (currentRoute.includes('/berlin/definition')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[4].subgroups[1].active = true;
      } else if (currentRoute.includes('/berlin/image_manager')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[4].subgroups[2].active = true;
      } else if (currentRoute.includes('/berlin/preferences')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[4].subgroups[3].active = true;
      } else if (currentRoute.includes('/berlin/user')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[4].subgroups[4].active = true;
      } else if (currentRoute.includes('/berlin/about')) {
        $scope.clearActive();
        $scope.clearParentActive();
        $scope.data[4].subgroups[5].active = true;
      }
    };

    $scope.highlightActiveSidebar();
    $scope.parentHighlighSidebar();
    $scope.$on('$locationChangeSuccess', function () {
      $scope.highlightActiveSidebar();
      $scope.parentHighlighSidebar();
    });
  }
}

sidebarController.$inject = ['$scope', '$rootScope'];
/*eslint-disable*/
export default sidebarController;
/*eslint-enable*/









