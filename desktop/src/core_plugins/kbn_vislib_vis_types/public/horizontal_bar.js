import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { CATEGORY } from 'ui/vis/vis_category';
import pointSeriesTemplate from 'plugins/kbn_vislib_vis_types/editors/point_series.html';
import image from './images/icon-horizontal.svg';

export default function PointSeriesVisType(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  return VisFactory.createVislibVisualization({
    name: 'horizontal_bar',
    title: 'Horizontal Bar',
    image,
    description: 'Assign a continuous variable to each axis',
    category: CATEGORY.BASIC,
    visConfig: {
      defaults: {
        type: 'histogram',
        // Adding subType to resolve horizontal_bar issue
        subType: 'horizontal_bar',
        grid: {
          categoryLines: false,
          style: {
            color: '#eee'
          }
        },
        categoryAxes: [
          {
            id: 'CategoryAxis-1',
            type: 'category',
            position: 'left',
            show: true,
            style: {
            },
            scale: {
              type: 'linear'
            },
            labels: {
              show: true,
              rotate: 0,
              filter: false,
              truncate: 200
            },
            title: {}
          }
        ],
        valueAxes: [
          {
            id: 'ValueAxis-1',
            name: 'LeftAxis-1',
            type: 'value',
            position: 'bottom',
            show: true,
            style: {
            },
            scale: {
              type: 'linear',
              mode: 'normal'
            },
            labels: {
              show: true,
              rotate: 75,
              filter: true,
              truncate: 100
            },
            title: {
              text: 'Count'
            }
          }
        ],
        seriesParams: [{
          show: true,
          type: 'histogram',
          mode: 'normal',
          data: {
            label: 'Count',
            id: '1'
          },
          valueAxis: 'ValueAxis-1',
          drawLinesBetweenPoints: true,
          showCircles: true
        }],
        addTooltip: true,
        addLegend: true,
        legendPosition: 'right',
        times: [],
        addTimeMarker: false,
      },
    },
    editorConfig: {
      collections: {
        positions: ['top', 'left', 'right', 'bottom'],
        chartTypes: [{
          value: 'line',
          text: 'line'
        }, {
          value: 'area',
          text: 'area'
        }, {
          value: 'histogram',
          text: 'bar'
        }],
        fontSize: [{
          value: '8pt',
          text: 'small'
        }, {
          value: '12pt',
          text: 'normal'
        }, {
          value: '16pt',
          text: 'large'
        }, {
          value: '20pt',
          text: 'huge'
        }],
        fontOrientation: [{
          value: 'horizontal-tb',
          text: 'horizontal'
        }, {
          value: 'vertical-rl',
          text: 'vertical'
        }],
        fontPosition: [{
          value: 'top',
          text: 'top'
        }, {
          value: 'middle',
          text: 'middle'
        }],
        axisModes: ['normal', 'percentage', 'wiggle', 'silhouette'],
        scaleTypes: ['linear', 'log', 'square root'],
        chartModes: ['normal', 'stacked'],
        interpolationModes: [{
          value: 'linear',
          text: 'straight',
        }, {
          value: 'cardinal',
          text: 'smoothed',
        }, {
          value: 'step-after',
          text: 'stepped',
        }],
      },
      optionTabs: [
        {
          name: 'advanced',
          title: 'Metrics & Axes',
          editor: '<div><vislib-series></vislib-series><vislib-value-axes>' +
          '</vislib-value-axes><vislib-category-axis></vislib-category-axis></div>'
        },
        { name: 'options', title: 'Panel Settings', editor: pointSeriesTemplate },
      ],
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'X-Axis',
          min: 1,
          aggFilter: ['!geo_centroid', '!geo_bounds'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },
        {
          group: 'metrics',
          name: 'radius',
          title: 'Dot Size',
          min: 0,
          max: 1,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality']
        },
        {
          group: 'buckets',
          name: 'segment',
          title: 'Y-Axis',
          min: 0,
          max: 1,
          aggFilter: ['!geohash_grid', '!filter']
        },
        {
          group: 'buckets',
          name: 'group',
          title: 'Split Series',
          min: 0,
          max: 1,
          aggFilter: ['!geohash_grid', '!filter']
        },
        {
          group: 'buckets',
          name: 'split',
          title: 'Split Chart',
          min: 0,
          max: 1,
          aggFilter: ['!geohash_grid', '!filter']
        }
      ])
    }
  });
}
