import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import { Notifier } from 'ui/notify';

import './tabs/fields';
import './tabs/alert_rules';
import './tabs/docs';
import './tabs/map';
import './tabs/golden_signals';
import './tabs/storyboards';
import './tabs/sources';

// This directive is used to display detailed information
// of a vuBlock
app.directive('vuBlockDetails', function () {
  return {
    restrict: 'E',
    controllerAs: 'vuBlockDetails',
    controller: vuBlockDetails,
  };
});

function vuBlockDetails($scope,
  $http,
  StateService,
  $route
) {

  const notify = new Notifier();
  // Set the id of the selected tab to display its
  // contents
  $scope.onTabChange = function (id) {
    $scope.id = id;
  };

  function init() {

    // Get the resolved data required by the control
    // from route.current.locals
    $scope.vuBlock = $route.current.locals.vuBlock;
    $scope.vuBlockStatus = $scope.vuBlock.status;

    // If the status of vuBlock is active, we dispay
    // a button to deactivate the vublock and vice versa.
    if ($scope.vuBlockStatus === 'Active') {
      $scope.vuBlockStatusButtonText = 'Deactivate';
    } else {
      $scope.vuBlockStatusButtonText = 'Activate';
    }

    // Get the tags to be shown for the vuBlock
    $scope.vuBlockTags = $scope.vuBlock.tags && $scope.vuBlock.tags.toString();

    // Prepare the tabs list from the response received.
    $scope.tabs = [
      { id: 'storyboards', name: 'Storyboards' },
      { id: 'sources', name: 'Sources' },
      { id: 'fields', name: 'Fields' },
      { id: 'golden_signals', name: 'Golden Signals' },
      { id: 'alert_rules', name: 'Alert Rules' },
      { id: 'docs', name: 'Docs' },
    ];

    // Set the landing tab to be displayed when
    // this page loads.
    $scope.landingTab = 'storyboards';
    $scope.id = 'storyboards';
  }

  // This function updates the vuBlock state from 'Active' to
  // 'Inactive' and vice versa.
  $scope.changeVuBlockStatus = function () {

    // If the vuBlock is in 'Active' state, The vuBlock button will
    // show the next action possible: Deactivate.
    // When 'Deactivate' button is clicked we make a back end call
    // with the next state of vuBlock as request data.
    if ($scope.vuBlockStatusButtonText === 'Deactivate') {
      $scope.vuBlockStatus = { status: 'Inactive' };
    } else {

      // If the vuBlock is in 'Inactive' state, The vuBlock button will
      // show the next action possible: Activate.
      // When 'Activate' button is clicked we make a back end call
      // with the next state of vuBlock as request data.
      $scope.vuBlockStatus = { status: 'Active' };
    }

    // When the api call is successful then we toggle
    // the button text and vuBlock state.
    StateService.updateVuBlockStatus($scope.vuBlock.id, $scope.vuBlockStatus).then(function () {
      if ($scope.vuBlockStatusButtonText === 'Deactivate') {
        $scope.vuBlockStatusButtonText = 'Activate';
        $scope.vuBlock.status = 'Inactive';
      } else {
        $scope.vuBlockStatusButtonText = 'Deactivate';
        $scope.vuBlock.status = 'Active';
      }
    }).catch(function (e) {
      notify.error(e);
    });
  };

  init();
}
