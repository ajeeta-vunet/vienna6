define(function (require) {
  var _ = require('lodash');
  var nextTick = require('utils/next_tick');
  var $ = require('jquery');
  var modules = require('modules');
  var module = modules.get('kibana/notify');
  var errors = require('./errors');
  var Notifier = require('./_notifier');
  var rootNotifier = new Notifier();

  require('./directives');

  module.factory('createNotifier', function () {
    return function (opts) {
      return new Notifier(opts);
    };
  });

  module.factory('Notifier', function () {
    return Notifier;
  });

  /**
   * Global Angular uncaught exception handler
   */
  modules
    .get('exceptionOverride')
    .factory('$exceptionHandler', function () {
      return function (exception, cause) {
        rootNotifier.fatal(exception, cause);
      };
    });

  /**
   * Global Require.js exception handler
   */
  window.requirejs.onError = function (err) {
    rootNotifier.fatal(new errors.ScriptLoadFailure(err));
  };

  window.onerror = function (err, url, line) {
    rootNotifier.fatal(new Error(err + ' (' + url + ':' + line + ')'));
    return true;
  };

  // function onTabFocus(onChange) {
  //   var current = true;
  //   // bind each individually
  //   var elem = window;
  //   var focus = 'focus';
  //   var blur = 'blur';

  //   if (/*@cc_on!@*/false) { // check for Internet Explorer
  //     elem = document;
  //     focus = 'focusin';
  //     blur = 'focusout';
  //   }

  //   function handler(event) {
  //     var state;

  //     if (event.type === focus) {
  //       state = true;
  //     } else if (event.type === blur) {
  //       state = false;
  //     } else {
  //       return;
  //     }

  //     if (current !== state) {
  //       current = state;
  //       onChange(current);
  //     }
  //   }

  //   elem.addEventListener(focus, handler);
  //   elem.addEventListener(blur, handler);

  //   // call the handler ASAP with the current status
  //   nextTick(handler, current);

  //   // function that the user can call to unbind this handler
  //   return function unBind() {
  //     elem.removeEventListener(focus, handler);
  //     elem.removeEventListener(blur, handler);
  //   };
  // }

  // onTabFocus(function (focused) {
  //   // log(focused ? 'welcome back' : 'good bye');
  // });

  return rootNotifier;

});
