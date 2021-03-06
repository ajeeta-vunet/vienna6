import $ from 'jquery';
import L from 'leaflet';
import _ from 'lodash';
import d3 from 'd3';
import { KibanaMapLayer } from '../../tile_map/public/kibana_map_layer';
import { truncatedColorMaps } from 'ui/vislib/components/color/truncated_colormaps';

export default class ChoroplethLayer extends KibanaMapLayer {

  constructor(geojsonUrl, attribution) {
    super();

    this._metrics = null;
    this.showLabels = false;
    this._joinField = null;
    this._colorRamp = truncatedColorMaps[Object.keys(truncatedColorMaps)[0]];
    this._tooltipFormatter = () => '';
    this._attribution = attribution;
    this._boundsOfData = null;

    this._geojsonUrl = geojsonUrl;
    this._leafletLayer = L.geoJson(null, {
      onEachFeature: (feature, layer) => {
        //The onEachFeature function gets called on each feature
        //before adding it to a GeoJSON layer.
        //If "show values" option is true and the bucket's field is found in the GeoJSON then
        //bind the tooltip for that layer. This tooltip will show the
        // value permanently for the corresponding state in the geo map.
        const match = this._metrics.find((bucket) => {
          return bucket.term === feature.properties[this._joinField];
        });
        if (match !== undefined && this.showLabels) {
          const value = match.metrics;
          let metrics = '';
          let metricIndex = 0;
          // Go through each metric and get the value/formatted value.
          // Let's add these metric values to a string with comma delimitted and bind
          // to the layer's tooltip.
          value.forEach(val => {
            metricIndex = metricIndex + 1;
            Object.entries(val).forEach(([key, value]) => {
              metrics = metrics + this._metricsAgg.fieldFormatter()(value);
            });
            if (metricIndex !== match.metrics.length) {
              metrics = metrics + ', ';
            }
          });

          layer.bindTooltip(
            metrics,
            {
              permanent: true,
              direction: 'center',
              className: 'countryLabel'
            }
          );
        }
        layer.on('dblclick', () => {
          this.emit('select', feature.properties[this._joinField]);
        });
        layer.on({
          /**
            * This opens a popup when we move the mouse over the layer.
            * Go though each metric, get the value and construct the content
            * for the popup.
            * These metric values will be shown in the mouse over popup.
          **/
          mouseover: () => {
            if (match !== undefined) {
              const value = match.metrics;
              let metrics = '<div class="map_icon_nik">';

              value.forEach(val => {
                Object.entries(val).forEach(([key, value]) => {

                  metrics = metrics + `<div class="card-count">
                                          <span class="count-label">${key}</span>
                                          <span class="count-info"><span>` + this._metricsAgg.fieldFormatter()(value) + `</span></span>
                                       </div>`;
                });
              });

              metrics = metrics + '</div>';

              const template = ` <div class="card">
                            <div class="cardcontent">
                              <div class="card-title">
                                ${feature.properties[this._joinField]}
                              </div>
                            <div class="card-details">
                              ${metrics}
                            </div>
                          </div>`;
              layer.bindPopup(template);
            }
          },
          mouseout: () => {
            this.emit('hideTooltip');
          }
        });
      },
      style: emptyStyle
    });

    this._loaded = false;
    this._error = false;
    this._whenDataLoaded = new Promise(async (resolve) => {
      try {
        const data = await this._makeJsonAjaxCall(geojsonUrl);
        this._leafletLayer.addData(data);
        this._loaded = true;
        this._setStyle();
        resolve();
      } catch (e) {
        this._loaded = true;
        this._error = true;
        resolve();
      }
    });
  }

  //This method is stubbed in the tests to avoid network request during unit tests.
  async _makeJsonAjaxCall(url) {
    return await $.ajax({
      dataType: 'json',
      url: url
    });
  }

  _setStyle() {
    if (this._error || (!this._loaded || !this._metrics || !this._joinField)) {
      return;
    }

    const styler = makeChoroplethStyler(this._metrics, this._colorRamp, this._joinField);
    this._leafletLayer.setStyle(styler.getLeafletStyleFunction);

    if (this._metrics && this._metrics.length > 0) {
      const { min, max } = getMinMax(this._metrics);
      this._legendColors = getLegendColors(this._colorRamp);
      const quantizeDomain = (min !== max) ? [min, max] : d3.scale.quantize().domain();
      this._legendQuantizer = d3.scale.quantize().domain(quantizeDomain).range(this._legendColors);
    }
    this._boundsOfData = styler.getLeafletBounds();
    this.emit('styleChanged', {
      mismatches: styler.getMismatches()
    });
  }

  getMetrics() {
    return this._metrics;
  }

  getMetricsAgg() {
    return this._metricsAgg;
  }

  getUrl() {
    return this._geojsonUrl;
  }

  setTooltipFormatter(tooltipFormatter, metricsAgg, fieldName) {
    this._tooltipFormatter = (geojsonFeature) => {
      if (!this._metrics) {
        return '';
      }
      const match = this._metrics.find((bucket) => {
        return bucket.term === geojsonFeature.properties[this._joinField];
      });
      return tooltipFormatter(metricsAgg, match, fieldName);
    };
  }

