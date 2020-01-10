import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import '../styles/vublock.less';
import { VuBlockConstants } from '../vu_block_constants';
import { toCamelWithSpaces } from 'ui/utils/vunet_snake_to_camel_with_space';

// This directive takes care of displaying alert rule details
app.directive('vuBlockAlertRules', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockAlertRules',
    controller: vuBlockAlertRules,
    scope: true
  };
});

function vuBlockAlertRules($scope,
  $http,
  $window,
  StateService
) {

  // Alert rules meta data
  $scope.alertRulesMeta = {
    headers: [],
    rows: [],
    id: '',
    add: false,
    edit: false,
    selection: false,
    search: true,
    tableAction: [],
    default: {},
    forceUpdate: false,
    inverted: false
  };

  // Callback function to fetch alert rules information
  $scope.fetchItems = () => {
    return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'alertrule').then(function (data) {
      if (data.alert_rules && data.alert_rules.length) {

        // Identify the columns and prepare the meta data
        // (rows and headers) for vunet table component.
        const firstObj = data.alert_rules[0];

        // Exclude columns that should be displayed in the table
        const filteredKeys = Object.keys(firstObj)
          .filter(key => (VuBlockConstants.ALERT_RULES_IGNORE_KEY_LIST.indexOf(key) === -1));
        $scope.alertRulesMeta.rows = filteredKeys;
        filteredKeys.map(item => {

          // Make the headers more readable by using the utility
          // function to convert snake case to camel case with spaces.
          $scope.alertRulesMeta.headers.push(toCamelWithSpaces(item));
        });
      }
      return data.alert_rules;
    });
  };

}
