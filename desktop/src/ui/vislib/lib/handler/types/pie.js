define(function (require) {
  return function PieHandler(d3, Private) {
    var Handler = Private(require('ui/vislib/lib/handler/handler'));
    var Data = Private(require('ui/vislib/lib/data'));
    var Legend = Private(require('ui/vislib/lib/legend'));
    var ChartTitle = Private(require('ui/vislib/lib/chart_title'));

    /*
     * Handler for Pie visualizations.
     */

    return function (vis) {
      return new Handler(vis, {
        legend: new Legend(vis),
        chartTitle: new ChartTitle(vis.el)
      });
    };
  };
});
