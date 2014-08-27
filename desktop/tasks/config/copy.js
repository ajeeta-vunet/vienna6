module.exports = function (grunt) {
  var config = {

    kibana_src: {
      expand: true,
      cwd: '<%= app %>',
      src: '**',
      dest: '<%= build %>/src/'
    },

    server_src: {
      expand: true,
      cwd: '<%= src %>/server',
      src: '**',
      dest: '<%= build %>/kibana'
    },

    dist: {
      options: { mode: true },
      files: [
        {
          src: '<%= build %>/kibana/INSTALL',
          dest: '<%= build %>/dist/INSTALL',
        },
        {
          src: '<%= build %>/kibana/bin/kibana.bat',
          dest: '<%= build %>/dist/bin/kibana.bat',
        },
        {
          src: '<%= build %>/kibana/bin/kibana.sh',
          dest: '<%= build %>/dist/bin/kibana',
        },
        {
          expand: true,
          cwd: '<%= build %>/kibana/',
          src: '*.jar',
          dest: '<%= build %>/dist/lib/'
        },
        {
          expand: true,
          cwd: '<%= src %>/server/config/',
          src: 'kibana.yml',
          dest: '<%= build %>/dist/config/'
        }
      ]
    }

  };

  return config;
};
