import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';

//
// A dashboard link constructed will be of the form
// #/dashboard/KPI? _g=(time:(from:now-30d,mode:quick,to:now), filters:!(('$state':(store:globalState),meta:(alias:!n,disabled:!f,index:'vunet-1-1-server-health-*',key:host,negate:!f,value:'127.0.0.1'),query:(match:(host:(query:'127.0.0.1',type:phrase))))))   &_a=( query:(query_string:(analyze_wildcard:!t,query:'tenant_id:1')), filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'vunet-1-1-server-health-*',key:target,negate:!f,value:'192.168.1.1'),query:(match:(target:(query:'192.168.1.1',type:phrase))))) )

export function prepareLinkInfo(
  base,
  name,
  searchString,
  retainFilters,
  fieldName,
  fieldValue,
  fieldIndex,
  fromTime,
  toTime,
  getAppState,
  Private,
  timefilter) {

  const queryFilter = Private(FilterBarQueryFilterProvider);
  const filters = queryFilter.getFilters();
  let baseLink = '';

  if (name !== '') {
    baseLink = base + name + '?';
  } else {
    baseLink = base + '?';
  }
  // App state portion
  let appLink = '&_a=(filters:!(';
  // Global State portion
  let globalLink = '_g=(';

  // Flags to mark second set of entries are being added. This is
  // to control adding of comma
  let appSecond = false;
  let globalSecond = false;

  // The link will use currently selected time
  if ((fromTime !== undefined) && (fromTime !== '')) {
    globalLink = globalLink + 'time:(from:' + fromTime + ',mode:quick' + ',to:' + toTime + '),';
  } else {
    if (timefilter && timefilter.getActiveBounds() !== undefined) {
      globalLink = globalLink + 'time:(from:' + timefilter.time.from + ',mode:' + timefilter.time.mode + ',to:' + timefilter.time.to + '),';
    }
  }

  // Add the initial portion of filters
  globalLink = globalLink + 'filters:!(';

  // Add currently added search filters and any additional search
  // strings configured in the link info
  let queryString = '*';

  if (retainFilters) {
    // currently applied search strings
    queryString = getAppState().query.query;
    if (typeof queryString !== 'string') {
      queryString = queryString.query_string.query;
    }
  }

  if (queryString === '') {
    queryString = '*';
  }

  // Now, add filters specified in link info
  if ((searchString !== undefined) && (searchString !== '')) {
    if ((queryString !== '*') && (queryString !== '')) {
      // In this case, we add the additional searches to existing ones
      // using logical AND
      queryString = '(' + queryString + ') AND (' + searchString + ')';
    } else {
      queryString = searchString;
    }
  }

  // Final query portion of link
  const queryLink = ',query:(query_string:(analyze_wildcard:!t,query:\'' + queryString + '\'))';

  // Now add currently applies global and app filters
  if (retainFilters) {
    let filterIndex = 0;
    for (filterIndex in filters) {
      if (filters[filterIndex].$state.store === 'appState') {
        const appFilter =
          '(\'$state\':(store:appState),meta:(alias:!n,disabled:!f,index:\'' +
          filters[filterIndex].meta.index + '\',key:' +
          filters[filterIndex].meta.key + ',negate:!f,value:\'' +
          filters[filterIndex].meta.value + '\'),query:(match:(' +
          filters[filterIndex].meta.key + ':(query:\'' +
          filters[filterIndex].meta.value + '\',type:phrase))))';

        appLink = appLink + (appSecond ? ',' : '') + appFilter;
        appSecond = true;
      } else {
        const globalFilter =
          '(\'$state\':(store:globalState),meta:(alias:!n,disabled:!f,index:\''
          + filters[filterIndex].meta.index + '\',key:' +
          filters[filterIndex].meta.key + ',negate:!f,value:\'' +
          filters[filterIndex].meta.value + '\'),query:(match:(' +
          filters[filterIndex].meta.key + ':(query:"' +
          filters[filterIndex].meta.value + '\',type:phrase))))';

        globalLink = globalLink + (globalSecond ? ',' : '') + globalFilter;
        globalSecond = true;
      }
    }
  }

  if ((fieldName !== undefined) && (fieldValue !== '')) {
    // If a field has been specified for use as filter
    const appFilter =
      '(\'$state\':(store:appState),meta:(alias:!n,disabled:!f,index:\'' +
      fieldIndex + '\',key:' + fieldName + ',negate:!f,value:\'' +
      fieldValue + '\'),query:(match:(' + fieldName + ':(query:\'' +
      fieldValue + '\',type:phrase))))';
    appLink = appLink + (appSecond ? ',' : '') + appFilter;
  }

  // Now we concatenate all 3 portions to form the final link
  appLink = appLink + ')' + queryLink + ')';
  globalLink = globalLink + '))';
  const link = baseLink + globalLink + appLink;
  return link;
}