  setJoinField(joinfield) {
    if (joinfield === this._joinField) {
      return;
    }
    this._joinField = joinfield;
    this._setStyle();
  }


  whenDataLoaded() {
    return this._whenDataLoaded;
  }

  setMetrics(metrics, metricsAgg) {
    this._metrics = metrics;
    this._metricsAgg = metricsAgg;
    this._valueFormatter = this._metricsAgg.fieldFormatter();
    this._setStyle();
  }

  setColorRamp(colorRamp) {
    if (_.isEqual(colorRamp, this._colorRamp)) {
      return;
    }
    this._colorRamp = colorRamp;
    this._setStyle();
  }

  setShowLabels(showLabels) {
    this.showLabels = showLabels;
  }

  equalsGeoJsonUrl(geojsonUrl) {
    return this._geojsonUrl === geojsonUrl;
  }

  getBounds() {
    const bounds = super.getBounds();
    return (this._boundsOfData) ? this._boundsOfData : bounds;
  }

  appendLegendContents(jqueryDiv) {

    if (!this._legendColors || !this._legendQuantizer || !this._metricsAgg) {
      return;
    }

    const titleText = this._metricsAgg.makeLabel();
    const $title = $('<div>').addClass('tilemap-legend-title').text(titleText);
    jqueryDiv.append($title);

    this._legendColors.forEach((color) => {

      const labelText = this._legendQuantizer
        .invertExtent(color)
        .map(this._valueFormatter)
        .join(' ?????');

      const label = $('<div>');
      const icon = $('<i>').css({
        background: color,
        'border-color': makeColorDarker(color)
      });

      const text = $('<span>').text(labelText);
      label.append(icon);
      label.append(text);

      jqueryDiv.append(label);
    });
  }
}


function makeColorDarker(color) {
  const amount = 1.3;//magic number, carry over from earlier
  return d3.hcl(color).darker(amount).toString();
}


function getMinMax(data) {
  let min = data[0].value;
  let max = data[0].value;
  for (let i = 1; i < data.length; i += 1) {
    min = Math.min(data[i].value, min);
    max = Math.max(data[i].value, max);
  }
  return { min, max };
}


function makeChoroplethStyler(data, colorramp, joinField) {


  if (data.length === 0) {
    return {
      getLeafletStyleFunction: function () {
        return emptyStyle();
      },
      getMismatches: function () {
        return [];
      },
      getLeafletBounds: function () {
        return null;
      }
    };
  }

  const { min, max } = getMinMax(data);
  const outstandingFeatures = data.slice();

  const boundsOfAllFeatures = new L.LatLngBounds();
  return {
    getLeafletStyleFunction: function (geojsonFeature) {
      let lastIndex = -1;
      const match = outstandingFeatures.find((bucket, index) => {
        lastIndex = index;
        return bucket.term === geojsonFeature.properties[joinField];
      });

      if (!match) {
        return emptyStyle();
      }

      outstandingFeatures.splice(lastIndex, 1);

      const boundsOfFeature = L.geoJson(geojsonFeature).getBounds();
      boundsOfAllFeatures.extend(boundsOfFeature);

      return {
        fillColor: getChoroplethColor(match.value, min, max, colorramp),
        weight: 2,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
      };
    },
    /**
     * should not be called until getLeafletStyleFunction has been called
     * @return {Array}
     */
    getMismatches: function () {
      return outstandingFeatures.map((bucket) => bucket.term);
    },
    getLeafletBounds: function () {
      return boundsOfAllFeatures.isValid() ? boundsOfAllFeatures : null;
    }
  };


}

function getLegendColors(colorRamp) {
  const colors = [];
  colors[0] = getColor(colorRamp, 0);
  colors[1] = getColor(colorRamp, Math.floor(colorRamp.length * 1 / 4));
  colors[2] = getColor(colorRamp, Math.floor(colorRamp.length * 2 / 4));
  colors[3] = getColor(colorRamp, Math.floor(colorRamp.length * 3 / 4));
  colors[4] = getColor(colorRamp, colorRamp.length - 1);
  return colors;
}

function getColor(colorRamp, i) {

  if (!colorRamp[i]) {
    return getColor();
  }

  const color = colorRamp[i][1];
  const red = Math.floor(color[0] * 255);
  const green = Math.floor(color[1] * 255);
  const blue = Math.floor(color[2] * 255);
  return `rgb(${red},${green},${blue})`;
}


function getChoroplethColor(value, min, max, colorRamp) {
  if (min === max) {
    return getColor(colorRamp, colorRamp.length - 1);
  }
  const fraction = (value - min) / (max - min);
  const index = Math.round(colorRamp.length * fraction) - 1;
  const i = Math.max(Math.min(colorRamp.length - 1, index), 0);

  return getColor(colorRamp, i);
}

const emptyStyleObject = {
  weight: 1,
  opacity: 0.6,
  color: 'rgb(200,200,200)',
  fillOpacity: 0
};
function emptyStyle() {
  return emptyStyleObject;
}

