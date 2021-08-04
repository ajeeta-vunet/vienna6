import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import { Notifier } from 'ui/notify';
import { Sources } from './components/SourcesTab/Sources';
import { GetStarted } from '../vublock_store/components/GetStartedTab/GetStarted';
import { DocTitleProvider } from 'ui/doc_title';
import { VunetSidebarConstants } from 'ui_framework/src/vunet_components/vunet_sidebar/vunet_sidebar_constants';
import './tabs/fields';
import './tabs/alert_rules';
import './tabs/get_started';
import './tabs/map';
import './tabs/golden_signals';
import './tabs/storyboards';
import './tabs/sources';
import './tabs/logical_sources';

// GetStarted react component
app.directive('getStarted', (reactDirective) => {
  return reactDirective(GetStarted, [
    'vuBlockId'
  ]);
});

// Sources react component
app.directive('sources', (reactDirective) => {
  return reactDirective(Sources, [
    'vuBlockId',
    'downloadImportErrors',
    'exportDataSources',
    'buttonCallback',
  ]);
});

// This directive is used to display detailed information
// of a vuBlock
app.directive('vuBlockDetails', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockDetails',
    controller: vuBlockDetails,
  };
});

app.filter('unsafe', function ($sce) { return $sce.trustAsHtml; });

function vuBlockDetails($scope,
  $http,
  StateService,
  $route,
  Private
) {

  const notify = new Notifier();
  // Set the id of the selected tab to display its
  // contents
  $scope.onTabChange = function (id) {
    $scope.id = id;
  };

  function init() {
    const docTitle = Private(DocTitleProvider);
    docTitle.change(VunetSidebarConstants.VUBLOCK);

    // Get the resolved data required by the control
    // from route.current.locals
    $scope.vuBlock = $route.current.locals.vuBlock;
    $scope.vuBlockId = $scope.vuBlock.id;
    $scope.vuBlockStatus = $scope.vuBlock.status;

    // If the status of vuBlock is enabled, we dispay
    // a button to disable the vublock and vice versa.
    if ($scope.vuBlockStatus === 'Enabled') {
      $scope.vuBlockStatusButtonText = 'Disable';
    } else {
      $scope.vuBlockStatusButtonText = 'Enable';
    }

    // Get the tags to be shown for the vuBlock
    $scope.vuBlockTags = $scope.vuBlock.tags;

    // Prepare the tabs list from the response received.
    $scope.tabs = [
      { id: 'get_started', name: 'Get Started' },
      { id: 'storyboards', name: 'Storyboards' },
      { id: 'sources', name: 'Sources' },
      { id: 'fields', name: 'Fields' },
      { id: 'golden_signals', name: 'Golden Signals' },
      { id: 'alert_rules', name: 'Alert Rules' },
    ];

    $scope.showModal = false;
    $scope.modalData = {};
    $scope.modalData.isForm = false;
    // Set the landing tab to be displayed when
    // this page loads.
    $scope.landingTab = 'get_started';
    $scope.id = 'get_started';

    // Use white color as background color for tabs
    $scope.tabStyle = {
      backgroundColor: '#fff'
    };
  }

  // This function updates the vuBlock state from 'Enabled' to
  // 'Disabled' and vice versa.
  $scope.changeVuBlockStatus = function () {
    // If the vuBlock is in 'Enabled' state, The vuBlock button will
    // show the next action possible: Disable.
    // If the vuBlock is in 'Disabled' state,
    // the next action possible: Enable.
    // When 'Enable/Disable' button is clicked we make a back end call
    // with the next state of vuBlock as request data.
    const status = $scope.vuBlockStatusButtonText;
    if (status === 'Disable') {
      $scope.vuBlockStatus = { status: 'Disabled' };
    } else {
      $scope.vuBlockStatus = { status: 'Enabled' };
    }
    // When the api call is successful then we toggle
    // the button text and vuBlock state.
    StateService.updateVuBlockStatus($scope.vuBlock.id, $scope.vuBlockStatus).then(function () {
      if (status === 'Disable') {
        $scope.vuBlockStatusButtonText = 'Enable';
        $scope.vuBlock.status = 'Disabled';
      } else {
        $scope.vuBlockStatusButtonText = 'Disable';
        $scope.vuBlock.status = 'Enabled';
      }
    }).catch(function (e) {
      notify.error(e);
    });
  };

  // This function is called when the 'enable'/'disable'
  // button is clicked
  $scope.handleVuBlockStatus = () => {
    if ($scope.vuBlockStatusButtonText === 'Disable') {
      $scope.modalData.title = `Disable ${$scope.vuBlock.name} ?`;
      $scope.modalData.message = `<div class="vublock-modal-message"> Are you sure you
      want to disable ${$scope.vuBlock.name}  ? This disables the data pipeline,
      storyboards and alerts associated with it </div>`;
    } else {
      $scope.modalData.title = 'Enable ' + $scope.vuBlock.name + ' ?';
      $scope.modalData.message = `<div class="vublock-modal-message"> Are you sure
       you want to enable ${$scope.vuBlock.name} ? This enables the data
       pipeline to receive ${$scope.vuBlock.name} metrics and load the
       storyboards / alert rules </div>`;
    }
    $scope.showModal = true;
  };


  // Close the modal
  $scope.onModalClose = () => {
    $scope.showModal = false;
  };

  // This is called on modal submit..
  $scope.onModalSubmit = () => {
    $scope.showModal = false;
    $scope.changeVuBlockStatus();
  };

  init();
}
