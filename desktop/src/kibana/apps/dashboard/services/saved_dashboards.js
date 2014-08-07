define(function (require) {
  var module = require('modules').get('app/dashboard');
  var _ = require('lodash');
 // bring in the factory
  require('apps/dashboard/services/_saved_dashboard');


  // Register this service with the saved object registry so it can be
  // edited by the object editor.
  require('apps/settings/saved_object_registry').register({
    service: 'savedDashboards',
    title: 'dashboards'
  });

  // This is the only thing that gets injected into controllers
  module.service('savedDashboards', function (Promise, SavedDashboard, config, es) {

    // Returns a single dashboard by ID, should be the name of the dashboard
    this.get = function (id) {

      // Returns a promise that contains a dashboard which is a subclass of docSource
      return (new SavedDashboard(id)).init();
    };

    this.urlFor = function (id) {
      return '#/dashboard/' + encodeURIComponent(id);
    };

    this.delete = function (ids) {
      ids = !_.isArray(ids) ? [ids] : ids;
      return Promise.map(ids, function (id) {
        return (new SavedDashboard(id)).delete();
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
        type: 'dashboard',
        body: body,
        size: 100
      })
      .then(function (resp) {
        return {
          total: resp.hits.total,
          hits: resp.hits.hits.map(function (hit) {
            var source = hit._source;
            source.id = hit._id;
            source.url = self.urlFor(hit._id);
            return source;
          })
        };
      });
    };
  });
});
