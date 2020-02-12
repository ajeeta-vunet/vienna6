import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import '../styles/vublock.less';
import { VuBlockConstants } from '../vu_block_constants';
import { toCamelWithSpaces } from 'ui/utils/vunet_snake_to_camel_with_space';

// This directive takes care of displaying storyboards information
app.directive('vuBlockStoryboards', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockStoryboards',
    controller: vuBlockStoryboards,
  };
});

function vuBlockStoryboards($scope) {

  // storyboards meta data
  $scope.storyboardsMeta = {
    headers: [],
    rows: [],
    id: '',
    add: false,
    edit: false,
    selection: false,
    search: true,
    tableAction: [],
    default: {},
    forceUpdate: false
  };

  if ($scope.vuBlock.story_boards && $scope.vuBlock.story_boards.length) {

    // Identify the columns and prepare the meta data
    // (rows and headers) for vunet table component.
    const firstObj = $scope.vuBlock.story_boards[0];
    const filteredKeys = Object.keys(firstObj)
      .filter(key => (VuBlockConstants.STORYBOARDS_IGNORE_KEY_LIST.indexOf(key) === -1));
    $scope.storyboardsMeta.rows = filteredKeys;
    filteredKeys.map(item => {

      // Make the headers more readable by using the utility
      // function to convert snake case to camel case with spaces.
      $scope.storyboardsMeta.headers.push(toCamelWithSpaces(item));
    });
  }

  // Callback function to fetch storyboards information
  $scope.fetchItems = function () {
    return Promise.resolve($scope.vuBlock.story_boards);
  };

}
