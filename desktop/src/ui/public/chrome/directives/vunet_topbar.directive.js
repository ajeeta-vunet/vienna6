

import vunetTopbarTemplate from './vunet_topbar.html';
import './vunet_topbar.less';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana', ['kibana']);

import topbarController from './vunet_topbar.controller';

module.directive('vunetTopbar', [function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    template: vunetTopbarTemplate,
    controller: topbarController
  };
}]);

