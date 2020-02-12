import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import '../styles/vublock.less';
import { VuBlockConstants } from '../vu_block_constants';
import { toCamelWithSpaces } from 'ui/utils/vunet_snake_to_camel_with_space';

// This directive takes care of displaying golden signals information
app.directive('vuBlockGoldenSignals', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockGoldenSignals',
    controller: vuBlockGoldenSignals,
  };
});

function vuBlockGoldenSignals($scope,
  StateService
) {


  // goldenSignals meta data
  $scope.goldenSignalsMeta = {
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

  // Callback function to fetch golden signals information
  $scope.fetchItems = () => {
    return StateService.getvuBlockTabDetails($scope.vuBlock.id, 'goldensignal').then(function (data) {

      // Identify the columns and prepare the meta data
      // (rows and headers) for vunet table component.
      if (data.golden_signals && data.golden_signals.length) {
        const firstObj = data.golden_signals[0];
        const filteredKeys = Object.keys(firstObj)
          .filter(key => (VuBlockConstants.GOLDEN_SIGNALS_IGNORE_KEY_LIST.indexOf(key) === -1));
        $scope.goldenSignalsMeta.rows = filteredKeys;
        filteredKeys.map(item => {

          // Make the headers more readable by using the utility
          // function to convert snake case to camel case with spaces.
          $scope.goldenSignalsMeta.headers.push(toCamelWithSpaces(item));
        });
      }
      return data.golden_signals;
    });
  };

}
