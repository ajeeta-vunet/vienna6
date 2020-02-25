import _ from 'lodash';
import { Control, noValuesDisableMsg, noIndexPatternMsg } from './control';
import { PhraseFilterManager } from './filter_manager/phrase_filter_manager';
import { createSearchSource } from './create_search_source';

function getEscapedQuery(query = '') {
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html#_standard_operators
  return query.replace(/[.?+*|{}[\]()"\\#@&<>~]/g, (match) => `\\${match}`);
}

const termsAgg = ({ field, size, direction, query }) => {
  if (size < 1) {
    size = 1;
  }
  const terms = {
    size: size,
    order: {
      _count: direction
    }
  };
  if (field.scripted) {
    terms.script = {
      inline: field.script,
      lang: field.lang
    };
    terms.valueType = field.type === 'number' ? 'float' : field.type;
  } else {
    terms.field = field.name;
  }

  if (query) {
    terms.include = `.*${getEscapedQuery(query)}.*`;
  }

  return {
    'termsAgg': {
      'terms': terms
    }
  };
};

const listControlDelimiter = '$$kbn_delimiter$$';

class ListControl extends Control {
  constructor(controlParams, filterManager, kbnApi, selectOptions) {
    super(controlParams, filterManager);

    this.selectOptions = selectOptions;
    this.kbnApi = kbnApi;
    this.controlParams = controlParams;
    this.filterManager = filterManager;
  }

  getMultiSelectDelimiter() {
    return this.filterManager.delimiter;
  }

  fetch = async (query) => {
    const indexPattern = this.filterManager.getIndexPattern();
    if (!indexPattern) {
      this.disable(noIndexPatternMsg(this.controlParams.indexPattern));
      return;
    }

    let ancestorFilters;
    if (this.hasAncestors()) {
      if (this.hasUnsetAncestor()) {
        this.disable(`Disabled until '${this.ancestors[0].label}' is set.`);
        this.lastAncestorValues = undefined;
        return;
      }

      const ancestorValues = this.getAncestorValues();
      if (_.isEqual(ancestorValues, this.lastAncestorValues)) {
        // short circuit to avoid fetching options list for same ancestor values
        return;
      }

      this.lastAncestorValues = ancestorValues;
      this.lastQuery = query;
      ancestorFilters = this.getAncestorFilters();
    }

    const fieldName = this.filterManager.fieldName;
    const initialSearchSourceState = {
      timeout: '1s',
      terminate_after: 100000
    };

    const aggs = termsAgg({
      field: indexPattern.fields.byName[fieldName],
      size: _.get(this.options, 'size', 5),
      direction: 'desc',
      query
    });

    const searchSource = createSearchSource(
      this.kbnApi,
      initialSearchSourceState,
      indexPattern,
      aggs,
      this.useTimeFilter,
      ancestorFilters);

    let resp;
    try {
      resp = await searchSource.fetch();
    } catch(error) {
      this.disable(`Unable to fetch terms, error: ${error.message}`);
      return;
    }

    if (query && this.lastQuery !== query) {
      // search results returned out of order - ignore results from old query
      return;
    }

    const selectOptions = _.get(resp, 'aggregations.termsAgg.buckets', []).map((bucket) => {
      return { label: this.format(bucket.key), value: bucket.key.toString() };
    }).sort((a, b) => {
      return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
    });

    if(selectOptions.length === 0 && !query) {
      // If there is no options.
      this.disable(noValuesDisableMsg(fieldName, indexPattern.title));
      return;
    }

    this.selectOptions = selectOptions;
    this.enable = true;
    this.disabledReason = '';
  }

  hasValue() {
    return typeof this.value !== 'undefined' && this.value.length > 0;
  }

}

export async function listControlFactory(controlParams, kbnApi, useTimeFilter) {

  let indexPattern;
  try {
    indexPattern = await kbnApi.indexPatterns.get(controlParams.indexPattern);

  } catch (err) {
    // ignore not found error and return control so it can be displayed in disabled state.
  }

  return new ListControl(
    controlParams,
    new PhraseFilterManager(controlParams.id, controlParams.fieldName, indexPattern, kbnApi.queryFilter, listControlDelimiter),
    kbnApi,
    useTimeFilter
  );
}
