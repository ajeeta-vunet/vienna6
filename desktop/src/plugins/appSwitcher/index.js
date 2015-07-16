module.exports = function (kibana) {
  return new kibana.Plugin({
    uiExports: {
      app: {
        id: 'switcher',
        main: 'plugins/appSwitcher/appSwitcher',
        hidden: true,
        defaultModules: {
          angular: [],
          require: [
            'ui/chrome',
            'angular-bootstrap'
          ]
          .concat(kibana.autoload.styles)
        }
      }
    }
  });
};
