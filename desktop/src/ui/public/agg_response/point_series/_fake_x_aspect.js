import VisAggConfigProvider from 'ui/Vis/AggConfig';
import AggTypesAggTypeProvider from 'ui/agg_types/AggType';

define(function (require) {
  return function PointSeriesFakeXAxis(Private) {
    var AggConfig = Private(VisAggConfigProvider);
    var AggType = Private(AggTypesAggTypeProvider);

    var allAgg = new AggType({
      name: 'all',
      title: 'All docs',
      ordered: false,
      hasNoDsl: true
    });

    return function makeFakeXAxis(vis) {
      var fake = new AggConfig(vis, {
        type: allAgg,
        schema: vis.type.schemas.all.byName.segment
      });

      return {
        i: -1,
        agg: fake,
        col: {
          aggConfig: fake,
          label: fake.makeLabel()
        }
      };
    };
  };
});
