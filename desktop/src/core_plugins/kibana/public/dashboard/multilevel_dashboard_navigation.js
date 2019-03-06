import _ from 'lodash';
import { SavedObjectsClientProvider } from 'ui/saved_objects';
import { getDashboardsForCategory } from 'ui/utils/link_info_eval.js';

// This function is used to create the multi level
// drop down having the categories and the dashboards
// under them. We prepare a json structure as shown below.
// The json object will have list of category object with
// the following properties:

// title:    Name of the category
// url:    Not applicable (We do not support any navigation
//          when clicked on a link. We set it to '#')
// subtree: This is another list object having all the dashboard
//          objects. Each dashboard object will again have a name
//          and link properties.

// $scope.subMenuTree = [{
//   title: "Servers",
//   url: "#",
//   subtree: [{
//     title: "Dash1",
//     url: "#"
//   },{
//     title: "Dash2",
//     url: "#"
//   },{
//     title: "Dash3",
//     url: "#"
//   }]
// },
// {
//   title: "Alerts",
//   url: "#",
//   subtree: [{
//     title: "Dash1",
//     url: "#"
//   }]
// }];

export function prepareMultilevelCategoryDropdown(Private, timefilter, Promise, categories) {
  const savedObjectsClient = Private(SavedObjectsClientProvider);

  // Prepare a list of category objects having the following properties
  // title: Name of the category.
  // url: Not applicable.
  // subtree: A list of dashboard under each category.
  return Promise.map(categories, function (category) {
    return savedObjectsClient.get('visualization', category.id)
      .then(function (ctg) {
        if (_.has(ctg.attributes, 'visState')) {
          const visStateObj = JSON.parse(ctg.attributes.visState);

          // Our es query to fetch all the category might return
          // visualisations with string 'category' in visualisaton name.
          // In order to get only category vis we have added a check for type.
          if (visStateObj.type === 'category') {
            const categoryDict = {};
            categoryDict.title = category.title;
            categoryDict.url = '#';

            // For each category, We get the dashboards if they exist.
            const categoryDashboards = getDashboardsForCategory(Private, timefilter, visStateObj.params.dashboards);

            // Attach the property 'subtree' only if there
            // are dashboards for this category
            if (categoryDashboards.length > 0) {
              categoryDict.subtree = categoryDashboards;
            }
            return categoryDict;
          }
        }
      })
      .catch(() => '');
  });
}
