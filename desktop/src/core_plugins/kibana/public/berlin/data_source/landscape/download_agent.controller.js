import { Notifier } from 'ui/notify';
import './styles/_download_agent_controller.less';

class showDownloadAgentModalCtrl {
  constructor($scope, target, $injector, $uibModalInstance, StateService, HTTP_SUCCESS_CODE) {
    // const Private = $injector.get('Private');
    $scope.successDownload = false;
    const notify = new Notifier();

    $scope.allAgents = [{ 'name': 'Heartbeat' }];
    $scope.selectedAgents = [];

    // Adds the selected agent to the list.
    $scope.addAgent = function (item) {
      $scope.selectedAgents.push({ name: item.name });
    };

    // Removes the selected agent from the list.
    $scope.removeAgent = function (index) {
      $scope.selectedAgents.splice(index, 1);
    };

    //Download the agents and configuration
    $scope.downloadAgents = function () {

      StateService.downloadAgentConfig(target, 'True', $scope.environment, $scope.selectedAgents)
        .then((response) => {
          if (response.status === HTTP_SUCCESS_CODE) {
            $scope.successDownload = true;
            // We remove the succes message after 4 sec
            setTimeout(function () {
              $scope.cancel();
            }, 3000);
          }
        }).catch(function (response) {
        // To print error string to the user.
          notify.error(response.data['error-string']);
        });
      $scope.cancel();
    };

    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  }
}

showDownloadAgentModalCtrl.$inject = ['$scope', 'target', '$injector',
  '$uibModalInstance', 'StateService', 'Upload', 'HTTP_SUCCESS_CODE', 'chrome'];
/*eslint-disable*/
export default showDownloadAgentModalCtrl;
/*eslint-enable*/

