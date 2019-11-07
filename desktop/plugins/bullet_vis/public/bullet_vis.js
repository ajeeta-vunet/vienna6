import 'plugins/bullet_vis/bullet_vis.less';
import 'plugins/bullet_vis/bullet_vis_controller';
import 'plugins/bullet_vis/bullet_vis_params_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import bulletVisTemplate from 'plugins/bullet_vis/bullet_vis.html';
import bulletVisParamsTemplate from 'plugins/bullet_vis/bullet_vis_params.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

// register the provider with the visTypes registry so that other know it exists
VisTypesRegistryProvider.register(BulletVisProvider);

function BulletVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'bullet_vis',
    title: 'Bullet Graph',
    icon: 'icon-Bullet_Graph',
    description: 'Create this visualization to display bullet graph',
    category: CATEGORY.MAPS,
    visConfig: {
      defaults: {
        bullets: [],
        insights: [],
      },
      template: bulletVisTemplate,
    },
    editorConfig: {
      optionsTemplate: bulletVisParamsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none',
  });
}
