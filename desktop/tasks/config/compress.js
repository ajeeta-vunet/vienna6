module.exports = function (grunt) {
  var _ = require('lodash');
  var archiveName = function (plugin) {
    return '<%= target %>/<%= pkg.name %>-' + (plugin ? 'plugin-' : '') + '<%= pkg.version %>';
  };

  return _.mapValues({
    build_zip: archiveName() + '.zip',
    build_tarball: archiveName() + '.tar.gz',
    plugin: archiveName(true) + '.tar.gz'
  }, function (filename, task) {
    return {
      options: {
        archive: filename
      },
      files: [
        {
          expand: true,
          cwd: '<%= build %>/dist',
          src: ['**/*'],
          dest: '<%= pkg.name %>' + (task === 'plugin' ? '/_site' : '')
        }
      ]
    };
  });
};
