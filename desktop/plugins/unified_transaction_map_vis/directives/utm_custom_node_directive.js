import { uiModules } from 'ui/modules';
import { validateLabel } from 'ui/utils/validate_label.js';
require('../directives/utm_metric_list_directive.js');

const module = uiModules.get('kibana');

// This directive is used to create node.
// This takes the following parameters:
// visParams:  Node object holding all the details of node.
module.directive('customNode', function () {
  return {
    restrict: 'E',
    scope: {
      visParams: '=',
      nodeLabelList: '=',
      bmvList: '=',
    },
    template: require('./utm_custom_node_directive.html'),
    link: function (scope) {
      const { nodeX, nodeY } = scope.visParams;

      // List of node types
      scope.nodeType = ['PC',
        'PCAlert',
        'Wifi',
        'WifiAlert',
        'Printer',
        'PrinterAlert',
        'Mobile',
        'MobileAlert',
        'Switch',
        'SwitchAlert',
        'Firewall',
        'FirewallAlert',
        'Router',
        'RouterAlert',
        'App',
        'Device',
        'Server',
        'ServerAlert',
        'other'
      ];

      // If X and Y values are not coming then assign X and Y
      // with 0. First time to display nodes it uses physics to
      // automaticaly gets node's position, by this
      // time X and Y values won't be available.
      if (nodeX === undefined || nodeY === undefined) {
        scope.visParams.nodeX = 0;
        scope.visParams.nodeY = 0;
      }

      // removing undefined entry in scope.nodeLabelList.
      scope.nodeLabelList = scope.nodeLabelList.filter(function (element) {
        return element !== undefined;
      });

      // Function to reset NodeConfigType.
      scope.resetNodeConfigType = function (nodeType) {
        nodeType === 'bmv' ?  scope.visParams.bmv = '' : scope.visParams.nodeType = '';
      };

      // Function to invalidate form if more than
      // 1 node configured with same name.
      scope.validateNodeLabel = function (modelVal) {
        scope.duplicateNode = false;

        // Set form to invalid if return value of validateLabel function is true.
        scope.duplicateNode = scope.addNodeForm.node.$invalid = validateLabel(scope.nodeLabelList, modelVal);
      };
    }
  };
});
