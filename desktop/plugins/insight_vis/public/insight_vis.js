import 'plugins/insight_vis/insight_vis.less';
import 'plugins/insight_vis/insight_vis_controller';
import 'plugins/insight_vis/insight_vis_params_controller';
import insightVisTemplate from 'plugins/insight_vis/insight_vis.html';
import insightVisParamsTemplate from 'plugins/insight_vis/insight_vis_params.html';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { CATEGORY } from 'ui/vis/vis_category';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(InsightVisProvider);

function InsightVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  // TODO UPDATE THE BELOW
  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'insight_vis',
    title: 'Insight',
    icon: 'icon-Insights',
    description: 'Create this visualization to configure insights.',
    category: CATEGORY.OTHER,
    visConfig: {
      defaults: {
        insights: [],
        bmv: []
      },
      template: insightVisTemplate,
    },
    editorConfig: {
      optionsTemplate: insightVisParamsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none',
  });
}
