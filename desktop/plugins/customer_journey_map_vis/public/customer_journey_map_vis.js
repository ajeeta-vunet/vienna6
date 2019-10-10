import 'plugins/customer_journey_map_vis/customer_journey_map_vis.less';
import 'plugins/customer_journey_map_vis/customer_journey_map_vis_controller';
import 'plugins/customer_journey_map_vis/customer_journey_map_vis_params_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import customerJourneyMapVisTemplate from 'plugins/customer_journey_map_vis/customer_journey_map_vis.html';
import customerJourneyMapVisParamsTemplate from 'plugins/customer_journey_map_vis/customer_journey_map_vis_params.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(customerJourneyMapVisProvider);

function customerJourneyMapVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'customer_journey_map',
    title: 'Customer Journey',
    icon: 'fa-tasks',
    description: 'Customer Journey ' +
                 'Map' +
                 'Visualization in tabular format',
    category: CATEGORY.DATA,
    visConfig: {
      defaults: {
        stages: [],
        metricGroups: []
      },
      template: customerJourneyMapVisTemplate,
    },
    editorConfig: {
      optionsTemplate: customerJourneyMapVisParamsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none',
  });
}