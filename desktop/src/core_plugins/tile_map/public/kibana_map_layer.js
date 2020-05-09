import { EventEmitter } from 'events';


export class KibanaMapLayer extends EventEmitter {
  constructor() {
    super();
    this._leafletLayer = null;
    this._leafletMap = null;
  }

  async getBounds() {
    return this._leafletLayer.getBounds();
  }

  getZoomLevel() {
    return this._leafletMap.getZoom();
  }

  getLeafletMap() {
    return this._leafletMap;
  }

  setLeafletMap(leafletMap) {
    this._leafletMap = leafletMap;
  }

  addToLeafletMap(leafletMap) {
    this._leafletLayer.addTo(leafletMap);
  }

  removeFromLeafletMap(leafletMap) {
    leafletMap.removeLayer(this._leafletLayer);
  }

  appendLegendContents() {
  }

  updateExtent() {
  }

  movePointer() {
  }

  getAttributions() {
    return this._attribution;
  }
}








