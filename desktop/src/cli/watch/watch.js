'use strict';

let cluster = require('cluster');
let join = require('path').join;
let _ = require('lodash');
var chokidar = require('chokidar');

let Log = require('../Log');
let fromRoot = require('../../utils/fromRoot');
let Worker = require('./Worker');

module.exports = function (opts) {

  let watcher = chokidar.watch([
    'src/cli',
    'src/fixtures',
    'src/server',
    'src/utils',
    'src/plugins/*/*', // files at the root of a plugin
    'src/plugins/*/lib/**/*', // files within a lib directory for a plugin
    'config/**/*',
  ], {
    cwd: fromRoot('.')
  });

  let log = new Log(opts.quiet, opts.silent);
  let customLogging = opts.quiet || opts.silent || opts.verbose;

  let workers = [
    new Worker({
      type: 'optmzr',
      title: 'optimizer',
      log: log,
      argv: _.compact([
        customLogging ? null : '--quiet',
        '--plugins.initialize=false',
        '--server.autoListen=false',
        '--optimize._workerRole=send'
      ]),
      filters: [
        /src\/server\/(optimize|ui|plugins)\//,
        /src\/plugins\/[^\/]+\/[^\/]+\.js$/,
        /src\/cli\//
      ]
    }),

    new Worker({
      type: 'server',
      log: log,
      argv: [
        '--optimize._workerRole=receive'
      ]
    })
  ];

  workers.forEach(function (worker) {
    worker.on('broadcast', function (msg) {
      workers.forEach(function (to) {
        if (to !== worker && to.fork) to.fork.send(msg);
      });
    });
  });


  var addedCount = 0;
  function onAddBeforeReady() {
    addedCount += 1;
  }

  function onReady() {
    // start sending changes to workers
    watcher.removeListener('add', onAddBeforeReady);
    watcher.on('all', onAnyChangeAfterReady);

    log.good('Watching for changes', `(${addedCount} files)`);
    _.invoke(workers, 'start');
  }

  function onAnyChangeAfterReady(e, path) {
    _.invoke(workers, 'onChange', path);
  }

  function onError(err) {
    log.bad('Failed to watch files!\n', err.stack);
    process.exit(1);
  }

  watcher.on('add', onAddBeforeReady);
  watcher.on('ready', onReady);
  watcher.on('error', onError);
};
