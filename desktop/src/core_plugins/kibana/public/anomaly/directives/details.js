require('ui/courier');
require('bootstrap-timepicker');
require('ui/directives/email_validator.js');

const app = require('ui/modules').get('app/anomaly', [
  'kibana/courier'
]);

app.directive('anomalyDetails', function ($compile, courier, Notifier, $filter) {
  return {
    restrict: 'E',
    require: '^anomalyApp', // must inherit from the anomalyApp
    template: require('plugins/kibana/anomaly/directives/details.html'),
    link: function ($scope) {
      //This will set the indexFields with the fields according to the data source selected.
      //It also takes care of grouping the fields according to their types.
      $scope.setIndexPattern = function () {
        courier.indexPatterns.get($scope.selectedIndex.id).then(function (currentIndex) {
          let fields = currentIndex.fields.raw;
          fields = $filter('filter')(fields, { aggregatable: true });
          $scope.indexFields = fields.slice(0);
        });
      };

      // Initialising the flag used to show error message
      // when valid input is not provided to periodicity
      $scope.isPeriodicityValid = false;

      // show appropriate fields when metric type is changed.
      $scope.updateRuleType = function () {
        if($scope.metric === 'count') {
          $scope.countIsSelected = true;
          $scope.selectedField = undefined;
        }
        else {
          $scope.countIsSelected = false;
        }
      };

      // validates the periodicity value entered. If its
      // invalid we show a error message.
      $scope.validatePeriodicity = function () {
        if($scope.windowSize >= (2 * $scope.periodicity)) {
          $scope.isPeriodicityValid = false;
        }
        else {
          $scope.isPeriodicityValid = true;
        }
      };

      // This is used to reset the fields under advanced
      // settings to '' when it is unchecked.
      $scope.resetAdvancedSettingFields = function () {
        $scope.macroInterval = '';
        $scope.macroIntervalType = '';
        $scope.microInterval = '';
        $scope.microIntervalType = '';
        $scope.timeDuration = '';
        $scope.timeDurationType = '';
      };

      // to add a group by field
      $scope.addNewGroupByField = function () {
        // we need a list of group by fields in this format
        // ['field1', 'field2', field3']
        // To achive this we are initialising dataObj to {data:''}
        // every time this function is called so that we can push the
        // user selected field object into the list.
        // Please note this is run inside a ng-repeat for group by fields
        // in details.html, where the 'data' is populated with the value
        // selected by the user in the front end.
        const dataObj = { data: '' };
        $scope.groupByFieldList.push(dataObj);
      };

      // To delete a group by field
      $scope.removeGroupByField = function (index) {
        $scope.groupByFieldList.splice(index, 1);
      };
    }
  };
});
