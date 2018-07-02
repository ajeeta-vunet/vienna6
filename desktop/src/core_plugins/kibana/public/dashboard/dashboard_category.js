import _ from 'lodash';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { DashboardConstants } from 'plugins/kibana/dashboard/dashboard_constants';
import { Notifier } from 'ui/notify';
const Promise = require('bluebird');
import angular from 'angular';
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
    _.each(newVisual.visState.params.dashboards, function (dashboardData) {
      if((dashboardData.id === dashboardObj.id) && (dashboardData.title === dashboardObj.title)) {
        dashboardAdded = true;
      }
    });

    // Add the dashboard object to the list if its not already exist..
    if (!dashboardAdded) {
      newVisual.visState.params.dashboards.push(dashboardObj);
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


// This function is called to removed the passed dashboard from the
// passed category
export function removeFromCategory(dash, categoryObj, savedVisualizations) {
  savedVisualizations.get(categoryObj.id).then(function (newVisual) {
    // Check if the visState is available, if not, it means it does
    // not exist
    if (newVisual.visState) {
      const dashboardId = dash.id;
      // Removed the dashboard object from the list
      newVisual.visState.params.dashboards = _.without(
        newVisual.visState.params.dashboards, _.findWhere(
          newVisual.visState.params.dashboards, { id: dashboardId }));
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

//This function is to delete the dashboard id in category object
export function deleteDash(
  selectedIds,
  savedVisualizations,
  savedDashboards,
  dashboardService,
  fetchItems,
  deselectAll,
  notify,
  $http) {
  const categoryList = [];
  // deletes all selected dashboards
  Promise.map(selectedIds, function (id) {
    return savedDashboards.get(id).then(function (dashboard) {
      const optionsJSONObj = angular.fromJson(dashboard.optionsJSON);
      categoryList.push([optionsJSONObj, id]);
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
    /* Creates a dictionary having unique category id and list of
     * dashboards which belongs to the categoryObj
     * { c1 : [d1,d2],
     *   c2 : [d3,d4],
     *  ..
        } */
    const parentResultCategory = {};
    _.each(categoryList, function (category) {
      const key = category[0].category.id;
      if(!(key in parentResultCategory)) {
        parentResultCategory[key] = [];
      }
      parentResultCategory[key].push(category[1]);
    });

    // Iterate on dict and deletes all dashboards belongs
    // to each category
    for (const resultCategory in parentResultCategory) {
      if(parentResultCategory.hasOwnProperty(resultCategory)) {
        savedVisualizations.get(resultCategory).then(function (visual) {
          _.each(parentResultCategory[resultCategory], function (dashboardId) {
            visual.visState.params.dashboards = _.without(
              visual.visState.params.dashboards, _.findWhere(
                visual.visState.params.dashboards, { id: dashboardId }));
          });
          return visual.save();
        });
      }
    }
  });
}

export function dashboardVisualization(dash, categoryObj, savedVisualizations, oldCategory) {
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
  }
}
