import 'plugins/unified_transaction_map_vis/unified_transaction_map_vis.less';
import 'plugins/unified_transaction_map_vis/unified_transaction_map_vis_controller';
import 'plugins/unified_transaction_map_vis/unified_transaction_map_vis_params_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import unifiedTransactionVisTemplate from 'plugins/unified_transaction_map_vis/unified_transaction_map_vis.html';
import unifiedTransactionVisParamsTemplate from 'plugins/unified_transaction_map_vis/unified_transaction_map_vis_params.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(UnifiedTransactionVisProvider);

function UnifiedTransactionVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'unified_transaction_map',
    title: 'Unified Transaction Map',
    icon: 'fa-sitemap',
    description: 'Create this visualization to display graph with nodes and edges.' +
                 'Perfect for visualizing application dependency, service path etc.' +
                 ' using nodes and links',
    category: CATEGORY.MAPS,
    visConfig: {
      defaults: {
        utmTemplate: 'Display Metric Groups',
        customNodes: [],
        customLinks: [],
        graphs: [],
        allNodes: [],
        allLinks: [],
        enableCustomErrorMessage: false,
        customErrorMessage: 'No data to show',
        enableCustomErrorTooltip: false,
        customErrorTooltip: 'There is no matching data for the selected time and filter criteria'
      },
      template: unifiedTransactionVisTemplate,
    },
    editorConfig: {
      optionsTemplate: unifiedTransactionVisParamsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none',
  });
}
