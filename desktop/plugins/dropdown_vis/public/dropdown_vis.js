import 'plugins/dropdown_vis/dropdown_vis.less';
import 'plugins/dropdown_vis/dropdown_vis_controller';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { CATEGORY } from 'ui/vis/vis_category';
import dropdownVisTemplate from 'plugins/dropdown_vis/dropdown_vis.html';
import dropdownVisOptionsTemplate from 'plugins/dropdown_vis/dropdown_vis_options.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

VisTypesRegistryProvider.register(DropdownVisProvider);

function DropdownVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);
  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    name: 'dropdownpicker',
    title: 'Dropdown Picker',
    isAccessible: true,
    icon: 'fa-caret-square-o-down',
    description: 'Set filters via a dropdown selector',
    category: CATEGORY.BASIC,
    visConfig: {
      template: dropdownVisTemplate,
      defaults: {
        enableCustomErrorMessage: false,
        customErrorMessage: 'No data to show',
        enableCustomErrorTooltip: false,
        customErrorTooltip: 'There is no matching data for the selected time and filter criteria'
      }
    },
    editorConfig: {
      optionsTemplate: dropdownVisOptionsTemplate,
      schemas: new Schemas([
        {
          group: 'buckets',
          name: 'dropdownfield',
          title: 'Field to filter on',
          min: 1,
          max: 1,
          aggFilter: '!geohash_grid'
        }
      ])
    },
    responseHandler: 'none',
  });
}
