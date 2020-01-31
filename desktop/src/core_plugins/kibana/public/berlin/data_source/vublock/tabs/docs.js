import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import '../styles/vublock.less';
import { toCamelWithSpaces } from 'ui/utils/vunet_snake_to_camel_with_space';
import { VuBlockConstants } from '../vu_block_constants';

// This directive takes care of displaying docs information
app.directive('vuBlockDocs', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockDocs',
    controller: vuBlockDocs,
  };
});

function vuBlockDocs($scope,
  StateService
) {

  // docs meta data
  $scope.docsMeta = {
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
    inverted: false,
    useBoxShadowForTable: false,
  };

  // Callback function to fetch docs information
  $scope.fetchItems = () => {
    return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'doc').then(function (data) {
      if (data.docs && data.docs.length) {

        // Identify the columns and prepare the meta data
        // (rows and headers) for vunet table component.
        const firstObj = data.docs[0];

        // Exclude columns that should be displayed in the table
        const filteredKeys = Object.keys(firstObj)
          .filter(key => (VuBlockConstants.DOCS_IGNORE_KEY_LIST.indexOf(key) === -1));
        $scope.docsMeta.rows = filteredKeys;
        filteredKeys.map(item => {

          // Make the headers more readable by using the utility
          // function to convert snake case to camel case with spaces.
          $scope.docsMeta.headers.push(toCamelWithSpaces(item));
        });
      }
      return data.docs;
    });
  };

}