// This function is used to prepare the link corresponding to a field
// based on the link info configuration.
// A dashboard link constructed will be of the form
// #/dashboard/KPI? _g=(time:(from:now-30d,mode:quick,to:now), filters:!(('$state':(store:globalState),meta:(alias:!n,disabled:!f,index:'vunet-1-1-server-health-*',key:host,negate:!f,value:'127.0.0.1'),query:(match:(host:(query:'127.0.0.1',type:phrase))))))   &_a=( query:(query_string:(analyze_wildcard:!t,query:'tenant_id:1')), filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'vunet-1-1-server-health-*',key:target,negate:!f,value:'192.168.1.1'),query:(match:(target:(query:'192.168.1.1',type:phrase))))) )
export function preparehtmlInfo(fieldName,
                                value,
                                formattedValue,
                                linkInfoList,
                                index,
                                getAppState,
                                Private,
                                timefilter) {
  for (let linkIndex in linkInfoList) {
    // go through each config entry, looking for a match

    if (fieldName === linkInfoList[linkIndex].field) {
      // Field names are matching. We construct the link now

      const queryFilter = Private(FilterBarQueryFilterProvider);
      const filters = queryFilter.getFilters();

      const baseLink = '#/dashboard/' + linkInfoList[linkIndex].dashboard.id + '?';
      // App state portion
      let appLink = '&_a=(filters:!(';
      // Global State portion
      let globalLink = "_g=(";

      // Flags to mark second set of entries are being added. This is
      // to control adding of comma
      let appSecond = false;
      let globalSecond = false;

      // The link will use currently selected time
      if (timefilter && timefilter.getActiveBounds() !== undefined) {
        globalLink = globalLink + 'time:(from:' + timefilter.time.from + ',mode:' + timefilter.time.mode + ',to:' + timefilter.time.to + '),';
      }

      // Add the initial portion of filters
      globalLink = globalLink + 'filters:!(';

      // Add currently added search filters and any additional search
      // strings configured in the link info
      let queryString = '*';

      if (linkInfoList[linkIndex].retainFilters) {
        // currently applied search strings
        queryString = getAppState().query.query;
        if (typeof queryString !== 'string') {
          queryString = queryString.query_string.query;
        }
      }

      if (queryString === '') {
        queryString = '*';
      }

      // Now, add filters specified in link info
      if (linkInfoList[linkIndex].searchString !== '') {
        if ((queryString !== '*') && (queryString !== '')) {
        // In this case, we add the additional searches to existing ones
        // using logical AND
        queryString = '(' + queryString + ') AND (' + linkInfoList[linkIndex].searchString + ')';
        } else {
          queryString = linkInfoList[linkIndex].searchString;
        }
      }

      // Final query portion of link
      const queryLink = ",query:(query_string:(analyze_wildcard:!t,query:'" + queryString + "'))";

      // Now add currently applies global and app filters
      if (linkInfoList[linkIndex].retainFilters) {
        for (var filterIndex in filters) {
          if (filters[filterIndex].$state.store === 'appState') {
            const appFilter = "('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'" + filters[filterIndex].meta.index + "',key:" + filters[filterIndex].meta.key + ",negate:!f,value:'" + filters[filterIndex].meta.value + "'),query:(match:(" + filters[filterIndex].meta.key + ":(query:'" + filters[filterIndex].meta.value + "',type:phrase))))";
            appLink = appLink + (appSecond ? ',' : '') + appFilter;
            appSecond = true;
          } else {
            const globalFilter = "('$state':(store:globalState),meta:(alias:!n,disabled:!f,index:'" + filters[filterIndex].meta.index + "',key:" + filters[filterIndex].meta.key + ",negate:!f,value:'" + filters[filterIndex].meta.value + "'),query:(match:(" + filters[filterIndex].meta.key + ":(query:'" + filters[filterIndex].meta.value + "',type:phrase))))";
            globalLink = globalLink + (globalSecond ? "," : "") + globalFilter;
            globalSecond = true;
          }
        }
      }

      // If the value of the field is to be used as a filter, add that
      if (linkInfoList[linkIndex].useFieldAsFilter) {
        const appFilter = "('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'" + index + "',key:" + fieldName + ",negate:!f,value:'" + value + "'),query:(match:(" + fieldName + ":(query:'" + value + "',type:phrase))))";
        appLink = appLink + (appSecond ? "," : "") + appFilter;
      }

      // Now we concatenate all 3 portions to form the final link
      appLink = appLink + ')' + queryLink + ')';
      globalLink = globalLink + '))';
      const link = baseLink + globalLink + appLink;
      return '<u> <a href="' + link + '">' + formattedValue + '</a> </u>';
    }
  }
  return undefined;
}

// This is a helper function for prepareMultilevelCategoryDropdown()
// We prepare the submenu showing the dashboards for each category.
export function getDashboardsForCategory(Private, timefilter, dashboardList) {
  const dashboardObjList = [];

  // prepare the dashboard object with id, title and url.
  dashboardList.forEach(function (entry) {
    let refLink = undefined;
    const useCurrentTime = entry.useCurrentTime;
    if ((entry.searchString === '') && !(useCurrentTime)) {
      refLink = `#/dashboard/${entry.dashboard.id}`;
    } else {
      refLink = prepareLinkInfo(
        '#/dashboard/',
        entry.dashboard.id,
        entry.searchString,
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        Private,
        useCurrentTime ? timefilter : undefined);
    }
    dashboardObjList.push({
      id: entry.dashboard.id,
      title: entry.dashboard.title,
      label: entry.label,
      url: refLink
    });
  });
  return dashboardObjList;
}
