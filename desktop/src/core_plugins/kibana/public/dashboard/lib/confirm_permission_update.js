import './confirm_permission_update.less';

class ConfirmPermissionUpdate {
  constructor($scope, $modalInstance) {
    // To close a modal.
    $scope.closeModal = () => {
      $modalInstance.dismiss('cancel');
    };

    // Function to upgrade visulalizations/saved searches
    $scope.updateVisualizations = () => {
      $modalInstance.close();
    };

  }
}

ConfirmPermissionUpdate.$inject = ['$scope', '$modalInstance'];
/*eslint-disable*/
export default ConfirmPermissionUpdate;
/*eslint-enable*/
