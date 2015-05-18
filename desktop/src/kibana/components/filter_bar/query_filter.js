define(function (require) {
  var _ = require('lodash');

  return function (Private, $rootScope, getAppState, globalState) {
    var EventEmitter = Private(require('factories/events'));
    var onlyDisabled = require('components/filter_bar/lib/onlyDisabled');
    var onlyStateChanged = require('components/filter_bar/lib/onlyStateChanged');
    var uniqFilters = require('components/filter_bar/lib/uniqFilters');
    var compareFilters = require('components/filter_bar/lib/compareFilters');
    var mapAndFlattenFilters = Private(require('components/filter_bar/lib/mapAndFlattenFilters'));

    var queryFilter = new EventEmitter();

    queryFilter.getFilters = function () {
      var compareOptions = { disabled: true, negate: true };
      var appFilters = queryFilter.getAppFilters();
      var globalFilters = queryFilter.getGlobalFilters();

      return uniqFilters(globalFilters.concat(appFilters), compareOptions);
    };

    queryFilter.getAppFilters = function () {
      var appState = getAppState();
      if (!appState || !appState.filters) return [];
      return (appState.filters) ? _.map(appState.filters, appendStoreType('appState')) : [];
    };

    queryFilter.getGlobalFilters = function () {
      if (!globalState.filters) return [];
      return _.map(globalState.filters, appendStoreType('globalState'));
    };

    /**
     * Adds new filters to the scope and state
     * @param {object|array} fitlers Filter(s) to add
     * @param {bool} global Should be added to global state
     * @returns {object} Resulting new filter list
     */
    queryFilter.addFilters = function (filters, global) {
      var appState = getAppState();
      var state = (global) ? globalState : appState;

      if (!_.isArray(filters)) {
        filters = [filters];
      }

      if (global) {
        // simply concat global filters, they will be deduped
        globalState.filters = globalState.filters.concat(filters);
      } else if (appState) {
        if (!appState.filters) appState.filters = [];
        appState.filters = appState.filters.concat(filters);
      }

      return saveState();
    };

    /**
     * Removes the filter from the proper state
     * @param {object} matchFilter The filter to remove
     * @returns {object} Resulting new filter list
     */
    queryFilter.removeFilter = function (matchFilter) {
      var state = getStateByFilter(matchFilter);
      if (!state) return;

      _.pull(state.filters, matchFilter);
      return saveState();
    };

    /**
     * Removes all filters
     * @returns {object} Resulting new filter list
     */
    queryFilter.removeAll = function () {
      var appState = getAppState();
      appState.filters = [];
      globalState.filters = [];
      return saveState();
    };

    /**
     * Toggles the filter between enabled/disabled.
     * @param {object} filter The filter to toggle
     & @param {boolean} force Disabled true/false
     * @returns {object} updated filter
     */
    queryFilter.toggleFilter = function (filter, force) {
      // Toggle the disabled flag
      var disabled = _.isUndefined(force) ? !filter.meta.disabled : !!force;
      filter.meta.disabled = disabled;

      // Save the filters back to the searchSource
      saveState();
      return filter;
    };

    /**
     * Disables all filters
     * @params {boolean} force Disable/enable all filters
     * @returns {object} Resulting updated filter list
     */
    queryFilter.toggleAll = function (force) {
      function doToggle(filter) {
        queryFilter.toggleFilter(filter, force);
      }

      executeOnFilters(doToggle);
      return queryFilter.getFilters();
    };


    /**
     * Inverts the nagate value on the filter
     * @param {object} filter The filter to toggle
     * @returns {object} updated filter
     */
    queryFilter.invertFilter = function (filter) {
      // Toggle the negate meta state
      filter.meta.negate = !filter.meta.negate;

      saveState();
      return filter;
    };

    /**
     * Inverts all filters
     * @returns {object} Resulting updated filter list
     */
    queryFilter.invertAll = function () {
      executeOnFilters(queryFilter.invertFilter);
      return queryFilter.getFilters();
    };


    /**
     * Pins the filter to the global state
     * @param {object} filter The filter to pin
     * @param {boolean} force pinned state
     * @returns {object} filter passed in
     */
    queryFilter.pinFilter = function (filter, force) {
      var appState = getAppState();
      if (!appState) return filter;

      // ensure that both states have a filters property
      if (!_.isArray(globalState.filters)) globalState.filters = [];
      if (!_.isArray(appState.filters)) appState.filters = [];

      var appIndex = _.indexOf(appState.filters, filter);
      var globalIndex = _.indexOf(globalState.filters, filter);
      if (appIndex === -1 && globalIndex === -1) return;

      if (appIndex !== -1 && force !== false) {
        appState.filters.splice(appIndex, 1);
        globalState.filters.push(filter);
      } else if (globalIndex !== -1 && force !== true) {
        globalState.filters.splice(globalIndex, 1);
        appState.filters.push(filter);
      }

      saveState();
      return filter;
    };

    /**
     * Pins all filters
     * @params {boolean} force Pin/Unpin all filters
     * @returns {object} Resulting updated filter list
     */
    queryFilter.pinAll = function (force) {
      function pin(filter) {
        queryFilter.pinFilter(filter, force);
      }

      executeOnFilters(pin);
      return queryFilter.getFilters();
    };

    initWatchers();

    return queryFilter;

    /**
     * Saves both app and global states, ensuring filters are persisted
     * @returns {object} Resulting filter list, app and global combined
     */
    function saveState() {
      var appState = getAppState();
      if (appState) appState.save();
      globalState.save();
      return queryFilter.getFilters();
    }

    function appendStoreType(type) {
      return function (filter) {
        filter.$state = {
          store: type
        };
        return filter;
      };
    }

    // get state (app or global) or the filter passed in
    function getStateByFilter(filter) {
      var appState = getAppState();
      if (appState) {
        var appIndex = _.indexOf(appState.filters, filter);
        if (appIndex !== -1) return appState;
      }

      var globalIndex = _.indexOf(globalState.filters, filter);
      if (globalIndex !== -1) return globalState;

      return false;
    }

    // helper to run a function on all filters in all states
    function executeOnFilters(fn) {
      var appState = getAppState();
      var appFilters;
      if (appState && appState.filters) {
        appFilters = appState.filters;
      } else {
        appFilters = [];
      }
      globalState.filters.concat(appFilters).forEach(fn);
    }

    function mergeAndMutateFilters(globalFilters, appFilters, compareOptions) {
      appFilters = appFilters || [];
      globalFilters = globalFilters || [];
      compareOptions = _.defaults(compareOptions || {}, { disabled: true, negate: true });

      // existing globalFilters should be mutated by appFilters
      _.each(appFilters, function (filter, i) {
        var match = _.find(globalFilters, function (globalFilter) {
          return compareFilters(globalFilter, filter, compareOptions);
        });

        // no match, do nothing
        if (!match) return;

        // matching filter in globalState, update global and remove from appState
        _.assign(match.meta, filter.meta);
        appFilters.splice(i, 1);
      });

      appFilters = uniqFilters(appFilters, { disabled: true });
      globalFilters = uniqFilters(globalFilters, { disabled: true });

      return mapAndFlattenFilters(globalFilters)
      .then(function (globals) {
        globalFilters = globals;
        return mapAndFlattenFilters(appFilters);
      }).then(function (apps) {
        appFilters = apps;
        return [globalFilters, appFilters];
      });
    }

    /**
     * Initializes state watchers that use the event emitter
     * @returns {void}
     */
    function initWatchers() {
      var removeAppStateWatchers;

      $rootScope.$watch(getAppState, function () {
        removeAppStateWatchers && removeAppStateWatchers();
        removeAppStateWatchers = initAppStateWatchers();
      });

      function initAppStateWatchers() {
        // multi watch on the app and global states
        var stateWatchers = [{
          fn: $rootScope.$watch,
          deep: true,
          get: queryFilter.getGlobalFilters
        }, {
          fn: $rootScope.$watch,
          deep: true,
          get: queryFilter.getAppFilters
        }];

        // when states change, use event emitter to trigger updates and fetches
        return $rootScope.$watchMulti(stateWatchers, function (next, prev) {
          // prevent execution on watcher instantiation
          if (_.isEqual(next, prev)) return;

          var doUpdate = false;
          var doFetch = false;
          var originals = {
            global: _.cloneDeep(next[0]),
            app: _.cloneDeep(next[1])
          };

          // reconcile filter in global and app states
          return mergeAndMutateFilters(next[0], next[1])
          .then(function (filters) {
            var globalFilters = filters[0];
            var appFilters = filters[1];
            var appState = getAppState();

            // save the state, as it may have updated
            var globalChanged = !_.isEqual(originals.global, globalFilters);
            var appChanged = !_.isEqual(originals.app, appFilters);

            // the filters were changed, apply to state (re-triggers this watcher)
            if (globalChanged || appChanged) {
              globalState.filters = globalFilters;
              if (appState) appState.filters = appFilters;
              return;
            }

            // check for actions, bail if we're done
            getActions();
            if (!doUpdate) return;

            // save states and emit the required events
            saveState();
            queryFilter.emit('update')
            .then(function () {
              if (!doFetch) return;
              queryFilter.emit('fetch');
            });
          });

          // iterate over each state type, checking for changes
          function getActions() {
            var newFilters = [];
            var oldFilters = [];
            stateWatchers.forEach(function (watcher, i) {
              var nextVal = next[i];
              var prevVal = prev[i];
              newFilters = newFilters.concat(nextVal);
              oldFilters = oldFilters.concat(prevVal);

              // no update or fetch if there was no change
              if (nextVal === prevVal) return;
              if (nextVal) doUpdate = true;

              // don't trigger fetch when only disabled filters
              if (!onlyDisabled(nextVal, prevVal)) doFetch = true;
            });

            // make sure change wasn't only a state move
            // checking length first is an optimization
            if (doFetch && newFilters.length === oldFilters.length) {
              if (onlyStateChanged(newFilters, oldFilters)) doFetch = false;
            }
          }
        });
      }
    }
  };
});
