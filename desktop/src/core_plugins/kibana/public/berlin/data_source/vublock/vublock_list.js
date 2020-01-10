import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './styles/vublock.less';
import './partials/vublock_section';
import 'react-toggle/style.css';
import { VuBlockConstants } from './vu_block_constants';

// This directive displays the list of vuBlocks
// configured in the system
app.directive('vuBlockList', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockList',
    controller: vuBlockList,
  };
});

function vuBlockList($scope,
  $http,
  StateService,
) {

  // Flag to show or hide vuBlocks based on their
  // state (Active / Inactive )
  $scope.showActivatedVuBlocks = true;

  // Flags to show or hide vuBlocks based on their
  // type (Logical / Touchpoint )
  $scope.showTouchPointVuBlocks = true;
  $scope.showLogicalVuBlocks = true;

  // This function gets called when the 'Active' filter
  // next to search bar is toggled.
  $scope.onToggleActivateVuBlock = () => {
    $scope.showActivatedVuBlocks = !$scope.showActivatedVuBlocks;

    // When 'Active' filter is turned off, display only the
    // 'Inactive' vublocks
    if ($scope.showActivatedVuBlocks === false) {
      $scope.logicalVuBlockList = $scope.logicalVuBlockList.filter(vuBlock => {
        return vuBlock.status === 'Inactive';
      });
      $scope.touchPointVuBlockList = $scope.touchPointVuBlockList.filter(vuBlock => {
        return vuBlock.status === 'Inactive';
      });
    } else {
      $scope.logicalVuBlockList = $scope.logicalVuBlockListCopy;
      $scope.touchPointVuBlockList = $scope.touchPointVuBlockListCopy;
    }
  };

  // This function is used to show / hide TouchPoint section
  // based on users action on 'Touch Point Blocks' filter
  $scope.onToggleTouchPointVuBlock = () => {
    $scope.showTouchPointVuBlocks = !$scope.showTouchPointVuBlocks;
  };

  // This function is used to show / hide Logical Blocks section
  // based on users action on 'Logical Blocks' filter
  $scope.onToggleLogicalVuBlock = () => {
    $scope.showLogicalVuBlocks = !$scope.showLogicalVuBlocks;
  };

  function init() {

    // Get the the list of vuBlocks configured in
    // the system
    StateService.getvuBlockList().then(function (data) {
      $scope.vuBlockListItems = data;
      // Get all vuBlocks of type 'LogicalBlock'
      $scope.logicalVuBlockList = $scope.vuBlockListItems.filter(vuBlock => {
        return vuBlock.type === VuBlockConstants.LOGICAL_BLOCK_TYPE;
      });

      // Get all vuBlocks of type 'TouchPoint'
      $scope.touchPointVuBlockList = $scope.vuBlockListItems.filter(vuBlock => {
        return vuBlock.type === VuBlockConstants.TOUCHPOINT_BLOCK_TYPE;
      });

      // Keep a copy to get all vuBlocks when the 'Active' filter
      // next to search bar is turned off and on.
      $scope.logicalVuBlockListCopy = JSON.parse(JSON.stringify($scope.logicalVuBlockList));
      $scope.touchPointVuBlockListCopy = JSON.parse(JSON.stringify($scope.touchPointVuBlockList));
    });
  }

  init();
}
