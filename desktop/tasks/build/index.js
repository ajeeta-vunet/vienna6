import { flatten } from 'lodash';
module.exports = function (grunt) {
  grunt.registerTask('build', 'Build packages', function () {
    grunt.task.run(flatten([
      'clean:build',
      'clean:target',
      '_build:downloadNodeBuilds',
      '_build:extractNodeBuilds',
      'copy:devSource',
      'clean:devSourceForTestbed',
      'babel:build',
      '_build:plugins',
      '_build:data',
      '_build:verifyTranslations',
      '_build:packageJson',
      '_build:readme',
      '_build:babelCache',
      '_build:installNpmDeps',
      '_build:installNpmDepsForVega',
      '_build:notice',
      '_build:removePkgJsonDeps',
      'clean:testsFromModules',
      'clean:examplesFromModules',
      'run:optimizeBuild',
      'stop:optimizeBuild',
      '_build:versionedLinks',
      '_build:osShellScripts',
      grunt.option('skip-archives') ? [] : ['_build:archives'],
      grunt.option('skip-os-packages') ? [] : [
        '_build:pleaseRun',
        '_build:osPackages',
      ],
      '_build:shasums'
    ]));
  });
};
