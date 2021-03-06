import _ from 'lodash';

export function AggResponseBucketsProvider() {

  function Buckets(aggResp, aggParams) {
    if (_.has(aggResp, 'buckets')) {
      this.buckets = aggResp.buckets;
    } else {
      // Some Bucket Aggs only return a single bucket (like filter).
      // In those instances, the aggResp is the content of the single bucket.
      this.buckets = [aggResp];
    }

    this.objectMode = _.isPlainObject(this.buckets);
    if (this.objectMode) {
      this._keys = _.keys(this.buckets);
      this.length = this._keys.length;
    } else {
      this.length = this.buckets.length;
    }

    if (this.length && aggParams) this._orderBucketsAccordingToParams(aggParams);
  }

  Buckets.prototype.forEach = function (fn) {
    const buckets = this.buckets;

    if (this.objectMode) {
      this._keys.forEach(function (key) {
        fn(buckets[key], key);
      });
    } else {
      buckets.forEach(function (bucket) {

        // Check for bucket before accessing bucket.key
        // This was added to avoid showing blank pages
        // for visualizations with buckets when index used
        // to create it was deleted.
        bucket && fn(bucket, bucket.key);
      });
    }
  };

  Buckets.prototype._isRangeEqual = function (range1, range2) {
    return _.get(range1, 'from', null) === _.get(range2, 'from', null)
      && _.get(range1, 'to', null) === _.get(range2, 'to', null);
  };

  Buckets.prototype._orderBucketsAccordingToParams = function (params) {
    if (params.filters && this.objectMode) {
      this._keys = params.filters.map(filter => {
        return filter.label || filter.input.query || '*';
      });
    } else if (params.ranges && this.objectMode) {
      this._keys = params.ranges.map(range => {
        return _.findKey(this.buckets, el => this._isRangeEqual(el, range));
      });
    } else if (params.ranges && params.field.type !== 'date') {
      let ranges = params.ranges;
      if (params.ipRangeType) {
        ranges = params.ipRangeType === 'mask' ? ranges.mask : ranges.fromTo;
      }
      this.buckets = ranges.map(range => {
        if (range.mask) return this.buckets.find(el => el.key === range.mask);
        return this.buckets.find(el => this._isRangeEqual(el, range));
      });
    }
  };

  return Buckets;
}
