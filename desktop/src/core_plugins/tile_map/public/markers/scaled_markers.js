import L from 'leaflet';
import _ from 'lodash';
import d3 from 'd3';
import $ from 'jquery';
import { EventEmitter } from 'events';
import { prepareLinkInfo } from 'ui/utils/link_info_eval.js';

export class ScaledLocationMarkers extends EventEmitter {

  constructor(featureCollection, options, targetZoom, kibanaMap) {
    super();
    this._geohashGeoJson = featureCollection;
    this._zoom = targetZoom;

    this._valueFormatter = options.valueFormatter;
    this._tooltipFormatter = options.tooltipFormatter;

    this._redMarkerMetric = options.redMarkerMetric;
    this._locationMetric = options.locationMetric;
    // If there is no title is given for the marker's popup then
    // use empty title.
    this._markerPopupTitle = options.markerPopupTitle !== undefined ?
      options.markerPopupTitle : '';
    this._linkInfo = options.linkInfo;

    this._legendColors = null;
    this._legendQuantizer = null;

    this._getAppState = options.getAppState;
    this._Private = options.Private;
    this._timefilter = options.timefilter;

    this._popups = [];

    const layerOptions = {
      pointToLayer: this.getMarkerFunction(),
    };
    if (!options.isFilteredByCollar) {
      layerOptions.filter = (feature) => {
        const bucketRectBounds = _.get(feature, 'properties.rectangle');
        return kibanaMap.isInside(bucketRectBounds);
      };
    }
    this._leafletLayer = L.geoJson(null, layerOptions);

    this._leafletLayer.addData(this._geohashGeoJson);

    this._leafletLayer.bringToFront();

  }

  /**
   * getMarkerFunction goes through each feature
   * and put a location marker for that lat lng.
   * Also it iterates the values and construct the
   * popup for the location marker. The popup will
   * open when the marker is clicked.
  **/
  getMarkerFunction() {

    const MarkerIcon = L.Icon.extend({
      options: {
        iconSize: [20, 25]
      }
    });

    const greenIcon = new MarkerIcon({
      iconUrl: '/ui/vienna_images/green_mpin.svg'
    });

    const redIcon = new MarkerIcon({
      iconUrl: '/ui/vienna_images/red_mpin.svg'
    });

    return (feature, latlng) => {
      const value = feature.properties.values;
      let showRedMarker = false;
      let metrics = '';
      let metricAgg;
      value.forEach(val => {
        Object.entries(val).forEach(([key, value]) => {
          // Get the aggregation config for the incoming metric
          const metricAggs = feature.properties.aggConfigResults;
          metricAggs.forEach(agg => {
            Object.entries(agg).forEach(([metricKey, metricValue]) => {
              if (metricKey === key) {
                metricAgg = agg[key].aggConfig;
                return;
              }
            });
          });
          let formattedValue = `${value}`;
          // If field formatting is used for the metric
          // get the formatted value
          if (metricAgg !== undefined) {
            formattedValue = metricAgg.fieldFormatter()(formattedValue);
          }

          if (this._linkInfo) {
            // go though the reference links and check whether
            // the reference link field is used in the aggregations.
            for (const i in this._linkInfo) {
              if (key === this._linkInfo[i].field) {
                const ref = this._viewDashboardForThisMetric(this._linkInfo[i], value);
                formattedValue = '<a href="' + ref + '">' + `${formattedValue}` + '</a>';
              }
            }
          }
          if (key !== 'undefined' && key !== undefined) {
            if (key === this._redMarkerMetric && (value > 0 && value !== undefined)) {
              showRedMarker = true;
            }
            metrics = metrics + `<div class="card-count">
                                  <span class="count-label">${key}</span>
                                  <span class="count-info"><span>` + formattedValue + `</span></span>
                                </div>`;
          }
        });
      });
      metrics = metrics + '</div>';
      const template = ` <div class="card">
                            <div class="cardcontent">
                              <div class="card-title">
                                ${this._markerPopupTitle}
                              </div>
                            <div class="card-details">
                              ${metrics}
                            </div>
                          </div>`;

      if (showRedMarker) {
        return L.marker(latlng, { icon: redIcon }).addTo(this._leafletLayer).bindPopup(template);
      }
      else {
        return L.marker(latlng, { icon: greenIcon }).addTo(this._leafletLayer).bindPopup(template);
      }

    };
  }

  _viewDashboardForThisMetric(refLink, value) {
    let referencePage = '';
    let searchString = '';
    let fieldName = undefined;
    let fieldValue = '';

    if (refLink.searchString !== undefined && refLink.searchString !== '') {
      // If additional search string is given combine it with search string
      // from metric
      if (searchString !== '') {
        searchString = '(' + searchString + ') AND (' + refLink.searchString + ')';
      } else {
        searchString = refLink.searchString;
      }
    }
    if (refLink.useFieldAsFilter) {
      fieldName = refLink.field;
      fieldValue = value;
    }
    if (refLink.type === 'dashboard' || refLink.dashboard) {
      referencePage = prepareLinkInfo(
        'dashboard/',
        refLink.dashboard.id,
        searchString,
        refLink.retainFilters,
        fieldName,
        fieldValue,
        undefined,
        undefined,
        undefined,
        this._getAppState,
        this._Private,
        this._timefilter);
    }
    else if (refLink.type === 'event') {
      referencePage = prepareLinkInfo(
        'event/',
        '',
        searchString,
        refLink.retainFilters,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this._getAppState,
        this._Private,
        this._timefilter);
    }
    return ('/app/vienna#/' + referencePage);
  }

  getLeafletLayer() {
    return this._leafletLayer;
  }

  movePointer() {
  }

  getLabel() {
    if (this._popups.length) {
      return this._popups[0].feature.properties.aggConfigResult.aggConfig.makeLabel();
    }
    return '';
  }

  appendLegendContents(jqueryDiv) {

    if (!this._legendColors || !this._legendQuantizer) {
      return;
    }

    const titleText = this.getLabel();
    const $title = $('<div>').addClass('tilemap-legend-title').text(titleText);
    jqueryDiv.append($title);

    this._legendColors.forEach((color) => {
      const labelText = this._legendQuantizer
        .invertExtent(color)
        .map(this._valueFormatter)
        .join(' – ');

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


