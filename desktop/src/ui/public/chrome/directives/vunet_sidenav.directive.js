

import vunetSidebar from './vunet_sidebar.html';

import './vunet_sidebar.less';
import sidebarController from './vunet_sidebar.controller';

import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana');


module.directive('sidebarNavigation', [  function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    template: vunetSidebar,
    controller: sidebarController
  };
}]);

