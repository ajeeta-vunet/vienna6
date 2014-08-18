define(function (require) {
  var app = require('modules').get('apps/visualize');
  var _ = require('lodash');

  require('apps/visualize/saved_visualizations/_saved_vis');

  // Register this service with the saved object registry so it can be
  // edited by the object editor.
  require('apps/settings/saved_object_registry').register({
    service: 'savedVisualizations',
    title: 'visualizations'
  });

  app.service('savedVisualizations', function (Promise, es, config, SavedVis, Private) {
    var visTypes = Private(require('components/vis_types/index'));

    this.get = function (id) {
      return (new SavedVis(id)).init();
    };

    this.urlFor = function (id) {
      return '#/visualize/edit/' + encodeURIComponent(id);
    };

    this.delete = function (ids) {
      ids = !_.isArray(ids) ? [ids] : ids;
      return Promise.map(ids, function (id) {
        return (new SavedVis(id)).delete();
      });
    };

    this.find = function (searchString) {
      var self = this;
      var body = searchString ? {
          query: {
            simple_query_string: {
              query: searchString + '*',
              fields: ['title^3', 'description'],
              default_operator: 'AND'
            }
          }
        }: { query: {match_all: {}}};
      return es.search({
        index: config.file.kibanaIndex,
        type: 'visualization',
        body: body,
        size: 100,
      })
      .then(function (resp) {
        return {
          total: resp.hits.total,
          hits: resp.hits.hits.map(function (hit) {
            var source = hit._source;
            source.id = hit._id;
            source.url = self.urlFor(hit._id);
            source.typeDef = visTypes.byName[source.typeName];
            source.icon = source.typeDef.icon;
            return source;
          })
        };
      });
    };
  });
});
