require('plugins/kibana/discover/index');
require('plugins/kibana/visualize/index');
require('plugins/kibana/dashboard/index');
require('plugins/kibana/settings/index');
require('plugins/kibana/doc/index');

var kibanaLogoUrl = require('ui/images/kibana.png');

require('ui/routes')
.otherwise({
  redirectTo: '/discover'
});

var chrome = require('ui/chrome')
.setBrand({
  'logo': 'url(' + kibanaLogoUrl + ') left no-repeat',
  'smallLogo': 'url(' + kibanaLogoUrl + ') left no-repeat'
})
.setNavBackground('#222222')
.setTabDefaults({
  resetWhenActive: true,
  trackLastPath: true,
  activeIndicatorColor: '#656a76'
})
.setTabs([
  {
    id: 'discover',
    title: 'Discover'
  },
  {
    id: 'visualize',
    title: 'Visualize',
    activeIndicatorColor: function () {
      return (String(this.lastUrl).indexOf('/visualize/step/') === 0) ? 'white' : '#656a76';
    }
  },
  {
    id: 'dashboard',
    title: 'Dashboard'
  },
  {
    id: 'settings',
    title: 'Settings'
  }
])
.setRootController('kibana', function ($scope, $rootScope, courier, config) {
  // wait for the application to finish loading
  $scope.$on('application.load', function () {
    courier.start();
  });

  function updateTheme() {
    var theme = config.get('theme');
    console.log(theme);
    chrome.setTheme(theme);
  }

  $rootScope.$on('init:config', updateTheme);
  $rootScope.$on('change:config.theme', updateTheme);
});
