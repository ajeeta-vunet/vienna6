import './region_map.less';
import './region_map_vis_params';
import image from './images/icon-vector-map.svg';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { truncatedColorMaps } from 'ui/vislib/components/color/truncated_colormaps';
import { mapToLayerWithId } from './util';
import { RegionMapsVisualizationProvider } from './region_map_visualization';

VisTypesRegistryProvider.register(function RegionMapProvider(Private, regionmapsConfig, config) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);
  const RegionMapsVisualization = Private(RegionMapsVisualizationProvider);

  const vectorLayers = regionmapsConfig.layers.map(mapToLayerWithId.bind(null, 'self_hosted'));
  const selectedLayer = vectorLayers[0];
  const selectedJoinField = selectedLayer ? vectorLayers[0].fields[0] : null;

  return VisFactory.createBaseVisualization({
    name: 'region_map',
    title: 'Region Map',
    implementsRenderComplete: true,
    description: 'Show metrics on a thematic map. Use one of the provide base maps, or add your own. ' +
    'Darker colors represent higher values.',
    category: CATEGORY.MAP,
    image,
    visConfig: {
      defaults: {
        legendPosition: 'bottomright',
        addTooltip: true,
        colorSchema: 'Yellow to Red',
        selectedLayer: selectedLayer,
        selectedJoinField: selectedJoinField,
        isDisplayWarning: true,
        wms: config.get('visualization:tileMap:WMSdefaults'),
        mapZoom: 2,
        mapCenter: [0, 0],
      }
    },
    visualization: RegionMapsVisualization,
    editorConfig: {
      optionsTemplate: '<region_map-vis-params></region_map-vis-params>',
      collections: {
        legendPositions: [{
          value: 'bottomleft',
          text: 'bottom left',
        }, {
          value: 'bottomright',
          text: 'bottom right',
        }, {
          value: 'topleft',
          text: 'top left',
        }, {
          value: 'topright',
          text: 'top right',
        }],
        colorSchemas: Object.keys(truncatedColorMaps),
        vectorLayers: vectorLayers,
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 1,
          max: 3,
          aggFilter: ['count', 'avg', 'expression', 'sum', 'min', 'max', 'cardinality', 'top_hits',
            'sum_bucket', 'min_bucket', 'max_bucket', 'avg_bucket'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },
        {
          group: 'buckets',
          name: 'segment',
          icon: 'fa fa-globe',
          title: 'shape fields',
          min: 1,
          max: 1,
          aggFilter: ['terms']
        }
      ])
    },
    responseHandler: 'tabify'

  });
});


