// import the view, controller, params controller and the less file
import 'plugins/matrix_vis/matrix_vis_controller';
import matrixVisTemplate from 'plugins/matrix_vis/matrix_vis.html';
import 'plugins/matrix_vis/matrix_vis_params';
import 'plugins/matrix_vis/matrix_vis.less';
import 'ui/agg_table';
import 'ui/agg_table/agg_table_group';

// import the visuliazation factory
import { VisFactoryProvider } from 'ui/vis/vis_factory';

// import the VisType Registry
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

//import the vis category which is used to categorize this visualization
import { CATEGORY } from 'ui/vis/vis_category';

// import the schema provider.
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';

// Register this visualization to the VisTypes Registry
VisTypesRegistryProvider.register(MatrixVisTypeProvider);

// Define the matrix VisType
function MatrixVisTypeProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  // Create the Angular visualization
  return VisFactory.createAngularVisualization({
    type: 'matrix',
    name: 'matrix',
    title: 'Matrix',
    icon: 'fa-th-list',
    description: 'A visualization to show information in a matrix like format.....',
    category: CATEGORY.DATA,
    visConfig: {
      defaults: {
        perPage: 10,
        linkInfoValues: false,
        linkInfo: [],
        enableNoOfColumns: false,
        collapseTimeHeaders: false,
        enableTimeFormatter: false,
        collapseManageColumn: false,
        inputTimeFormat: 'millisecond',
        outputTimeFormat: 'millisecond',
        NoOfColumns: 10,
        perPage: 10,
        colorCodeValues: false,
        colorSchema: [],
        interval: {
          interval: 'h',
          customInterval: 10,
          customIntervalType: 'm'
        },
        addSrNumber: false,
        srNumberBase: 1,
        srNumberPrefix: '',
        srNumberTitle: 'Sr. No.',
        showCumulativeRow: false,
        cumulativeRowOperation: 'sum',
        showCumulativeColumn: false,
        cumulativeColumnOperation: 'sum',
        colorCodeOnPercentage: false,
        selectedColumns: [],
        selectedColumnsActionType: 'exclude', // default exclude to none
        showProgressBar: false
      },
      template: matrixVisTemplate,
    },
    editorConfig: {
      optionsTemplate: '<matrix-vis-params></matrix-vis-params>',
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Metric',
          aggFilter: ['!geo_centroid', '!geo_bounds'],
          min: 1,
          max: 1,
          max: 4,
          // maximum of 4 metrics is allowed. Out of this, last 3 should be
          // latest value metric
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'buckets',
          name: 'bucket',
          title: 'Split Rows',
          // maximum of 1 sub bukcet is allowed.
          max: 2,
        },
      ])
    },
    responseHandler: 'none'
  });
}

export default MatrixVisTypeProvider;
