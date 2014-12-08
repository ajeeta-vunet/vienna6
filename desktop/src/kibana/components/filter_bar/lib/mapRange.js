define(function (require) {
  var _ = require('lodash');
  return function mapRangeProvider(Promise, courier) {
    return function (filter) {
      var key, value, from, to, field;
      if (filter.range) {
        return courier
        .indexPatterns
        .get(filter.meta.index).then(function (indexPattern) {
          key = _.keys(filter.range)[0];
          field = indexPattern.fields.byName[key];
          from = filter.range[key].gte || filter.range[key].gt;
          to = filter.range[key].lte || filter.range[key].lt;
          from = field.format.convert(from);
          to = field.format.convert(to);
          value = from + ' to ' + to;
          return { key: key, value: value };
        });
      }
      return Promise.reject(filter);
    };
  };
});
