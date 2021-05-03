import { decodeGeoHash } from 'ui/utils/decode_geo_hash';
import AggConfigResult from 'ui/vis/agg_config_result';
import _ from 'lodash';

function getAcr(val) {
  return val instanceof AggConfigResult ? val : null;
}

function unwrap(val) {
  return getAcr(val) ? val.value : val;
}

// Previously map was supporting only 1 metric maximum.
// Now we have enabled map to support more than 1 metrics.
// So go though each metric and add the metric value to a list.
function unwrapMetrics(row, metricI) {
  const values = metricI.map(function (m) {
    const label = row[m].aggConfig.params.customLabel;
    return { [label]: getAcr(row[m]) ? row[m].value : row[m] };
  });
  return values;
}

// Go through each metric and get the agg config for that metric.
function getAggConfigResults(row, metricsI) {
  const AggConfigResults = metricsI.map(function (m) {
    const label = row[m].aggConfig.params.customLabel;
    const val = row[m];
    return { [label]: val instanceof AggConfigResult ? val : null };
  });
  return AggConfigResults;
}

function clampGrid(val, min, max) {
  if (val > max) val = max;
  else if (val < min) val = min;
  return val;
}

export function convertRowsToFeatures(table, geoI, metricI, metricsI, centroidI) {

  return _.transform(table.rows, function (features, row) {
    const geohash = unwrap(row[geoI]);
    if (!geohash) return;

    // fetch latLn of northwest and southeast corners, and center point
    const location = decodeGeoHash(geohash);

    const centerLatLng = [
      location.latitude[2],
      location.longitude[2]
    ];

    //courtsey of @JacobBrandt: https://github.com/elastic/kibana/pull/9676/files#diff-c7c9f237e673ff486654f6cc6caa89f6
    let point = centerLatLng;
    const centroid = unwrap(row[centroidI]);
    if (centroid) {
      // see https://github.com/elastic/elasticsearch/issues/24694 for why clampGrid is used
      point = [
        clampGrid(centroid.lat, location.latitude[0], location.latitude[1]),
        clampGrid(centroid.lon, location.longitude[0], location.longitude[1])
      ];
    }

    // order is nw, ne, se, sw
    const rectangle = [
      [location.latitude[0], location.longitude[0]],
      [location.latitude[0], location.longitude[1]],
      [location.latitude[1], location.longitude[1]],
      [location.latitude[1], location.longitude[0]],
    ];

    // geoJson coords use LngLat, so we reverse the centerLatLng
    // See here for details: http://geojson.org/geojson-spec.html#positions
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: point.slice(0).reverse()
      },
      properties: {
        geohash: geohash,
        value: unwrap(row[metricI]),
        values: unwrapMetrics(row, metricsI),
        aggConfigResult: getAcr(row[metricI]),
        aggConfigResults: getAggConfigResults(row, metricsI),
        center: centerLatLng,
        rectangle: rectangle
      }
    });
  }, []);
}
