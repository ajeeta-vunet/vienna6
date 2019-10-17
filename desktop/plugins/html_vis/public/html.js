import { CATEGORY } from 'ui/vis/vis_category';
import htmlVisParamsTemplate from 'plugins/kibana-html-plugin/html_options.html';
import htmlVisTemplate from 'plugins/kibana-html-plugin/html.html';
import 'plugins/kibana-html-plugin/html.less';
import 'plugins/kibana-html-plugin/html_controller';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisFactoryProvider } from 'ui/vis/vis_factory';


VisTypesRegistryProvider.register(HtmlVisProvider);

function HtmlVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);

  return VisFactory.createAngularVisualization({
    name: 'html',
    title: 'Html widget',
    icon: 'fa-code',
    description: 'Useful for displaying html in dashboards.',
    category: CATEGORY.OTHER,
    visConfig: {
      template: htmlVisTemplate,
      defaults: {
        fontSize: 12
      }
    },
    editorConfig: {
      optionsTemplate: htmlVisParamsTemplate
    },
    requestHandler: 'none',
    responseHandler: 'none',
    implementsRenderComplete: true,
  });
}

export default HtmlVisProvider;
