/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import { CATEGORY } from 'ui/vis/vis_category';
import { vislibColorMaps } from 'ui/vislib/components/color/colormaps';
import image from './components/calander.svg';
import { AggResponsePointSeriesProvider } from 'ui/agg_response/point_series/point_series';
import { calendarVisualizationProvider } from './calendar_visualization';
import './components/editor/editor_options';
import { defaultParams } from './default_settings';
import { momentLocales } from './i18n';

VisTypesRegistryProvider.register((Private, config) => {
  const VisFactory = Private(VisFactoryProvider);
  const pointSeries = Private(AggResponsePointSeriesProvider);
  const Schemas = Private(VisSchemasProvider);

  return VisFactory.createBaseVisualization({
    name: 'calendar',
    title: 'Calendar',
    image,
    description: 'Create a calendar heatmap visualization',
    category: CATEGORY.OTHER,
    responseHandler: 'basic',
    responseConverter: pointSeries,
    visualization: calendarVisualizationProvider(config),
    requiresUpdateStatus: [
      'aggs',
      'data',
      'params',
      'resize',
      'time',
      'uiState'
    ],
    visConfig: {
      defaults: defaultParams
    },
    editorConfig: {
      collections: {
        legendPositions: [{
          value: 'left',
          text: 'left',
        }, {
          value: 'right',
          text: 'right',
        }, {
          value: 'top',
          text: 'top',
        }, {
          value: 'bottom',
          text: 'bottom',
        }],
        colorSchemas: Object.keys(vislibColorMaps),
        locales: Object.keys(momentLocales)
      },
      optionsTemplate: '<editor-options></editor-options>',
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 1,
          max: 1,
          aggFilter: ['count', 'avg', 'median', 'sum', 'min', 'max', 'cardinality'],
          defaults: [{
            schema: 'metric',
            type: 'count'
          }]
        },
        {
          group: 'buckets',
          name: 'segment',
          title: 'Time-Axis',
          min: 0,
          max: 1,
          aggFilter: 'date_histogram',
          defaults: [{
            schema: 'segment',
            type: 'date_histogram',
            params: {
              interval: 'd'
            }
          }]
        },
        {
          group: 'buckets',
          name: 'split',
          title: 'Split Chart',
          min: 0,
          max: 1,
          aggFilter: 'date_histogram',
          defaults: [{
            schema: 'split',
            type: 'date_histogram',
            params: {
              interval: 'y'
            }
          }]
        }
      ])
    }

  });

});
