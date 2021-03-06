import L from 'leaflet';
import _ from 'lodash';

import { KibanaMapLayer } from './kibana_map_layer';
import { HeatmapMarkers } from './markers/heatmap';
import { ScaledCirclesMarkers } from './markers/scaled_circles';
import { ShadedCirclesMarkers } from './markers/shaded_circles';
import { ScaledLocationMarkers } from './markers/scaled_markers';
import { GeohashGridMarkers } from './markers/geohash_grid';

export class GeohashLayer extends KibanaMapLayer {

  constructor(featureCollection, options, zoom, kibanaMap) {

    super();

    this._geohashGeoJson = featureCollection;
    this._geohashOptions = options;
    this._zoom = zoom;
    this._kibanaMap = kibanaMap;
    const geojson = L.geoJson(this._geohashGeoJson);
    this._bounds = geojson.getBounds();
    this._createGeohashMarkers();
    this._lastBounds = null;
  }

  _createGeohashMarkers() {
    const markerOptions = {
      isFilteredByCollar: this._geohashOptions.isFilteredByCollar,
      valueFormatter: this._geohashOptions.valueFormatter,
      tooltipFormatter: this._geohashOptions.tooltipFormatter,
      redMarkerMetric: this._geohashOptions.redMarkerMetric,
      markerPopupTitle: this._geohashOptions.markerPopupTitle,
      linkInfo: this._geohashOptions.linkInfo,
      getAppState: this._geohashOptions.getAppState,
      Private: this._geohashOptions.Private,
      timefilter: this._geohashOptions.timefilter
    };
    switch (this._geohashOptions.mapType) {
      case 'Scaled Circle Markers':
        this._geohashMarkers = new ScaledCirclesMarkers(this._geohashGeoJson, markerOptions, this._zoom, this._kibanaMap);
        break;
      case 'Shaded Circle Markers':
        this._geohashMarkers = new ShadedCirclesMarkers(this._geohashGeoJson, markerOptions, this._zoom, this._kibanaMap);
        break;
      case 'Shaded Geohash Grid':
        this._geohashMarkers = new GeohashGridMarkers(this._geohashGeoJson, markerOptions, this._zoom, this._kibanaMap);
        break;
      case 'Heatmap':
        let radius = 15;
        if (this._geohashGeoJson.properties.geohashGridDimensionsAtEquator) {
          const minGridLength = _.min(this._geohashGeoJson.properties.geohashGridDimensionsAtEquator);
          const metersPerPixel = this._kibanaMap.getMetersPerPixel();
          radius = (minGridLength / metersPerPixel) / 2;
        }
        radius = radius * parseFloat(this._geohashOptions.heatmap.heatClusterSize);
        this._geohashMarkers = new HeatmapMarkers(this._geohashGeoJson, {
          radius: radius,
          blur: radius,
          maxZoom: this._kibanaMap.getZoomLevel(),
          minOpacity: 0.1,
          tooltipFormatter: this._geohashOptions.tooltipFormatter
        }, this._zoom, this._kibanaMap);
        break;
      case 'Location Markers':
        this._geohashMarkers = new ScaledLocationMarkers(this._geohashGeoJson, markerOptions, this._zoom, this._kibanaMap);
        break;
      default:
        throw new Error(`${this._geohashOptions.mapType} mapType not recognized`);

    }

    this._geohashMarkers.on('showTooltip', (event) => this.emit('showTooltip', event));
    this._geohashMarkers.on('hideTooltip', (event) => this.emit('hideTooltip', event));
    this._leafletLayer = this._geohashMarkers.getLeafletLayer();
  }

  appendLegendContents(jqueryDiv) {
    return this._geohashMarkers.appendLegendContents(jqueryDiv);
  }

  movePointer(...args) {
    this._geohashMarkers.movePointer(...args);
  }

  async getBounds() {
    if (this._geohashOptions.fetchBounds) {
      const geoHashBounds = await this._geohashOptions.fetchBounds();
      if (geoHashBounds) {
        const northEast = L.latLng(geoHashBounds.top_left.lat, geoHashBounds.bottom_right.lon);
        const southWest = L.latLng(geoHashBounds.bottom_right.lat, geoHashBounds.top_left.lon);
        const leaftetBounds = L.latLngBounds(southWest, northEast);
        return leaftetBounds;
      }
    }

    return this._bounds;
  }

  updateExtent() {
    // Client-side filtering is only enabled when server-side filter is not used
    if (!this._geohashOptions.isFilteredByCollar) {
      const bounds = this._kibanaMap.getLeafletBounds();
      if (!this._lastBounds || !this._lastBounds.equals(bounds)) {
        //this removal is required to trigger the bounds filter again
        this._kibanaMap.removeLayer(this);
        this._createGeohashMarkers();
        this._kibanaMap.addLayer(this);
      }
      this._lastBounds = bounds;
    }
  }

  isReusable(options) {

    if (_.isEqual(this._geohashOptions, options)) {
      return true;
    }

    if (this._geohashOptions.mapType !== options.mapType) {
      return false;
    } else if (this._geohashOptions.mapType === 'Heatmap' && !_.isEqual(this._geohashOptions.heatmap, options)) {
      return false;
    } else {
      return true;
    }
  }
}



