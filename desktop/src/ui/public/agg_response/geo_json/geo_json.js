import _ from 'lodash';
import { convertRowsToFeatures } from 'ui/agg_response/geo_json/rows_to_features';
import { TileMapTooltipFormatterProvider } from 'ui/agg_response/geo_json/_tooltip_formatter';
import { gridDimensions } from './grid_dimensions';

export function AggResponseGeoJsonProvider(Private) {

  const tooltipFormatter = Private(TileMapTooltipFormatterProvider);

  return function (vis, table) {

    function columnIndex(schema) {
      return _.findIndex(table.columns, function (col) {
        return col.aggConfig.schema.name === schema;
      });
    }

    const geoI = columnIndex('segment');
    const metricI = columnIndex('metric');
    // Previously map was supporting only 1 metric maximum.
    // Now we have enabled to support more than 1 metrics.
    // So add all the configured metrics to a list.
    const metricsI = [];
    table.columns.map(function (col, columnIndex) {
      if (col.aggConfig.schema) {
        if (col.aggConfig.schema.name === 'metric') {
          metricsI.push(columnIndex);
        }
      }
    });
    const centroidI = _.findIndex(table.columns, (col) => col.aggConfig.type.name === 'geo_centroid');

    const geoAgg = _.get(table.columns, [geoI, 'aggConfig']);
    const metricAgg = _.get(table.columns, [metricI, 'aggConfig']);

    const features = convertRowsToFeatures(table, geoI, metricI, metricsI, centroidI);
    const values = features.map(function (feature) {
      return feature.properties.value;
    });

    return {
      title: table.title(),
      valueFormatter: metricAgg && metricAgg.fieldFormatter(),
      tooltipFormatter: tooltipFormatter,
      geohashGridAgg: geoAgg,
      geoJson: {
        type: 'FeatureCollection',
        features: features,
        properties: {
          min: _.min(values),
          max: _.max(values),
          zoom: geoAgg && geoAgg.vis.uiStateVal('mapZoom'),
          center: geoAgg && geoAgg.vis.uiStateVal('mapCenter'),
          geohashPrecision: geoAgg && geoAgg.params.precision,
          geohashGridDimensionsAtEquator: geoAgg && gridDimensions(geoAgg.params.precision)
        }
      }
    };
  };
}
