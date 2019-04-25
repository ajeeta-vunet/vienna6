import chrome from 'ui/chrome';
import { preparehtmlInfo } from 'ui/utils/link_info_eval.js';
import _ from 'lodash';

let i = 0;

// eslint-disable-next-line @elastic/kibana-custom/no-default-export
export default function AggConfigResult(aggConfig, parent, value, key) {
  this.key = key;
  this.value = value;
  this.sum = -1;
  this.aggConfig = aggConfig;
  this.$parent = parent;
  this.$order = ++i;

  if (aggConfig.schema.group === 'buckets') {
    this.type = 'bucket';
  } else {
    this.type = 'metric';
  }
}

/**
 * Returns an array of the aggConfigResult and parents up the branch
 * @returns {array} Array of aggConfigResults
 */
AggConfigResult.prototype.getPath = function () {
  return (function walk(result, path) {
    path.unshift(result);
    if (result.$parent) return walk(result.$parent, path);
    return path;
  }(this, []));
};

/**
 * Returns an Elasticsearch filter that represents the result.
 * @returns {object} Elasticsearch filter
 */
AggConfigResult.prototype.createFilter = function () {
  return this.aggConfig.createFilter(this.key);
};

AggConfigResult.prototype.toString = function (contentType,
                                               getAppState = undefined,
                                               Private = undefined,
                                               timefilter = undefined) {
  const parsedUrl = {
    origin: window.location.origin,
    pathname: window.location.pathname,
    basePath: chrome.getBasePath(),
  };
  let formattedValue = this.aggConfig.fieldFormatter(contentType)(this.value, null, null, parsedUrl);
  // We need to check whether link information is configured in visualization
  if ((this.aggConfig.params.field !== undefined) && (getAppState !== undefined)) {

    // If this is based on a field (i.e. not a count metric), then we check
    // whether the field name matches with one of the link info configs
    const fieldName = this.aggConfig.params.field.name;
    const linkField = _.find(this.aggConfig.vis.params.linkInfo, { field: fieldName });

    // If the formatting done for the field was url formatting,
    // also the field name exists in the link info configs then
    // we would override that now since link info settings would
    // have specified alternate URL

    // If the field doesn't exists then we don't override and leave the field as is
    if (this.aggConfig.vis.params.linkInfoValues && linkField !== undefined) {
      formattedValue = this.value;
      const refLink = this.aggConfig.vis.params.linkInfo;
      const link = preparehtmlInfo(fieldName,
                              this.value,
                              formattedValue,
                              refLink,
                              this.aggConfig.params.field.indexPattern.id,
                              getAppState,
                              Private,
                              timefilter);

      if (link !== undefined) {
        // If we could not find a link formatting match, then we should
        // not return. Instead, we let the code fall to the regular
        // formatting function below.
        return link;
      }
    }
  }
  if (formattedValue.includes('href')) {
    formattedValue = '<u> ' + formattedValue + '</u>';
  }
  return formattedValue;
};

AggConfigResult.prototype.valueOf = function () {
  return this.value;
};
