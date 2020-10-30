import $ from 'jquery';
import { remove } from 'lodash';

import './kbn_chrome.less';
import { uiModules } from 'ui/modules';
import { isSystemApiRequest } from 'ui/system_api';
import {
  getUnhashableStatesProvider,
  unhashUrl,
} from 'ui/state_management/state_hashing';
import { notify } from 'ui/notify';
import { SubUrlRouteFilterProvider } from './sub_url_route_filter';

function getDarkThemeStatus() {
  const theme = localStorage.getItem('dark-theme');
  if (theme === 'true') {
    return true;
  } else {
    return false;
  }
}

export function kbnChromeProvider(chrome, internals) {

  uiModules
    .get('kibana')
    .directive('kbnChrome', () => {
      return {
        template() {
          const $content = $(require('./kbn_chrome.html'));
          const $app = $content.find('.application');

          if (internals.rootController) {
            $app.attr('ng-controller', internals.rootController);
          }

          if (internals.rootTemplate) {
            $app.removeAttr('ng-view');
            $app.html(internals.rootTemplate);
          }

          return $content;
        },

        controllerAs: 'chrome',
        controller($scope, $rootScope, $location, $http, Private, timefilter, kbnUrl) {
          const getUnhashableStates = Private(getUnhashableStatesProvider);

          const darkThemeStatus = getDarkThemeStatus();

          // are we showing the embedded version of the chrome?
          if (Boolean($location.search().embed)) {
            internals.permanentlyHideChrome();
          }

          const subUrlRouteFilter = Private(SubUrlRouteFilterProvider);

          $rootScope.appProps = {
            'darkTheme': darkThemeStatus,
            'private': Private,
            'timefilter': timefilter,
            'kbnUrl': kbnUrl
          };

          $rootScope.toggleDarkTheme = (status) => {
            if(status) {
              $rootScope.appProps = {
                'private': Private,
                'timefilter': timefilter,
                'kbnUrl': kbnUrl,
                'darkTheme': true
              };
              localStorage.setItem('dark-theme', true);
            } else {
              $rootScope.appProps = {
                'private': Private,
                'timefilter': timefilter,
                'kbnUrl': kbnUrl,
                'darkTheme': false
              };
              localStorage.setItem('dark-theme', false);
            }
          };

          function updateSubUrls() {
            const urlWithHashes = window.location.href;
            const urlWithStates = unhashUrl(urlWithHashes, getUnhashableStates());
            internals.trackPossibleSubUrl(urlWithStates);
          }

          function onRouteChange($event) {
            if (subUrlRouteFilter($event)) {
              updateSubUrls();
            }
          }

          $rootScope.$on('$routeChangeSuccess', onRouteChange);
          $rootScope.$on('$routeUpdate', onRouteChange);
          updateSubUrls(); // initialize sub urls

          const allPendingHttpRequests = () => $http.pendingRequests;
          const removeSystemApiRequests = (pendingHttpRequests = []) => remove(pendingHttpRequests, isSystemApiRequest);
          $scope.$watchCollection(allPendingHttpRequests, removeSystemApiRequests);

          // and some local values
          chrome.httpActive = $http.pendingRequests;
          $rootScope.notifList = notify._notifs;

          return chrome;
        }
      };
    });

}
