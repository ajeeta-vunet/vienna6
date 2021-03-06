// This file is automatically generated using pluto meta-file framework
// Please do not make any change in this file directly.
'use strict';

import _ from 'lodash';

import { uiModules } from 'ui/modules';
const module = uiModules.get('kibana', ['kibana']);

import snmpDataSourceTemplate from './snmpDataSource.html';
import snmpAddDataSourceTemplate from './snmpAddDataSource.html';

module.directive('snmpDataSource', function (StateService, $uibModal, Promise) {
  const snmpDataSource = {
    restrict: 'E',
    requrie: '^ngModel',
    scope: {
    },
    replace: true,
    template: snmpDataSourceTemplate,
    link: (scope) => {
      // Fetch the configuration from backend
      scope.$parent.current_data_source_scope = scope;

      scope.showsnmpModal = false;

      scope.snmpModalData = {
        title: 'Confirm Delete',
        message: 'Do you want to delete this entry?',
        isForm: false
      };

      StateService.getDataSources('snmp').then(function(data) {
        scope.data = data.data_source_type_list;
        scope.data_receive_list = data.data_receive_list;
        scope.index = data.data_index;
        scope.selectedIndex = {};
        for(var i = 0; i < scope.data.length; i++){
          scope.selectedIndex[scope.data[i].name] = false;
        }
      });

      StateService.getStandaloneShipperList().then(function (standalone_shipper_list) {
        scope.standalone_shipper_list = standalone_shipper_list;
      });

      // Function to add/edit a row in DataEnrichment group
      scope.editConfig = (row, data_received, data_received_step, configuration_step) => {

        const controller = 'snmpAddDataSourceCtrl';

        const modalInstance = $uibModal.open({
          animation: true,
          template: snmpAddDataSourceTemplate,
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
        

        if (data_received_step) {
          modalInstance.first_step = false;
          
          modalInstance.third_step = true;
          
        }

        if (configuration_step) {
          modalInstance.first_step = false;
          
          modalInstance.second_step = true;
          
        }

        modalInstance.result.then( () => {
          // Nothing much needs to be done here..
        });
      };

      scope.deleteDataSourceConfig = (row, index) => {
        scope.rowToDelete = row;
        scope.indexToDelete = index;
        scope.showsnmpModal = true;
      };

      scope.onsnmpModalSubmit = function () {
        StateService.deleteDataSources('snmp', scope.rowToDelete.name).then(function () {
          scope.data = _.without(scope.data, scope.rowToDelete);
          scope.data_receive_list.splice(scope.indexToDelete, 1);
        });
        scope.showsnmpModal = false;
      };

      scope.onsnmpModalClose = () => {
        scope.showsnmpModal = false;
      };

      // Confirmation message to be shown on bulk delete.
      scope.snmpBulkDeleteModalData = {
        title: 'Confirm Delete',
        message: 'Do you want to delete the selected entries?',
        isForm: false
      };

      // This function displays the confirmation modal
      // when multiple entries is selected and deleted.
      scope.bulkDeleteDataSourceConfig = () => {
        scope.showsnmpModalForBulkDelete = true;
      };

      // This function gets called when we submit the modal
      scope.onsnmpBulkDeleteModalSubmit = function () {
        // Iterate over list of items to be deleted and delete
        // one by one. We return a list of promises which contains both
        // success and failure cases.
        const deletePromises = scope.getSelected().map(function (row) {
          return StateService.deleteDataSources('snmp', row.name)
            .then(function () {
              return '';
            })
            .catch(function () {
              return '';
            });
        });

        // Wait till all Promises(deletePromises) are resolved
        // and return single Promise
        Promise.all(deletePromises).then(()=> {
          StateService.getDataSources('snmp').then(function (data) {
            scope.data = data.data_source_type_list;
            scope.data_receive_list = data.data_receive_list;
            scope.index = data.data_index;
            scope.selectedIndex = {};
            for(let i = 0; i < scope.data.length; i++) {
              scope.selectedIndex[scope.data[i].name] = false;
            }
          });
        });
      };

      // This function gets called when modal for bulk delete
      // is closed
      scope.onsnmpBulkDeleteModalClose = () => {
        scope.showsnmpModalForBulkDelete = false;
        scope.selectedIndex = {};
        for(let i = 0; i < scope.data.length; i++) {
          scope.selectedIndex[scope.data[i].name] = false;
        }
        scope.selectAll = false;
      };

      // will toggle between select all and deselect all
      scope.toggleAll = (clear) => {
        if(clear === "clear"){
          scope.selectAll = false;
        }else{
          scope.selectAll = !scope.selectAll;
        }
        for (var id in scope.selectedIndex) {
          if (scope.selectedIndex.hasOwnProperty(id)) {
            scope.selectedIndex[id] = scope.selectAll;
          }
        }
      };
      // will return true if any selected item is disabled
      scope.showEnable = () =>{
        return scope.getSelected().some(a => a.enable_device === "No");
      }
      // will return true if any selected item is enabled
      scope.showDisable = () =>{
        return scope.getSelected().some(a => a.enable_device === "Yes");
      }
      // This method will return selected sources
      scope.getSelected = () => {
        let selectedItems = [];
        _.forEach(scope.selectedIndex, (value, i) => {
          if (value) {
            selectedItems.push(scope.data.find(a => a.name === i));
          }
        });
        return selectedItems;
      };

      scope.UpdateSelection = (newStatus) => {
        scope.getSelected().forEach((snmpSource) => {
          scope.selectedIndex[snmpSource.name] = false;
          let updatedValue =  {
            ...snmpSource,
            enable_device: newStatus ? "Yes" : "No",
          };
          StateService.updateDataSources("snmp", snmpSource.name, updatedValue).then((_) => {
            let data = scope.data ;
            let indexToUpdate =data.map(a => a.name).indexOf(snmpSource.name);
            // assignment cause table crash when Multiple selections are made, so use Object.assign
            Object.assign(data[indexToUpdate], updatedValue);
          });
        });
        scope.toggleAll("clear");
        notify.info(`Selected SnmpSources will be ` + (newStatus ? "enabled": "disabled"));
      };
    }
  };

  return snmpDataSource;
});