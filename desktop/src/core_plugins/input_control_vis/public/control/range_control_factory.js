import _ from 'lodash';
import { Control, noValuesDisableMsg, noIndexPatternMsg } from './control';
import { RangeFilterManager } from './filter_manager/range_filter_manager';
import { createSearchSource } from './create_search_source';
const minMaxAgg = (field) => {
  const aggBody = {};
  if (field.scripted) {
    aggBody.script = {
      inline: field.script,
      lang: field.lang
    };
  } else {
    aggBody.field = field.name;
  }
  return {
    maxAgg: {
      max: aggBody
    },
    minAgg: {
      min: aggBody
    }
  };
};

class RangeControl extends Control {
  constructor(controlParams, filterManager, kbnApi, useTimeFilter) {
    super(controlParams, filterManager);
    // this.min = min;
    // this.max = max;
    this.kbnApi = kbnApi;
    this.useTimeFilter = useTimeFilter;
  }
  fetch = async () => {
    const indexPattern = this.filterManager.getIndexPattern();
    if (!indexPattern) {
      this.disable(noIndexPatternMsg(this.controlParams.indexPattern));
      return;
    }

    const fieldName = this.filterManager.fieldName;

    const aggs = minMaxAgg(indexPattern.fields.byName[fieldName]);
    const searchSource = createSearchSource(this.kbnApi, null, indexPattern, aggs, this.useTimeFilter);

    let resp;
    try {
      resp = await searchSource.fetch();
    } catch(error) {
      this.disable(`Unable to fetch range min and max, error: ${error.message}`);
      return;
    }

    const min = _.get(resp, 'aggregations.minAgg.value', null);
    const max = _.get(resp, 'aggregations.maxAgg.value', null);

    if (min === null || max === null) {
      this.disable(noValuesDisableMsg(fieldName, indexPattern.title));
      return;
    }

    this.min = min;
    this.max = max;
    this.enable = true;
  }
}

export async function rangeControlFactory(controlParams, kbnApi, useTimeFilter) {
  let indexPattern;
  try {
    indexPattern = await kbnApi.indexPatterns.get(controlParams.indexPattern);
  } catch (err) {
    // ignore not found error and return control so it can be displayed in disabled state.
  }
  return new RangeControl(
    controlParams,
    new RangeFilterManager(controlParams.id, controlParams.fieldName, indexPattern, kbnApi.queryFilter),
    kbnApi,
    useTimeFilter
  );
}
