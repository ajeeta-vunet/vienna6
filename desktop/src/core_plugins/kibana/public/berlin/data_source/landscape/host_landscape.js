import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './styles/host_landscape.less';
import DownloadAgentTemplate from './download_agent.html';
import DownloadAgentCtrl from './download_agent.controller.js';
// This directive is used to display host information
// configured in the system
app.directive('hostLandscape', function () {
  return {
    restrict: 'E',
    controllerAs: 'hostLandscape',
    controller: hostLandscape,
  };
});


function hostLandscape($scope,
  StateService,
  $modal,
) {

  // Set the initial page size 10 and current page to 1
  $scope.itemsPerPage = '10';
  $scope.noOfRecords = '10';
  $scope.currentPage = 1;

  // Opens the modal popup where the agents and configuration
  // can be downloaded for the selected target in a zip file.
  $scope.DownloadAgentConfig = function (target) {
    $scope.DownloadAgentModalInstance = $modal.open({
      animation: true,
      template: DownloadAgentTemplate,
      controller: DownloadAgentCtrl,
      windowClass: 'download-agnet-modal',
      resolve: {
        // Get the selected target
        target: function () {
          return target;
        },
      }
    });
  };

  // This function gets all the hosts along with the details like
  // data sources, vublocks, data collection methods etc...
  function init() {
    StateService.getHostLandscapeList().then(function (data) {
      $scope.total_targets = data.total_targets;
      $scope.active_targets = data.active_targets;
      $scope.total_sources = data.total_sources;
      $scope.targets = data.targets;
    });
  }

  // This function gets called when the no of records per page
  // list is changed. It receives the number and set accordingly.
  $scope.setItemsPerPage = function (num) {
    if (num === 'All') {
      num = $scope.targets.length;
    }
    $scope.noOfRecords = num;
    $scope.currentPage = 1; //reset to first page
  };

  // This function receives the array and convert it to tab delimitted
  // string
  $scope.concatenateValue = function (value) {
    let concatenatedvalue = '';
    angular.forEach(value, function (item) {
      if (item.data_reception_status === 'INACTIVE' || item.data_reception_status === false || item.active === false) {
        concatenatedvalue = concatenatedvalue + '<span class="cell-badge danger-badge">'
          + item.name + '</span>';
        // concatenatedvalue = concatenatedvalue + '&nbsp' + '<font color="red">' + item.name + '</font>';
      } else if (item.data_reception_status === 'ACTIVE' || item.data_reception_status === true || item.active === true) {
        concatenatedvalue = concatenatedvalue + '<span class="cell-badge success-badge">'
          + item.name + '</span>';
        // concatenatedvalue = concatenatedvalue + '&nbsp' +'<font color="green">' + item.name + '</font>';
      } else if (item.data_reception_status === 'PARTIAL') {
        concatenatedvalue = concatenatedvalue + '<span class="cell-badge warning-badge">'
          + item.name + '</span>';
        // concatenatedvalue = concatenatedvalue + '&nbsp' +'<font color="green">' + item.name + '</font>';
      } else {
        concatenatedvalue = concatenatedvalue + '<span class="cell-badge generic-badge">'
          + item.name + '</span>';
      }
    });
    return concatenatedvalue;
  };

  init();
}
