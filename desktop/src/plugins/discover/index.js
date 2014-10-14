define(function (require, module, exports) {
  require('plugins/discover/directives/table');
  require('plugins/discover/saved_searches/saved_searches');
  require('plugins/discover/directives/timechart');
  require('plugins/discover/components/field_chooser/field_chooser');
  require('plugins/discover/controllers/discover');
  require('css!plugins/discover/styles/main.css');
});