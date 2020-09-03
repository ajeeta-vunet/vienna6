import 'plugins/heartbeat_vis/heartbeat_vis.less';
import 'plugins/heartbeat_vis/heartbeat_vis_controller';
import 'plugins/heartbeat_vis/heartbeat_vis_params_controller';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import visTemplate from 'plugins/heartbeat_vis/heartbeat_vis.html';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import optionsTemplate from 'plugins/heartbeat_vis/heartbeat_vis_params.html';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(HeartbeatVisProvider);

function HeartbeatVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'heartbeat_vis',
    title: 'Heartbeat Map',
    icon: 'fa fa-heartbeat',
    description: 'Create Heartbeat Map Visualization charts by' +
        ' selecting index having heartbeat data and choose which heartbeat ' +
        'data visualization among device heartbeat, service heartbeat, tracepathbeat and URL beat to display ',
    category: CATEGORY.MAPS,
    visConfig: {
      template: visTemplate,
      defaults: {
        enableCustomErrorMessage: false,
        customErrorMessage: 'No data to show',
        enableCustomErrorTooltip: false,
        customErrorTooltip: 'There is no matching data for the selected time and filter criteria'
      }
    },
    editorConfig: {
      optionsTemplate: optionsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none'
  });
}
