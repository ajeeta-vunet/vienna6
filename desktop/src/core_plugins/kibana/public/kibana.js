// autoloading

// preloading (for faster webpack builds)
import chrome from 'ui/chrome';
import routes from 'ui/routes';
import { uiModules } from 'ui/modules';

import 'ui/autoload/all';
import 'plugins/kibana/home/index';
import 'plugins/kibana/alert/index';
import 'plugins/kibana/anomaly/index';
import 'plugins/kibana/report/index';
import 'plugins/kibana/discover/index';
import 'plugins/kibana/visualize/index';
import 'plugins/kibana/storyboard/index';
import 'plugins/kibana/dashboard/index';
import 'plugins/kibana/event/index';
import 'plugins/kibana/discovery/index';
import 'plugins/kibana/assetsPage/index';
import 'plugins/kibana/berlin/index';
import 'plugins/kibana/management/index';
import 'plugins/kibana/doc';
import 'plugins/kibana/dev_tools';
import 'plugins/kibana/context';
import 'ui/vislib';
import 'ui/agg_response';
import 'ui/agg_types';
import 'ui/timepicker';
import { Notifier } from 'ui/notify/notifier';
import 'leaflet';
import { KibanaRootController } from './kibana_root_controller';

routes.enable();

routes
  .otherwise({
    redirectTo: `/${chrome.userHomePage()}`
  });

chrome.setRootController('kibana', KibanaRootController);

const kibana = uiModules.get('kibana');

// $http interceptor
kibana.factory('responseInterceptor', ($rootScope) => {
  const responseInterceptor = {
    response: (config) => {
      // If the response is 474, the current user is
      // 'ManageLicense' user and should be shown the license
      // upload wizard. If it is 475, he should just be shown
      // error message 'License has expired'
      if (config.status === 474) {
        $rootScope.showUploadLicenseWizard = true;
        Notifier.showLicence($rootScope);
        $rootScope.licence = true;
      }

      if (config.status === 475) {
        $rootScope.showUploadLicenseWizard = false;
        Notifier.showLicence($rootScope);
        $rootScope.licence = true;
      }
      return config;
    },
    responseError: (config) => {
      // 474: Licence invalid
      // If the response is 474, the current user is
      // 'ManageLicense' user and should be shown the license
      // upload wizard. If it is 475, he should just be shown
      // error message 'License has expired'
      if (config.status === 474) {
        $rootScope.showUploadLicenseWizard = true;
        Notifier.showLicence($rootScope);
        $rootScope.licence = true;
      }
      else if (config.status === 475) {
        $rootScope.showUploadLicenseWizard = false;
        Notifier.showLicence($rootScope);
        $rootScope.licence = true;
      }
      else if (config.status === 401) {
        // unauthorized
        window.localStorage.removeItem('lastActiveTime');
        window.localStorage.removeItem('username');
        window.location.href = window.location.origin + '/vunet/login';
      } else if (config.status === 403) {
        // Forbidden
        const notify = new Notifier();
        notify.error(config.statusText || 'Access denied!');
      } else if (config.status === 500) {
        // Server Error
        const notify = new Notifier();
        notify.error(config.statusText);
      }
      return Promise.reject(config);
    }
  };
  return responseInterceptor;
});

kibana.config(($httpProvider) => {
  $httpProvider.interceptors.push('responseInterceptor');
});

kibana.run(($rootScope, $location, $http) => {
  $rootScope.licence = false;
  Notifier.pullMessageFromUrl($location);
  $rootScope.$watch('licence', function (licence) {
    if (licence) {
      // if licence page is shown , then discard all the pending request
      $http.pendingRequests.length = 0;
    }
  });
});
