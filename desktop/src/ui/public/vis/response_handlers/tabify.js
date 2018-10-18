import _ from 'lodash';
import { AggResponseIndexProvider } from 'ui/agg_response/index';
import { VisResponseHandlersRegistryProvider } from 'ui/registry/vis_response_handlers';
import { metricPercentage } from 'ui/utils/vunet_calculate_sum_tabel';

const TabifyResponseHandlerProvider = function (Private) {
  const aggResponse = Private(AggResponseIndexProvider);

  return {
    name: 'tabify',
    handler: function (vis, response) {
      return new Promise((resolve) => {

        const metricsInPercentage = metricPercentage(vis);

        const tableGroup = aggResponse.tabify(vis, response, {
          canSplit: true,
          metricsInPercentage: metricsInPercentage,
          asAggConfigResults: _.get(vis, 'type.responseHandlerConfig.asAggConfigResults', false)
        });

        resolve(tableGroup);
      });
    }
  };
};

VisResponseHandlersRegistryProvider.register(TabifyResponseHandlerProvider);

export { TabifyResponseHandlerProvider };
