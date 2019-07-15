import _ from 'lodash';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';
import { getPhraseScript } from './lib/phrase';

// Adds a filter to a passed state
export function FilterManagerProvider(Private) {
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const filterManager = {};

  filterManager.generate = (field, values, operation, index) => {
    values = Array.isArray(values) ? values : [values];
    const fieldName = _.isObject(field) ? field.name : field;
    const filters = _.flatten([queryFilter.getAppFilters()]);
    const newFilters = [];

    const negate = (operation === '-');

    // TODO: On array fields, negating does not negate the combination, rather all terms
    _.each(values, function (value) {
      let filter;
      const existing = _.find(filters, function (filter) {
        if (!filter) return;

        if (fieldName === '_exists_' && filter.exists) {
          return filter.exists.field === value;
        }

        if (_.has(filter, 'query.match')) {
          return filter.query.match[fieldName] && filter.query.match[fieldName].query === value;
        }

        if (filter.script) {
          return filter.meta.field === fieldName && filter.script.script.params.value === value;
        }
      });

      if (existing) {
        existing.meta.disabled = false;
        if (existing.meta.negate !== negate) {
          queryFilter.invertFilter(existing);
        }
        return;
      }

      switch (fieldName) {
        case '_exists_':
          filter = {
            meta: { negate, index },
            exists: {
              field: value
            }
          };
          break;
        default:
          if (field.scripted) {
            filter = {
              meta: { negate, index, field: fieldName },
              script: getPhraseScript(field, value)
            };
          } else {
            filter = { meta: { negate, index }, query: { match: {} } };
            filter.query.match[fieldName] = { query: value, type: 'phrase' };
          }

          break;
      }

      newFilters.push(filter);
    });

    return newFilters;
  };

  filterManager.add = function (field, values, operation, index) {
    const newFilters = this.generate(field, values, operation, index);
    return queryFilter.addFilters(newFilters);
  };

  return filterManager;
}

// Returns the query from the filter addded to the saved search.
// it handles is, is not, is one of, is not one of, exists, not exists,
// between and not between filters
export function getFiltersFromSavedSearch(savedSearchFilter, filter, $filter) {
  const negate = savedSearchFilter.meta.negate ? 'NOT ' : '';
  // exists and not exists filters
  if (_.has(filter, 'exists')) {
    return negate + '_exists_:' + _.get(filter, ['exists', 'field']);
  }
  // single phrase filter (is, is not)
  else if (_.has(filter, ['query', 'match'])) {
    for(const fieldName in filter.query.match) {
      if(filter.query.match.hasOwnProperty(fieldName)) {
        return negate + fieldName + ':' + _.get(filter, ['query', 'match', fieldName, 'query']);
      }
    }
  }
  // range filter (is between, is not between)
  else if (_.has(filter, 'range')) {
    for(const fieldName in filter.range) {
      if(filter.range.hasOwnProperty(fieldName)) {
        let toDate = new Date(_.get(filter, ['range', fieldName, 'lt']));
        toDate.setDate(toDate.getDate() - 1);
        toDate = $filter('date')(toDate, 'yyyy-MM-dd');
        return negate + fieldName + ':[' + _.get(filter, ['range', fieldName, 'gte']) + ' TO ' + toDate + ']';
      }
    }
  }
  // multiple phrases filter (is one of, is not one of)
  else if (_.has(filter, ['query', 'bool', 'should'])) {
    let query;
    filter.query.bool.should.map(function (queryfilter, index) {
      for(const fieldName in queryfilter.match_phrase) {
        if (index === 0) {
          query = fieldName + ':' + queryfilter.match_phrase[fieldName];
        }
        else {
          query = query + ' OR ' + fieldName + ':' + queryfilter.match_phrase[fieldName];
        }
      }
    });
    return negate + '(' + query + ')';
  }
}