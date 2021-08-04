import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './styles/_index.less';
import './partials/vublock_section';
import 'react-toggle/style.css';
import { VuBlockConstants } from './vu_block_constants';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui_framework/src/vunet_components/vunet_sidebar/vunet_sidebar_constants';
import importvublockPopupTemplate from './import_vublock_popup.html';

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
  $uibModal,
  Private
) {

  // Flags to show or hide vuBlocks based on their
  // type (Logical / Component )
  $scope.enableComponentVuBlocks = false;
  $scope.enableLogicalVuBlocks = false;
  $scope.showLogicalVuBlocks = true;
  $scope.showComponentVuBlocks = true;

  // Flags to show or hide 'Enabled' and 'Disabled'
  // vublocks
  $scope.showEnabledVuBlocks = false;
  $scope.showDisabledVuBlocks = false;

  // This function handles the case when Enabled and Disabled
  // filters are toggled.
  const handleEnabledDisabledFilters = () => {
    if ($scope.showEnabledVuBlocks === true &&
      $scope.showDisabledVuBlocks === false) {
      $scope.logicalVuBlockList = $scope.logicalVuBlockList.filter(vuBlock => {
        return vuBlock.status === 'Enabled';
      });
      $scope.componentVuBlockList = $scope.componentVuBlockList.filter(vuBlock => {
        return vuBlock.status === 'Enabled';
      });
    } else if ($scope.showEnabledVuBlocks === false &&
      $scope.showDisabledVuBlocks === true) {
      $scope.logicalVuBlockList = $scope.logicalVuBlockList.filter(vuBlock => {
        return vuBlock.status === 'Disabled';
      });
      $scope.componentVuBlockList = $scope.componentVuBlockList.filter(vuBlock => {
        return vuBlock.status === 'Disabled';
      });
    } else if ($scope.showEnabledVuBlocks === false &&
      $scope.showDisabledVuBlocks === false) {
      $scope.logicalVuBlockList = $scope.logicalVuBlockListCopy;
      $scope.componentVuBlockList = $scope.componentVuBlockListCopy;
    } else {
      $scope.logicalVuBlockList = $scope.logicalVuBlockListCopy;
      $scope.componentVuBlockList = $scope.componentVuBlockListCopy;
    }
  };

  // This function gets called when the 'Enabled' filter
  // next to search bar is toggled.
  $scope.onToggleEnabledVuBlock = () => {
    handleEnabledDisabledFilters();
  };

  // This function gets called when the 'Disabled' filter
  // next to search bar is toggled.
  $scope.onToggleDisabledVuBlock = () => {
    handleEnabledDisabledFilters();
  };

  // This function handles the case when 'Touch point' and 'Logical'
  // filters are toggled.
  const handleVuBlockTypeFilters = () => {
    if ($scope.enableComponentVuBlocks === true && $scope.enableLogicalVuBlocks === false) {
      $scope.showComponentVuBlocks = true;
      $scope.showLogicalVuBlocks = false;

    } else if ($scope.enableComponentVuBlocks === false && $scope.enableLogicalVuBlocks === true) {
      $scope.showLogicalVuBlocks = true;
      $scope.showComponentVuBlocks = false;

    } else if ($scope.enableComponentVuBlocks === true && $scope.enableLogicalVuBlocks === true) {
      $scope.showLogicalVuBlocks = true;
      $scope.showComponentVuBlocks = true;

    } else {
      $scope.showLogicalVuBlocks = true;
      $scope.showComponentVuBlocks = true;
    }
  };

  // This function is used to show / hide Component section
  // based on users action on 'Component Blocks' filter
  $scope.onToggleComponentVuBlock = () => {
    handleVuBlockTypeFilters();
  };

  // This function is used to show / hide Logical Blocks section
  // based on users action on 'Logical Blocks' filter
  $scope.onToggleLogicalVuBlock = () => {
    handleVuBlockTypeFilters();
  };

  // This function exports the selected vublocks into a json file.
  $scope.exportVublock = () => {
    return StateService.exportvuBlock([]).then(() => {
      return Promise.resolve(true);
    }, function () {
      return Promise.resolve(false);
    });
  };

  // When the import button is clicked, we show a pop up where user
  // can choose a json file containing the vublock data.
  $scope.importVublock = () => {
    $uibModal.open({
      animation: true,
      template: importvublockPopupTemplate,
      controller: 'importvublockPopupCtrl',
      resolve: {
        vublockList: function () {
          return [];
        },
        importType: function () {
          return 'vublock';
        },
        vuBlockId: function () {
          return '';
        }
      }
    }).result.then(function () {
    }, function () {
    });
  };

  function init() {
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.VUBLOCK);

    // Get the the list of vuBlocks configured in
    // the system
    StateService.getvuBlockList().then(function (data) {
      $scope.vuBlockListItems = data;

      // Get all vuBlocks of type 'LogicalBlock'.
      $scope.logicalVuBlockList = $scope.vuBlockListItems.filter(vuBlock => {
        return vuBlock.type === VuBlockConstants.LOGICAL_BLOCK_TYPE;
      });

      // Get all vuBlocks of type 'Component'.
      $scope.componentVuBlockList = $scope.vuBlockListItems.filter(vuBlock => {
        return vuBlock.type === VuBlockConstants.COMPONENT_BLOCK_TYPE;
      });

      // Get all 'Disabled' vublocks.
      $scope.disabledVuBlockList = $scope.vuBlockListItems.filter(vuBlock => {
        return vuBlock.status === 'Disabled';
      });

      // Get all 'Enabled' vublocks.
      $scope.enabledVuBlockList = $scope.vuBlockListItems.filter(vuBlock => {
        return vuBlock.status === 'Enabled';
      });

      // Get the count of vublocks which will be used to display
      // with filters.
      $scope.logicalVuBlockCount = $scope.logicalVuBlockList.length;
      $scope.componentVuBlockCount = $scope.componentVuBlockList.length;
      $scope.disabledVuBlockCount =  $scope.disabledVuBlockList.length;
      $scope.enabledVuBlockCount = $scope.enabledVuBlockList.length;

      // Keep a copy to get all vuBlocks when the 'Enabled' filter
      // next to search bar is turned off and on.
      $scope.logicalVuBlockListCopy = JSON.parse(JSON.stringify($scope.logicalVuBlockList));
      $scope.componentVuBlockListCopy = JSON.parse(JSON.stringify($scope.componentVuBlockList));
    });
  }

  init();
}
