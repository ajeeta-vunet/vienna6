import 'plugins/business_metric_vis/business_metric_vis.less';
import 'plugins/business_metric_vis/business_metric_vis_controller';
import 'plugins/business_metric_vis/business_metric_vis_params_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import businessMetricVisTemplate from 'plugins/business_metric_vis/business_metric_vis.html';
import businessMetricVisParamsTemplate from 'plugins/business_metric_vis/business_metric_vis_params.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(BusinessMetricVisProvider);

function BusinessMetricVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'business_metric',
    title: 'Business Metric',
    icon: 'fa-briefcase',
    description: 'Create this visualization to display any metric value' +
        'for a given time period. Configure custom background themes and font colors' +
        'with upto three time shift values',
    category: CATEGORY.DATA,
    visConfig: {
      defaults: {
        linkInfoValues: false,
        linkInfo: [],
      },
      template: businessMetricVisTemplate
    },
    editorConfig: {
      optionsTemplate: businessMetricVisParamsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none',
  });
}
