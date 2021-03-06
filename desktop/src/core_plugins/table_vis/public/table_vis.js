import 'plugins/table_vis/table_vis.less';
import 'plugins/table_vis/vunet_vis_table.less';
import 'plugins/table_vis/table_vis_controller';
import 'plugins/table_vis/table_vis_params';
import 'ui/agg_table';
import 'ui/agg_table/agg_table_group';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import tableVisTemplate from 'plugins/table_vis/table_vis.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import image from './images/icon-table.svg';
// we need to load the css ourselves

// we also need to load the controller and used by the template

// our params are a bit complex so we will manage them with a directive

// require the directives that we use as well

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(TableVisTypeProvider);

// define the TableVisType
function TableVisTypeProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  // define the TableVisController which is used in the template
  // by angular's ng-controller directive

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    type: 'table',
    name: 'table',
    title: 'Data Table',
    image,
    description: 'Display values in a table',
    category: CATEGORY.DATA,
    visConfig: {
      defaults: {
        perPage: 10,
        cellFontSize: 14,
        showPartialRows: false,
        showMeticsAtAllLevels: false,
        sort: {
          columnIndex: null,
          direction: null
        },
        colorCodeValues: false,
        colorSchema: [],
        linkInfoValues: false,
        linkInfo: [],
        srNumberBase: 1,
        srNumberPrefix: '',
        srNumberTitle: 'Sr. No.',
        addSrNumber: false,
        showCumulativeRow: false,
        cumulativeRowOperation: 'sum',
        metricsInPercentage: false,
        showProgressBar: false,
        showWordWrap: false,
        enableCustomErrorMessage: false,
        customErrorMessage: 'No data to show',
        enableCustomErrorTooltip: false,
        customErrorTooltip: 'There is no matching data for the selected time and filter criteria'
      },
      template: tableVisTemplate,
    },
    editorConfig: {
      optionsTemplate: '<table-vis-params></table-vis-params>',
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          aggFilter: ['!geo_centroid', '!geo_bounds'],
          min: 1,
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'buckets',
          name: 'bucket',
          title: 'Split Rows',
          aggFilter: ['!filter']
        },
        {
          group: 'buckets',
          name: 'split',
          title: 'Split Table',
          aggFilter: ['!filter']
        }
      ])
    },
    responseHandlerConfig: {
      asAggConfigResults: true
    },
    hierarchicalData: function (vis) {
      return Boolean(vis.params.showPartialRows || vis.params.showMeticsAtAllLevels);
    }
  });
}

export default TableVisTypeProvider;
