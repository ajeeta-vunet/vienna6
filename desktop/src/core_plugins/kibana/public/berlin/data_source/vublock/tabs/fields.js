import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import '../styles/vublock.less';
import { VuBlockConstants } from '../vu_block_constants';
import { toCamelWithSpaces } from 'ui/utils/vunet_snake_to_camel_with_space';

// This directive takes care of displaying fields information
app.directive('vuBlockFields', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockFields',
    controller: vuBlockFields,
    scope: true
  };
});

function vuBlockFields($scope,
  StateService
) {

  // Fields meta data
  $scope.fieldsMeta = {
    inverted: false,
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
    useBoxShadowForTable: false,
  };

  // Callback function to fetch fields information
  $scope.fetchFieldItems = () => {
    return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'field').then(function (data) {
      if (data.fields && data.fields.length) {

        // Identify the columns and prepare the meta data
        // (rows and headers) for vunet table component.
        const firstObj = data.fields[0];
        const filteredKeys = Object.keys(firstObj)
          .filter(key => (VuBlockConstants.FIELDS_IGNORE_KEY_LIST.indexOf(key) === -1));
        $scope.fieldsMeta.rows = filteredKeys;
        filteredKeys.map(item => {

          // Make the headers more readable by using the utility
          // function to convert snake case to camel case with spaces.
          $scope.fieldsMeta.headers.push(toCamelWithSpaces(item));
        });
      }
      return data.fields;
    });
  };

}
