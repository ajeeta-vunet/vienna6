
const app = require('ui/modules').get('kibana/business_metric_vis', ['kibana', 'kibana/courier']);
const _ = require('lodash');

// This directive is used to display the aggregations configurations
// section
app.directive('aggregations', function (courier, $filter, Promise) {
  return {
    restrict: 'EA',
    scope: {
      vis: '=',
    },
    template: require('plugins/business_metric_vis/directives/aggregations.html'),
    link: function (scope) {

      // Update the aggregation fields when any of the metric
      // index is changed
      scope.$watch('vis.params.metrics', function () {

        // List to store only unique indices out of
        // all the indices configured in BM metrics.
        const uniqueIndexList = [];

        // List used to maintain flags set at UI level.
        scope.operAggList = [];

        // Get unique indices from metrics configured in BM.
        _.each(scope.vis.params.metrics, function (metric) {
          if (metric.index !== undefined && !_.includes(uniqueIndexList, metric.index.id)) {
            uniqueIndexList.push(metric.index.id);
          }
        });

        // Get index fields for all the indices in uniqueIndexList.
        // This will provide a sample output as shown below:
        // [
        //  [fieldObj1, fieldObj2...],
        //  [fieldObj1, fieldObj2...],
        // ]
        Promise.map(uniqueIndexList, function (indexId) {
          return courier.indexPatterns.get(indexId).then(function (data) {
            let fields = data.fields.raw;
            fields = $filter('filter')(fields, { aggregatable: true });
            return fields.slice(0);
          })
            .catch(function () {
              return [];
            });
        }).then(function (fieldsArray) {

          // Get the common fields among all the
          // metric index fields.
          scope.intersectionList = [];
          let maxIterCount = 0;
          let smallArrIndex = 0;
          let smallArr = [];

          // Get the array with least number of elements
          // by iterating over fieldsArray and calculating the
          // length of each array.
          fieldsArray.forEach((arr, index) => {
            if (index === 0) {

              // maxIterCount: This will have the array with least
              // number of field objects.
              maxIterCount = arr.length;
            } else {

              // get the maxIterCount and the array with
              // least number of elements
              if (arr.length < maxIterCount) {
                maxIterCount = arr.length;

                // smallArrIndex: In the list of arrays(fieldsArray)
                // This is the index of the array with least number
                // of objects.
                smallArrIndex = index;
              }
            }
          });

          // smallArr: This is the array with least number of
          // objects.
          smallArr = fieldsArray.splice(smallArrIndex, 1)[0];

          // This function checks if the given item has any fields
          // that exists in smallArr.
          const checkForItemInSmallArray = function (item) {
            return fieldsArray[item].find(a => a.name === smallArr[maxIterCount - 1].name);
          };

          // Iterate over the array with least number of objects
          // and find the intersection of list of arrays( fieldsArray)
          while (maxIterCount) {
            let foundMatch = true;

            // Iterate over fieldsArray for each item in smallArray starting
            // form last item in array. Check if the item in smallArr is present
            // in all the arrays in fieldsArray. If item does not exist  in the
            // array set 'foundMatch' to false and skip rest of the arrays.
            for (let item = 0; item < fieldsArray.length; item = item + 1) {
              const found = checkForItemInSmallArray(item);
              if (!found) {
                foundMatch = false;
                break;
              }
            }

            // If the value of foundMatch is still true, it implies that
            // the item in smallArr exists in all the arrays in fields array.
            // Push this item in intersectionList.
            if (foundMatch) {
              scope.intersectionList.push(smallArr[maxIterCount - 1]);
            }

            // Decreament the index of smallArr
            maxIterCount--;
          }
        });
      }, true);

      // Add a bucket.
      scope.addBucket = function () {
        // Set the bucket size to 3 by default.
        const dataObj = { field: '', fieldType: '', size: 3, customLabel: '' };
        scope.vis.params.aggregations.push(dataObj);
        scope.operAggList.push({ expanded: false });

      };

      // This will be called when the aggregation field
      // shown in the select box is changed.
      scope.updateBucketFieldName = function (index) {
        // Get the field object using the field name
        _.each(scope.intersectionList, function (field) {
          if (scope.vis.params.aggregations[index].field === field.name) {
            scope.vis.params.aggregations[index].fieldType = field.type;
            if (field.type === 'date') {
              // Set default values
              scope.vis.params.aggregations[index].interval = 'hourly';
              scope.vis.params.aggregations[index].customInterval = '2h';
            }
            return;
          }
        });
      };

      // Delete a bucket configured.
      scope.removeBucket = function (index) {
        scope.vis.params.aggregations.splice(index, 1);
      };

      // This will move element inside array
      // from old position to new position.
      function move(arr, oldIndex, newIndex) {
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        return arr;
      }

      // Move aggregation field one position above the
      // current position. The move up
      // button on top most aggregation is disabled in html.
      scope.moveUp = function (index) {
        move(scope.vis.params.aggregations, index, index - 1);
      };

      // Move a aggregation field one position below the
      // current position.The move down button on
      // bottom most aggregation is disabled in html.
      scope.moveDown = function (index) {
        move(scope.vis.params.aggregations, index, index + 1);
      };
    }
  };
});
