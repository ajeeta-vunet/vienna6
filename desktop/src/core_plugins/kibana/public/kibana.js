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
      if(config.status === 474 || config.status === 475) {
        Notifier.showLicence($rootScope);
        $rootScope.licence = true;
      }
      return config;
    },
    responseError: (config) => {
      // 474: Licence invalid
      if(config.status === 474 || config.status === 475) {
        Notifier.showLicence($rootScope);
        $rootScope.licence = true;
      } else if(config.status === 401) { // unauthorized
        window.localStorage.clear();
        window.location.href = window.location.origin + '/vunet.html#/login';
      }  else if(config.status === 500) { // Server Error
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
    if(licence) {
      // if licence page is shown , then discard all the pending request
      $http.pendingRequests.length = 0;
    }
  });
});


