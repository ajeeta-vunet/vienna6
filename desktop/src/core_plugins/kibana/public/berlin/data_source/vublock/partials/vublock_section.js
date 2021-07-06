const app = require('ui/modules').get('app/berlin', []);
import { VuBlockConstants } from '../vu_block_constants';

// This directive displays sections containing a set of
// vuBlocks which are filtered based on type of the vuBlock.
app.directive('vuBlockSection', function () {
  return {
    restrict: 'E',
    template: require('plugins/kibana/berlin/data_source/vublock/partials/vublock_section.html'),
    scope: {
      name: '@',
      description: '@',
      vuBlockList: '=',
      searchQuery: '='
    },
    link: function (scope) {

      // This function handles the redirection to the vuBlock details
      // page when any vuBlock is clicked.
      scope.viewVuBlockConfiguration = function (vuBlockName, vuBlockType) {
        window.location.href = 'vienna#/berlin' +
          VuBlockConstants.VUBLOCK_PATH + vuBlockName + '?type=' + vuBlockType;
      };
    }
  };
});
