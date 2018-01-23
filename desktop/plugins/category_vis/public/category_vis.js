import 'plugins/category_vis/category_vis.less';
import 'plugins/category_vis/category_vis_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import categoryVisTemplate from 'plugins/category_vis/category_vis.html';
import categoryVisParamsTemplate from 'plugins/category_vis/category_vis_params.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(CategoryVisProvider);

function CategoryVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'category',
    title: 'Category widget',
    isAccessible: true,
    icon: 'fa-users',
    description: 'Useful for displaying group of dashboards.',
    category: CATEGORY.OTHER,
    visConfig: {
      template: categoryVisTemplate,
      defaults: {
        images: ['server.png', 'network_element.png', 'application.png', 'security.png', 'administration.png', 'others.png', 'bank.png', 'alert.png', 'iot.png', 'kpi.png', 'mobile_app.png', 'credit.png', 'log_analytics.png', 'user_behaviour.png', 'wifi.png', 'database.png'],
        fontSize: 12,
        dashboards:[]
      }
    },
    editorConfig: {
      optionsTemplate: categoryVisParamsTemplate
    },
    options: {
      showTimePicker: false,
    },
    requestHandler: 'none',
    responseHandler: 'none',
    implementsRenderComplete: true,
  });
}

// export the provider so that the visType can be required with Private()
export default CategoryVisProvider;
