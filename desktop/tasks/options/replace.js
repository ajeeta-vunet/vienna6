module.exports = function (config) {
  return {
    // copy source to temp, we will minify in place for the dist build
    dev_marvel_config: {
      options: {
        patterns: [
          {
            match: 'port',
            replacement: '<%= esPort.dev %>',
          },
          {
            match: 'default_route',
            replacement: '<%= defaultRoute.dev %>',
          },
          {
            match: 'stats_report_url',
            replacement: '<%= statsReportUrl.dev %>',
          }
        ]
      },
      files: [
        {expand: true, flatten: true, src: ['./config.js'], dest: '<%= buildTempDir %>'}
      ]
    },
    dist_marvel_config: {
      options: {
        patterns: [
          {
            match: 'port',
            replacement: '<%= esPort.dist %>',
          },
          {
            match: 'default_route',
            replacement: '<%= defaultRoute.dist %>',
          },
          {
            match: 'report_url',
            replacement: '<%= reportUrl.dist %>',
          }
        ]
      },
      files: [
        {expand: true, flatten: true, src: ['./config.js'], dest: '<%= buildTempDir %>/src/'}
      ]
    }
  };
};