define(function (require) {

  var angular = require('angular');
  var _ = require('lodash');
  var rison = require('utils/rison');

  // invokable/private angular dep
  return function ($location) {
    // feed in some of the private state from globalState
    return function (globalState, updateListeners, app) {
      var getAppStash = function (search) {
        var appStash = search._a && rison.decode(search._a);
        if (app.current) {
          appStash = _.defaults(appStash || {}, app.defaults);
        }
        return appStash;
      };

      var diffTrans = function (trans) {
        var obj = trans[0];
        var update = trans[1];

        var diff = {};

        // the keys that are currently set on obj, excluding methods
        var objKeys = Object.keys(obj).filter(function (key) {
          return typeof obj[key] !== 'function';
        });

        if (update) {
          // the keys obj should have after applying the update
          var updateKeys = diff.keys = Object.keys(update).filter(function (key) {
            return typeof update[key] !== 'function';
          });

          // the keys that will be removed
          diff.remove = _.difference(objKeys, updateKeys);

          // list of keys that will be added or changed
          diff.change = updateKeys.filter(function (key) {
            return !angular.equals(obj[key], update[key]);
          });
        } else {
          diff.keys = objKeys.slice(0);
          diff.remove = [];
          diff.change = [];
        }

        // single list of all keys that are effected
        diff.all = [].concat(diff.remove, diff.change);

        return diff;
      };

      var notify = function (trans, diff) {
        var listeners = null;

        if (trans[0] === app.current) {
          listeners = app.listeners;
        } else if (trans[0] === globalState) {
          listeners = updateListeners;
        }

        listeners && listeners.splice(0).forEach(function (defer) {
          defer.resolve(diff.all.slice(0));
        });
      };

      var applyDiff = function (trans, diff) {
        if (!diff.all.length) return;

        var obj = trans[0];
        var update = trans[1];

        diff.remove.forEach(function (key) {
          delete obj[key];
        });

        diff.change.forEach(function (key) {
          obj[key] = update[key];
        });
      };

      var syncTrans = function (trans, forceNotify) {
        // obj that will be modified by update(trans[1])
        // if it is empty, we can skip it all
        var skipWrite = !trans[0];
        trans[0] = trans[0] || {};

        var diff = diffTrans(trans);
        if (!skipWrite && (forceNotify || diff.all.length)) {
          applyDiff(trans, diff);
          notify(trans, diff);
        }
        return diff;
      };

      return {
        // sync by pushing to the url
        push: function (forceNotify) {
          var search = $location.search();

          var appStash = getAppStash(search) || {};
          var globalStash = search._g ? rison.decode(search._g) : {};

          var res = _.mapValues({
            app: [appStash, app.current],
            global: [globalStash, globalState]
          }, function (trans, key) {
            var diff = syncTrans(trans, forceNotify);
            var urlKey = '_' + key.charAt(0);
            if (diff.keys.length === 0) {
              delete search[urlKey];
            } else {
              search[urlKey] = rison.encode(trans[0]);
            }
            return diff;
          });

          $location.search(search);
          return res;
        },
        // sync by pulling from the url
        pull: function (forceNotify) {
          var search = $location.search();

          var appStash = getAppStash(search);
          var globalStash = search._g && rison.decode(search._g);

          return _.mapValues({
            app: [app.current, appStash],
            global: [globalState, globalStash]
          }, function (trans) {
            return syncTrans(trans, forceNotify);
          });
        }
      };
    };
  };
});