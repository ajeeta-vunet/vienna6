import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
// import { DefaultEditorSize } from 'ui/vis/editor_size';

import { VegaRequestHandlerProvider } from './vega_request_handler';
import { VegaVisualizationProvider } from './vega_visualization';

import './vega.less';

// Editor-specific code

// copied from https://github.com/thlorenz/brace/blob/master/mode/hjson.js
// This file is introduced into
import './upstream/hjson';

import 'brace/ext/searchbox';
import './vega_editor.less';
import './vega_editor_controller';
import vegaEditorTemplate from './vega_editor_template.html';
import defaultSpec from '!!raw-loader!./default.spec.hjson';

VisTypesRegistryProvider.register((Private) => {
  const VisFactory = Private(VisFactoryProvider);
  const vegaRequestHandler = Private(VegaRequestHandlerProvider).handler;
  const VegaVisualization = Private(VegaVisualizationProvider);

  return VisFactory.createBaseVisualization({
    name: 'vega_vis',
    title: 'Vega Plugin',
    description: 'Create custom visualizations using Vega and VegaLite',
    icon: 'icon-Vega_Plugin',
    category: CATEGORY.OTHER,
    visConfig: { defaults: { spec: defaultSpec } },
    editorConfig: {
      optionsTemplate: vegaEditorTemplate,
      enableAutoApply: true,
      defaultSize: 'medium', // backward compatible when ui/public/vis/editor_size is missing
    },
    visualization: VegaVisualization,
    requestHandler: vegaRequestHandler,
    responseHandler: 'none',
    options: { showIndexSelection: false },
  });
});
