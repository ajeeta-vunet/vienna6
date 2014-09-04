define(function (require) {
  return function AggConfigsFactory(Private) {
    var _ = require('lodash');
    var AggConfig = Private(require('components/vis/_agg_config'));
    var Registry = require('utils/registry/registry');

    _(AggConfigs).inherits(Registry);
    function AggConfigs(vis, configStates) {
      this.vis = vis;

      AggConfigs.Super.call(this, {
        index: ['id'],
        group: ['schema.group', 'type.name'],
        initialSet: (configStates || []).map(function (aggConfigState) {
          if (aggConfigState instanceof AggConfig) return aggConfigState;
          return new AggConfig(vis, aggConfigState);
        })
      });
    }

    AggConfigs.prototype.toDsl = function () {
      var dslTopLvl = {};
      var dslLvlCursor;

      this.getSorted()
      .filter(function (config) {
        return !config.type.hasNoDsl;
      })
      .forEach(function nestEachConfig(config, i, list) {
        var prevConfig = list[i - 1];
        var prevDsl = prevConfig && dslLvlCursor && dslLvlCursor[prevConfig.id];

        // advance the cursor
        if (prevDsl && prevConfig.schema.group !== 'metrics') {
          dslLvlCursor = prevDsl.aggs || (prevDsl.aggs = {});
        }

        // start at the top level
        if (!dslLvlCursor) dslLvlCursor = dslTopLvl;

        dslLvlCursor[config.id] = config.toDsl();
      });

      return dslTopLvl;
    };

    AggConfigs.prototype.getSorted = function () {
      return _.sortBy(this, function (agg) {
        return agg.schema.group === 'metrics' ? 1 : 0;
      });
    };

    return AggConfigs;
  };
});