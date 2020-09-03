import 'plugins/uvmap_vis/uvmap_vis.less';
import 'plugins/uvmap_vis/uvmap_vis_controller.js';
import 'plugins/uvmap_vis/uvmap_vis_params_controller.js';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import visTemplate from 'plugins/uvmap_vis/uvmap_vis.html';
import optionsTemplate from 'plugins/uvmap_vis/uvmap_vis_params.html';

VisTypesRegistryProvider.register(UVMapVisProvider);


function UVMapVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  return VisFactory.createAngularVisualization({
    name: 'uvmap_vis',
    title: 'Unified Visibility Map',
    icon: 'fa-sitemap',
    description: 'Create Unified Visibility Map Visualization charts using ' +
                 'the expression and connection language. Perfect for ' +
                 ' visualizing application dependency, service path etc.' +
                 ' using nodes and links',
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
