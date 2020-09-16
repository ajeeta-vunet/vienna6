import './loader_animation.less';
import loaderAnimationTemplate from './loader_animation.html';
import { uiModules } from 'ui/modules';

//This directive is used to display the SVGs used to indicate loading when a viz. is loading

const app = uiModules.get('kibana');

app
  .directive('loaderAnimation', function () {
    return {
      restrict: 'E',
      template: loaderAnimationTemplate
    };
  });
