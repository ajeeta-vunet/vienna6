import enrichmentTableTemplate from './enrichment_table.html';
import './data_enrichment.less';
import { uiModules } from 'ui/modules';

const module = uiModules.get('kibana', ['kibana']);

import DataEnrichmentCtrl from './enrichment_table.controller';

module.directive('enrichmentTable', [function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    template: enrichmentTableTemplate,
    controller: DataEnrichmentCtrl
  };
}]);
