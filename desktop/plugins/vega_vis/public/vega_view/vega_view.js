import * as vega from 'vega-lib';
import { VegaBaseView } from './vega_base_view';

//UNCOMMENT BELOW LINE FOR UGLIFY ISSUE
//import vegaTooltip from 'vega-tooltip';


export class VegaView extends VegaBaseView {
  async _initViewCustomizations() {
    // In some cases, Vega may be initialized twice... TBD
    if (!this._$container) return;

    //UNCOMMENT BELOW LINE FOR UGLIFY ISSUE
    //const handler = new vegaTooltip.Handler();

    const view = new vega.View(vega.parse(this._parser.spec), this._vegaViewConfig);
    this.setDebugValues(view, this._parser.spec, this._parser.vlspec);

    //UNCOMMENT BELOW LINE FOR UGLIFY ISSUE
    //view.tooltip(handler.call);


    view.warn = this.onWarn.bind(this);
    view.error = this.onError.bind(this);
    if (this._parser.useResize) this.updateVegaSize(view);
    view.initialize(this._$container.get(0), this._$controls.get(0));

    if (this._parser.useHover) view.hover();

    this._addDestroyHandler(() => {
      this._view = null;
      view.finalize();
    });

    await view.runAsync();
    this._view = view;
  }
}
