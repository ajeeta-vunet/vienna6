/**
 * @name SavedObject
 *
 * NOTE: SavedObject seems to track a reference to an object in ES,
 * and surface methods for CRUD functionality (save and delete). This seems
 * similar to how Backbone Models work.
 *
 * This class seems to interface with ES primarily through the es Angular
 * service and the saved object api.
 */

import angular from 'angular';
import chrome from 'ui/chrome';
import _ from 'lodash';

import { SavedObjectNotFound, SavedObjectNotAllowed } from 'ui/errors';
import MappingSetupProvider from 'ui/utils/mapping_setup';

import { SearchSourceProvider } from '../data_source/search_source';
import { SavedObjectsClientProvider, findObjectByTitle } from 'ui/saved_objects';
import { migrateLegacyQuery } from '../../utils/migrateLegacyQuery.js';

import { rbacCheckForModifyPermission } from '../../utils/vunet_rbac.js';

/**
 * An error message to be used when the user rejects a confirm overwrite.
 * @type {string}
 */
const OVERWRITE_REJECTED = 'Overwrite confirmation was rejected';

/**
 * An error message to be used when the user rejects a confirm save with duplicate title.
 * @type {string}
 */
const SAVE_DUPLICATE_REJECTED = 'Save with duplicate title confirmation was rejected';

/**
 * @param error {Error} the error
 * @return {boolean}
 */
function isErrorNonFatal(error) {
  if (!error) return false;
  return error.message === OVERWRITE_REJECTED || error.message === SAVE_DUPLICATE_REJECTED;
}

