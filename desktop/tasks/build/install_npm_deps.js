import { exec } from 'child_process';
module.exports = function (grunt) {
  grunt.registerTask('_build:installNpmDeps', function () {
    grunt.file.mkdir('build/kibana/node_modules');

    exec('npm install  --production --no-optional', {
      cwd: grunt.config.process('<%= root %>/build/kibana')
    }, this.async());
  });

  // This is to run npm install inside vega_vis folder.
  grunt.registerTask('_build:installNpmDepsForVega', function () {
    grunt.file.mkdir('build/kibana/plugins/vega_vis/node_modules');

    exec('npm install  --production --no-optional', {
      cwd: grunt.config.process('<%= root %>/build/kibana')
    }, this.async());
  });
};


