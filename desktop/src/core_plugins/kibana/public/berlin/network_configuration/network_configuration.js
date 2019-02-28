import { uiModules } from 'ui/modules';
const app = uiModules.get('app/berlin');
import './network_configuration.less';
import './view_network_configuration.less';
import ViewNetworkConfigTemplate from './view_network_configuration.html';
import ViewNetworkConfigCtrl from './view_network_configuration.js';

app.directive('vunetNetworkConfiguration', function () {
  return {
    restrict: 'E',
    controllerAs: 'networkConfigurationController',
    controller: networkConfigurationController,
  };
});

function networkConfigurationController($scope,
  chrome,
  $modal,
  $http,
  StateService) {

  // Local variable to handle the data..
  $scope.selectedConfigInstanceList = [];
  $scope.isModifyAllowed = chrome.isModifyAllowed();

  // Meta data for network configuration table
  $scope.networkConfiguration = {
    headers: ['Name', 'Ip Address', 'Vendor', 'Device'],
    rows: ['name', 'configuration_collector_target', 'configuration_collector_vendor', 'configuration_collector_device'],
    id: 'configuration_collector_target',
    selection: false,
    rowAction: [
      { name: 'SSH router', icon: 'fa-terminal', toolTip: 'SSH to this router' },
      { name: 'Ping router', icon: 'fa-exchange', toolTip: 'Ping this router' },
      { name: 'Traceroute router', icon: 'fa-road', toolTip: 'Traceroute to this router' },
      { name: 'View configuration for router', icon: 'fa-gear', toolTip: 'View configuration for this router' },
      {
        name: 'Download recent configuration of device', icon: 'fa-download',
        toolTip: 'Download the most recent configuration of this device'
      }]
  };

  // If user has modify permission, we allow him to collect the configuration
  // as well..
  if ($scope.isModifyAllowed) {
    $scope.networkConfiguration.rowAction.splice(4, 0, {
      name: 'Collect configuration of device', icon: 'fa-file-text-o',
      toolTip: 'Collect configuration of this device'
    });
  }

  // This is called when we fetch all the available configurations..
  $scope.fetchNetworkConfiguration = () => {
    return StateService.getAllRouterConfigDetails().then(function (networkConfigurationData) {
      $scope.noOfRouters = networkConfigurationData.data_source_type_list.length;
      return networkConfigurationData.data_source_type_list;
    });
  };

  // Collect button function
  $scope.collectConfiguration = function () {
    // Take input from user to add details about config collection
    const ccreturnVal = prompt('configuration collector message : ', 'Daily commit message');
    if (ccreturnVal !== null) {
      const ccmessage = {
        'configuration_collector_message': ccreturnVal
      };

      // Tell backend to start configuration collection...
      StateService.updateRouterConfigInstances(ccmessage);
    }
  };

  // Disabling button to download configuration of all devices
  $scope.disbleDownloadAllDevicesConfButton = function () {
    if ($scope.noOfRouters === 0) {
      return true;
    } else {
      return false;
    }
  };

  // Download the most recent configuration of all the devices
  $scope.downloadMostRecentConfigurationOfAllDevices = function () {
    StateService.downloadMostRecentConfigurationOfAllDevices();
  };

  // Websockets are used to do ssh to a router in browser..

  function updateWindowContent(windObj, htmlContent) {
    windObj.document.open();
    windObj.document.write(htmlContent);
    windObj.document.close();
  }

  // This function is called to handle webSocket in the newly opened window,
  // it can be used for ping, traceroute, ssh etc.
  $scope.handleWebSocketInNewWindow = function (routerAddress, operation) {
    const htmlBodyProperties = 'BGCOLOR=\"#000000\" TEXT=\"#FFFFFF\"';
    const url = window.location.host + '/' + operation + '/' + routerAddress + '/';
    const ws = new WebSocket('wss://' + url);
    // Open a new window
    /*eslint-disable*/
    const newWnd = window.open('', '_blank', 'width=600,height=600,location=no, menubar=no, resizable=no, scrollbars=no, status=no, toolbar=no');
    /*eslint-enable*/
    let html = '<html><head><title>' + operation.charAt(0).toUpperCase() + operation.slice(1) +
      ' to ' + routerAddress + '</title></head>';
    const waitMsg = 'Please wait while we try to ' + operation + ' to ' + routerAddress;

    // Update the window content with the initial wait message
    updateWindowContent(newWnd, html + '<body ' + htmlBodyProperties + ' >' + '<pre>' + waitMsg + '</pre></body></html>');

    let msgReceived = false;
    ws.onerror = function () {
      // If a response message has NOT been received yet, update the window
      // content with an error message
      if (msgReceived === false) {
        html += '<body ' + htmlBodyProperties + ' >' + '<pre>Could not process the request</pre></body></html>';
        updateWindowContent(newWnd, html);
      }
    };

    ws.onmessage = function (event) {
      // On receipt of response for our Websocket request, update the window
      // content with the response text, which should be the output of
      // ping/traceroute
      msgReceived = true;
      html += '<body ' + htmlBodyProperties + ' >' + '<pre>' + event.data + '</pre></body></html>';
      updateWindowContent(newWnd, html);
    };
  };

  // This function will help to collapase the instance list and
  // clearing the list used to store the instances selected to
  // perform 'View' or 'Diff' operations.
  $scope.clearRouterConfigList = function () {
    $scope.routerconfigList = [];
    $scope.selectedConfigInstanceList = [];
    $scope.configInstanceList = [];
  };

  // This function is called when the config icon for any of
  // the router is clicked.
  $scope.getRouterConfigList = function (configurationCollectorName) {
    // This code will run when the config button is clicked to close the
    // div showing the router config instances.
    if ($scope.routerconfigList && $scope.routerconfigList[0] === configurationCollectorName) {
      $scope.clearRouterConfigList();
      return;
    }
    $scope.clearRouterConfigList();
    $scope.routerconfigList.push(configurationCollectorName);
    // This will make a backend call to fetch all the router config
    // instance for a particular router.
    StateService.getRouterConfigInstances(configurationCollectorName).then(function (data) {
      $scope.configInstanceList = data.configurations;
    });
  };

  // This will update the selectedConfigInstanceList when any
  // operations are made on checkboxes.
  $scope.toggleSelection = function toggleSelection(instance) {
    const idx = $scope.selectedConfigInstanceList.indexOf(instance);

    // Is currently selected
    if (idx > -1) {
      $scope.selectedConfigInstanceList.splice(idx, 1);
    }

    // Is newly selected
    else {
      $scope.selectedConfigInstanceList.push(instance);
    }

    // Allow only 2 checkboxes to be selected
    // at max.
    if ($scope.selectedConfigInstanceList.length > 2) {
      $scope.selectedConfigInstanceList.splice(0, 1);
    }
  };

  //Row Actions
  $scope.onNetworkConfigurationRowAction = function (event, id, data) {
    const routerAddress = data.configuration_collector_target;
    const configurationCollectorName = data.name;
    if (event === 'SSH router') {
      const url = '/router-cli/' + routerAddress + '/';
      window.open(url, '_blank', 'width=600, height=600');
    } else if (event === 'Ping router') {
      $scope.handleWebSocketInNewWindow(routerAddress, 'ping');
    } else if (event === 'Traceroute router') {
      $scope.handleWebSocketInNewWindow(routerAddress, 'traceroute');
    } else if (event === 'View configuration for router') {
      $scope.getRouterConfigList();
      const modalInstance = $modal.open({
        animation: true,
        template: ViewNetworkConfigTemplate,
        controller: ViewNetworkConfigCtrl,
        windowClass: 'network-configuration-modal'
      });
      modalInstance.data = data;
      modalInstance.selectedConfigInstanceList = $scope.selectedConfigInstanceList;
    } else if (event === 'Collect configuration of device') {
      // Take input from user to add details about configuration collection
      const ccreturnVal = prompt('configuration collector message : ', 'Daily commit message');
      if (ccreturnVal !== null) {
        const ccmessage = {
          'configuration_collector_message': ccreturnVal
        };
        StateService.collectConfigurationForDevice(configurationCollectorName, ccmessage);
      }
    } else if (event === 'Download recent configuration of device') {
      // Download the most recent configuration of a device
      StateService.downloadMostRecentConfigurationOfSingleDevice(configurationCollectorName);
    }
    return Promise.resolve(false);
  };

}
