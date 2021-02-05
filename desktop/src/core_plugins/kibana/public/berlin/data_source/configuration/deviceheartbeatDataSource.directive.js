// This file is automatically generated using pluto meta-file framework
// Please do not make any change in this file directly.
'use strict';

import _ from 'lodash';

import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana', ['kibana']);

import deviceheartbeatDataSourceTemplate from './deviceheartbeatDataSource.html';
import deviceheartbeatAddDataSourceTemplate from './deviceheartbeatAddDataSource.html';

module.directive('deviceheartbeatDataSource', function (StateService, $uibModal) {
  const deviceheartbeatDataSource = {
    restrict: 'E',
    requrie: '^ngModel',
    scope: {
    },
    replace: true,
    template: deviceheartbeatDataSourceTemplate,
    link: (scope) => {
      // Fetch the configuration from backend
      scope.$parent.current_data_source_scope = scope;

      scope.showdeviceheartbeatModal = false;

      scope.deviceheartbeatModalData = {
        title: 'Confirm Delete',
        message: 'Do you want to delete this entry?',
        isForm: false
      };

      StateService.getDataSources('deviceheartbeat').then(function(data) {
        scope.data = data.data_source_type_list;
        scope.data_receive_list = data.data_receive_list;
        scope.index = data.data_index;
      });

      StateService.getStandaloneShipperList().then(function (standalone_shipper_list) {
        scope.standalone_shipper_list = standalone_shipper_list;
      });

      // Function to add/edit a row in DataEnrichment group
      scope.editConfig = (row, data_received, data_received_step, configuration_step) => {

        const controller = 'deviceheartbeatAddDataSourceCtrl';

        const modalInstance = $uibModal.open({
          animation: true,
          template: deviceheartbeatAddDataSourceTemplate,
          controller: controller,
          windowClass: 'data-source-configuration'
        });

        // Send the value of the edited row to modal so that the modal gets
        // populated with these values.
        if (row) {
          modalInstance.row = row;
          modalInstance.data_received = data_received;
        }

        modalInstance.data = scope.data;
        modalInstance.data_receive_list = scope.data_receive_list;
        modalInstance.index = scope.index;
        modalInstance.first_step = true;
        modalInstance.third_step = false;
        modalInstance.second_step = false;
        modalInstance.fourth_step = false;
        

        if (data_received_step) {
          modalInstance.first_step = false;
          modalInstance.fourth_step = true;
          
        }

        if (configuration_step) {
          modalInstance.first_step = false;
          modalInstance.third_step = true;
          
        }

        modalInstance.result.then( () => {
          // Nothing much needs to be done here..
        });
      };

      scope.deleteDataSourceConfig = (row, index) => {
        scope.rowToDelete = row;
        scope.indexToDelete = index;
        scope.showdeviceheartbeatModal = true;
      };

      scope.ondeviceheartbeatModalSubmit = function () {
        StateService.deleteDataSources('deviceheartbeat', scope.rowToDelete.name).then(function () {
          scope.data = _.without(scope.data, scope.rowToDelete);
          scope.data_receive_list.splice(scope.indexToDelete, 1);
        });
        scope.showdeviceheartbeatModal = false;
      };

      scope.ondeviceheartbeatModalClose = () => {
        scope.showdeviceheartbeatModal = false;
      };
    }
  };

  return deviceheartbeatDataSource;
});