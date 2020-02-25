export function createSearchSource(kbnApi, initialState, indexPattern, aggs, useTimeFilter, filters = []) {
  const searchSource = new kbnApi.SearchSource(initialState);
  searchSource.inherits(false); //Do not filter by time so can not inherit from rootSearchSource
  searchSource.setField('size', 0);
  searchSource.size(0);
  searchSource.setField('index', indexPattern);
  searchSource.index(indexPattern);
  searchSource.setField('aggs', aggs);
  searchSource.aggs(aggs);
  searchSource.filter(() => {
    const activeFilters = [...filters];
    if (useTimeFilter) {
      activeFilters.push(kbnApi.timeFilter.createFilter(indexPattern));
    }
    return activeFilters;
  });

  // Do not not inherit from rootSearchSource to avoid picking up time and globals
  searchSource.setParent(false);
  searchSource.setField('filter', () => {
    const activeFilters = [...filters];
    if (useTimeFilter) {
      activeFilters.push(kbnApi.timeFilter.createFilter(indexPattern));
    }
    return activeFilters;
  });

  return searchSource;
}
