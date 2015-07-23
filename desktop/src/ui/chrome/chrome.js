var _ = require('lodash');
var $ = require('jquery');
var angular = require('angular');

require('ui/timefilter/timefilter');
require('ui/private');
require('ui/promises');

var TabCollection = require('ui/chrome/TabCollection');

var chrome = {
  navBackground: '#222222',
  logo: null,
  smallLogo: null
};

var internals = _.assign(
  _.cloneDeep(window.__KBN__),
  {
    tabs: new TabCollection(),
    rootController: null,
    rootTemplate: null,
    showAppsLink: null,
    brand: null
  }
);

require('./api/apps')(chrome, internals);
require('./api/angular')(chrome, internals);
require('./api/tabs')(chrome, internals);
require('./api/template')(chrome, internals);
require('./api/theme')(chrome, internals);

chrome.bootstrap = function (angularModules) {
  chrome.setupAngular(angularModules);
  angular.bootstrap(document, ['kibana']);
  $(document.body).children(':not(style-compile)').show();
};

module.exports = chrome;
