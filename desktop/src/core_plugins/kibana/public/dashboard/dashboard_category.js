import _ from 'lodash';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { DashboardConstants } from 'plugins/kibana/dashboard/dashboard_constants';
import { Notifier } from 'ui/notify';
const Promise = require('bluebird');
import {  logUserOperationForDeleteMultipleObjects } from 'plugins/kibana/log_user_operation';
const notify = new Notifier();

// This function is used to get the categories list.
export function getCategory(Private, courier) {
  const savedObjectsClient = Private(SavedObjectsClientProvider);
  return savedObjectsClient.find({
    type: 'visualization',
    fields: [],
    search: 'category',
    perPage: 1000
  }).then(results => {
    const categoryList = [];
    _.each(results.savedObjects, function (obj) {
      if(obj.attributes.visState) {
        const val = JSON.parse(obj.attributes.visState);
        if (val.type === 'category') {
          const idTitleObj = {};
          idTitleObj.id = obj.id;
          idTitleObj.title = obj.attributes.title;
          categoryList.push(idTitleObj);
        }
      }
    });
    return categoryList;
  }).catch(courier.redirectWhenMissing({
    'dashboard': DashboardConstants.LANDING_PAGE_PATH
  }));
}

// This function is called to add the passed dashboard to the passed
// category
export function addToCategory(dash, categoryObj, savedVisualizations) {
  savedVisualizations.get(categoryObj.id).then(function (newVisual) {

    // prepare dashboard object with title and id.
    const dashboardObj = {};
    dashboardObj.id = dash.id;
    dashboardObj.title = dash.title;

    // Find if this dashboard already in category... this happens when we save
    // some other dashboard and overwrite it with this name...
    let dashboardAdded = false;
    let index = newVisual.visState.params.dashboards.length;
    while (index--) {
      const entry = newVisual.visState.params.dashboards[index];

      if (entry.searchString !== '' || entry.useCurrentTime) {
        // This is a specific entry added by user. We do not consider this.
        continue;
      }
      if((entry.dashboard.id === dashboardObj.id) && (entry.dashboard.title === dashboardObj.title)) {
        dashboardAdded = true;
      }
      // If dashboard id is same and title is different with existing dashboard object
      // it removes dashboard object from category and saves with new dashboard object
      // having same id and updated title.
      else if ((entry.id === dashboardObj.id) && (entry.title !== dashboardObj.title)) {
        newVisual.visState.params.dashboards.splice(index, 1);
      }
    }

    // Add the dashboard object to the list if its not already exist..
    if (!dashboardAdded) {
      const dashboardEntry = {
        label: dashboardObj.title,
        searchString: '',
        useCurrentTime: false,
        dashboard: dashboardObj
      };
      newVisual.visState.params.dashboards.push(dashboardEntry);
      newVisual.save().then(function () {
        // Nothing needs to be done..
      }).catch(error => {
        notify.error(error);
      });
    }
  }).catch(error => {
    notify.error(error);
  });
}


// This function is called to remove the passed dashboard from the
// passed category
export function removeFromCategory(dash, categoryObj, savedVisualizations) {
  savedVisualizations.get(categoryObj.id).then(function (newVisual) {
    // Check if the visState is available, if not, it means it does
    // not exist
    if (newVisual.visState) {
      let index = newVisual.visState.params.dashboards.length;
      let changed = false;
      while (index--) {
        const entry = newVisual.visState.params.dashboards[index];

        if (entry.searchString !== '' || entry.useCurrentTime) {
          // This is an specific entry added by user. We do not consider this.
          continue;
        }
        if(entry.dashboard.id === dash.id) {
          newVisual.visState.params.dashboards.splice(index, 1);
          changed = true;
        }
      }

      if (changed) {
        newVisual.save().then(function () {
        // Nothing needs to be done..
        }).catch(error => {
          notify.error(error);
        });
      }
    }
  }).catch(error => {
    notify.error(error);
  });
}

//This function is to delete the dashboard id in category object
export function deleteDash(
  Private,
  selectedIds,
  savedVisualizations,
  savedDashboards,
  dashboardService,
  fetchItems,
  deselectAll,
  notify,
  $http) {
  // deletes all selected dashboards
  Promise.map(selectedIds, function (id) {
    return savedDashboards.get(id).then(function () {
      return dashboardService.delete(id).then(fetchItems)
        .then(() => {
          deselectAll();
          logUserOperationForDeleteMultipleObjects($http, selectedIds, 'dashboard');
        })
        .catch(error => notify.error(error));
    })
      .catch(function () {
        notify.error('Failed in delete dashboard');
      });
  }).then(function () {

    const savedObjectsClient = Private(SavedObjectsClientProvider);
    return savedObjectsClient.find({
      type: 'visualization',
      fields: [],
      search: 'category',
      perPage: 1000
    }).then(results => {

      _.each(results.savedObjects, function (obj) {

        let changed = false;

        if(obj.attributes.visState) {
          const visual = JSON.parse(obj.attributes.visState);
          if (visual.type === 'category') {

            let index = visual.params.dashboards.length;
            while (index--) {
              let idIndex = 0;
              let dashboardId = 0;
              const entry = visual.params.dashboards[index];
              for (idIndex = 0; idIndex < selectedIds.length; idIndex++) {
                dashboardId = selectedIds[idIndex];
                if (dashboardId === entry.dashboard.id) {
                  visual.params.dashboards.splice(index, 1);
                  changed = true;
                }
              }
            }

            if (changed) {
              obj.attributes.visState = JSON.stringify(visual);
              return obj.save();
            }
          }
        }
      });
    });
  });
}

export function updateDashboardInCategory(dash, categoryObj, savedVisualizations, oldCategory) {
  // If this dashboard had a category and the category is now
  // changed, we need to remove the dashboard from old category
  // and add it in the new category.. This also takes care
  // of a case where dashboard category does not exist so
  // someone is changing it

  if (oldCategory.id !== categoryObj.id) {
    // Remove it from older category
    removeFromCategory(dash, oldCategory, savedVisualizations);
    // Add it to the new category..
    addToCategory(dash, categoryObj, savedVisualizations);
  } else {
    // If existing dashboard is saving with different title
    // in same category. We are calling this function to update
    // the category object with updated dashboard title.
    addToCategory(dash, categoryObj, savedVisualizations);
  }
}
