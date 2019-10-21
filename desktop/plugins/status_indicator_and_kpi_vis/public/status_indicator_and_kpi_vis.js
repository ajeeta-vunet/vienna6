import 'plugins/status_indicator_and_kpi_vis/status_indicator_and_kpi_vis.less';
import 'plugins/status_indicator_and_kpi_vis/status_indicator_and_kpi_vis_controller';
import 'plugins/status_indicator_and_kpi_vis/status_indicator_and_kpi_vis_params_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import statusIndicatorAndKpiVisTemplate from 'plugins/status_indicator_and_kpi_vis/status_indicator_and_kpi_vis.html';
import statusIndicatorAndKpiVisParamsTemplate from 'plugins/status_indicator_and_kpi_vis/status_indicator_and_kpi_vis_params.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(statusIndicatorAndKpiVisProvider);

function statusIndicatorAndKpiVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'status_indicator_and_kpi',
    title: 'KPI',
    icon: 'icon-kpi',
    description: 'Used to build visualization ' +
                 'for Key Performance Indicators',
    category: CATEGORY.DATA,
    visConfig: {
      defaults: {
        parameters: [{}],
        request_type: ''
      },
      template: statusIndicatorAndKpiVisTemplate,
    },
    editorConfig: {
      optionsTemplate: statusIndicatorAndKpiVisParamsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none',
  });
}