export function SavedObjectProvider(Promise, Private, Notifier, confirmModalPromise, indexPatterns) {
  const savedObjectsClient = Private(SavedObjectsClientProvider);
  const SearchSource = Private(SearchSourceProvider);
  const mappingSetup = Private(MappingSetupProvider);

  function SavedObject(config) {
    if (!_.isObject(config)) config = {};

    /************
     * Initialize config vars
     ************/

    // type name for this object, used as the ES-type
    const esType = config.type;

    this.getDisplayName = function () {
      return esType;
    };

    // NOTE: this.type (not set in this file, but somewhere else) is the sub type, e.g. 'area' or
    // 'data table', while esType is the more generic type - e.g. 'visualization' or 'saved search'.
    this.getEsType = function () {
      return esType;
    };

    /**
     * Flips to true during a save operation, and back to false once the save operation
     * completes.
     * @type {boolean}
     */
    this.isSaving = false;
    this.defaults = config.defaults || {};

    // mapping definition for the fields that this object will expose
    const mapping = mappingSetup.expandShorthand(config.mapping);

    const afterESResp = config.afterESResp || _.noop;
    const customInit = config.init || _.noop;

    // optional search source which this object configures
    this.searchSource = config.searchSource ? new SearchSource() : undefined;

    // the id of the document
    this.id = config.id || void 0;

    // Whether to create a copy when the object is saved. This should eventually go away
    // in favor of a better rename/save flow.
    this.copyOnSave = false;

    const parseSearchSource = (searchSourceJson) => {
      if (!this.searchSource) return;

      // if we have a searchSource, set its state based on the searchSourceJSON field
      let state;
      try {
        state = JSON.parse(searchSourceJson);
      } catch (e) {
        state = {};
      }

      const oldState = this.searchSource.toJSON();
      const fnProps = _.transform(oldState, function (dynamic, val, name) {
        if (_.isFunction(val)) dynamic[name] = val;
      }, {});

      this.searchSource.set(_.defaults(state, fnProps));

      if (!_.isUndefined(this.searchSource.getOwn('query'))) {
        this.searchSource.set('query', migrateLegacyQuery(this.searchSource.getOwn('query')));
      }
    };

    /**
     * After creation or fetching from ES, ensure that the searchSources index indexPattern
     * is an bonafide IndexPattern object.
     *
     * @return {Promise<IndexPattern | null>}
     */
    this.hydrateIndexPattern = (id) => {
      if (!this.searchSource) {
        return Promise.resolve(null);
      }

      if (config.clearSavedIndexPattern) {
        this.searchSource.set('index', undefined);
        return Promise.resolve(null);
      }

      let index = id || config.indexPattern || this.searchSource.getOwn('index');

      if (!index) {
        return Promise.resolve(null);
      }

      // If index is not an IndexPattern object at this point, then it's a string id of an index.
      if (!(index instanceof indexPatterns.IndexPattern)) {
        index = indexPatterns.get(index);
      }

      // At this point index will either be an IndexPattern, if cached, or a promise that
      // will return an IndexPattern, if not cached.
      return Promise.resolve(index).then(indexPattern => {
        this.searchSource.set('index', indexPattern);
      });
    };

    /**
     * Asynchronously initialize this object - will only run
     * once even if called multiple times.
     *
     * @return {Promise}
     * @resolved {SavedObject}
     */
    this.init = _.once(() => {
      // ensure that the esType is defined
      if (!esType) throw new Error('You must define a type name to use SavedObject objects.');

      return Promise.resolve()
        .then(() => {
          // If there is not id, then there is no document to fetch from elasticsearch
          if (!this.id) {
            // just assign the defaults and be done
            _.assign(this, this.defaults);
            return this.hydrateIndexPattern().then(() => {
              return afterESResp.call(this);
            });
          }

          // fetch the object from ES
          return savedObjectsClient.get(esType, this.id)
            .then(resp => {
              // temporary compatability for savedObjectsClient

              return {
                _id: resp.id,
                _type: resp.type,
                _source: _.cloneDeep(resp.attributes),
                found: resp._version ? true : false
              };
            })
            .then(this.applyESResp)
            .catch(this.applyEsResp);
        })
        .then(() => customInit.call(this))
        .then(() => this);
    });


    this.applyESResp = (resp) => {
      this._source = _.cloneDeep(resp._source);

      if (resp.found != null && !resp.found) throw new SavedObjectNotFound(esType, this.id);

      // Get visState for visualization objects
      let visState = undefined;
      if (resp._type === 'visualization') {
        visState = JSON.parse(this._source.visState);
      }

      // Check if we should allow loading of this object based on the user's
      // permission and the allowedRolesJSON in this object
      const allowedRoles = this._source.allowedRolesJSON ? JSON.parse(this._source.allowedRolesJSON) : [];

      const loadAllowed = rbacCheckForModifyPermission(chrome, resp._type, this._source.title, visState, allowedRoles, ['modify', 'view']);
      if (!loadAllowed && resp._type !== 'storyboard') {
        throw new SavedObjectNotAllowed(esType, this.id);
      }

      const meta = resp._source.kibanaSavedObjectMeta || {};
      delete resp._source.kibanaSavedObjectMeta;

      if (!config.indexPattern && this._source.indexPattern) {
        config.indexPattern = this._source.indexPattern;
        delete this._source.indexPattern;
      }

      // assign the defaults to the response
      _.defaults(this._source, this.defaults);

      // transform the source using _deserializers
      _.forOwn(mapping, (fieldMapping, fieldName) => {
        if (fieldMapping._deserialize) {
          this._source[fieldName] = fieldMapping._deserialize(this._source[fieldName], resp, fieldName, fieldMapping);
        }
      });

      // Give obj all of the values in _source.fields
      _.assign(this, this._source);
      this.lastSavedTitle = this.title;

      return Promise.try(() => {
        parseSearchSource(meta.searchSourceJSON);
        return this.hydrateIndexPattern();
      }).then(() => {
        return Promise.cast(afterESResp.call(this, resp));
      });
    };

    /**
     * Serialize this object
     *
     * @return {Object}
     */
    this.serialize = () => {
      const body = {};

      _.forOwn(mapping, (fieldMapping, fieldName) => {
        if (this[fieldName] != null) {
          body[fieldName] = (fieldMapping._serialize)
            ? fieldMapping._serialize(this[fieldName])
            : this[fieldName];
        }
      });

      if (this.searchSource) {
        // Find and remove any search string added as filter
        // in dashboard / report before saving them.
        const searchSourceJSON = _.omit(this.searchSource.toJSON(), ['sort', 'size']);
        const searchString = chrome.getSearchString();
        if (searchString) {
          if (searchSourceJSON.hasOwnProperty('filter') &&
            searchSourceJSON.filter.length) {
            searchSourceJSON.filter.forEach(function (item, index) {
              if ((item.hasOwnProperty('query') &&
                  item.query.hasOwnProperty('query_string')) &&
                  item.query.query_string.query === searchString) {
                searchSourceJSON.filter.splice(index, 1);
              }
            });
          }
        }

        body.kibanaSavedObjectMeta = {
          searchSourceJSON: angular.toJson(searchSourceJSON)
        };
      }

      return body;
    };

    /**
     * Returns true if the object's original title has been changed. New objects return false.
     * @return {boolean}
     */
    this.isTitleChanged = () => {
      return this._source && this._source.title !== this.title;
    };

    /**
     * Attempts to create the current object using the serialized source. If an object already
     * exists, a warning message requests an overwrite confirmation.
     * @param source - serialized version of this object (return value from this.serialize())
     * What will be indexed into elasticsearch.
     * @returns {Promise} - A promise that is resolved with the objects id if the object is
     * successfully indexed. If the overwrite confirmation was rejected, an error is thrown with
     * a confirmRejected = true parameter so that case can be handled differently than
     * a create or index error.
     * @resolved {SavedObject}
     */
    /*
    const createSource = (source) => {
      return savedObjectsClient.create(esType, source, { id: this.id })
        .catch(err => {
          // record exists, confirm overwriting
          if (_.get(err, 'statusCode') === 409) {
            const confirmMessage = `Are you sure you want to overwrite ${this.title}?`;

            return confirmModalPromise(confirmMessage, { confirmButtonText: `Overwrite ${this.getDisplayName()}` })
              .then(() => savedObjectsClient.create(esType, source, { id: this.id, overwrite: true }))
              .catch(() => Promise.reject(new Error(OVERWRITE_REJECTED)));
          }
          return Promise.reject(err);
        });
    };
    */

    /**
     * Returns a promise that resolves to true if either the title is unique, or if the user confirmed they
     * wished to save the duplicate title.  Promise is rejected if the user rejects the confirmation.
     */
    const warnIfDuplicateTitle = () => {
      // Don't warn if the user isn't updating the title, otherwise that would become very annoying to have
      // to confirm the save every time, except when copyOnSave is true, then we do want to check.
      if (this.title === this.lastSavedTitle && !this.copyOnSave) {
        return Promise.resolve();
      }

      return findObjectByTitle(savedObjectsClient, this.getEsType(), this.title)
        .then(duplicate => {
          if (!duplicate) return true;
          if (duplicate.id === this.id) return true;

          // We always overwrite the existing one if user allows that..
          this.id = duplicate.id;

          const confirmMessage =
            `A ${this.getDisplayName()} with the title '${this.title}' already exists. Would you like to save anyway?`;

          return confirmModalPromise(confirmMessage, { confirmButtonText: `Save ${this.getDisplayName()}` })
            .catch(() => Promise.reject(new Error(SAVE_DUPLICATE_REJECTED)));
        });
    };

    /**
     * Saves this object.
     *
     * @param {object} [options={}]
     * @property {boolean} [options.confirmOverwrite=false] - If true, attempts to create the source so it
     * can confirm an overwrite if a document with the id already exists.
     * @return {Promise}
     * @resolved {String} - The id of the doc
     */
    this.save = ({} = {}) => {
      // Save the original id in case the save fails.
      const originalId = this.id;
      // Read https://github.com/elastic/kibana/issues/9056 and
      // https://github.com/elastic/kibana/issues/9012 for some background into why this copyOnSave variable
      // exists.
      // The goal is to move towards a better rename flow, but since our users have been conditioned
      // to expect a 'save as' flow during a rename, we are keeping the logic the same until a better
      // UI/UX can be worked out.
      if (this.copyOnSave) {
        this.id = null;
      }

      const source = this.serialize();

      this.isSaving = true;

      return warnIfDuplicateTitle()
        .then(() => {
          return savedObjectsClient.create(esType, source, { id: this.id, overwrite: true });
        })
        .then((resp) => {
          this.id = resp.id;
        })
        .then(() => {
          this.isSaving = false;
          this.lastSavedTitle = this.title;
          return this.id;
        })
        .catch((err) => {
          this.isSaving = false;
          this.id = originalId;
          if (isErrorNonFatal(err)) {
            return;
          }
          return Promise.reject(err);
        });
    };

    this.destroy = () => {
      if (this.searchSource) {
        this.searchSource.cancelQueued();
      }
    };

    /**
     * Delete this object from Elasticsearch
     * @return {promise}
     */
    this.delete = () => {
      return savedObjectsClient.delete(esType, this.id);
    };
  }

  return SavedObject;
}
