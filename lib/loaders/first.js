'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('lazy-globby');
var lazy = require('lazy-cache')(require);
var extend = lazy('extend-shallow');
var lazyLoader = lazy('load-templates');
var promise = lazy('bluebird');
var es = lazy('event-stream');
var utils = require('../utils');

/**
 * Fallback loader to use when no other loaders are defined.
 */

module.exports = function (app) {
  var loaders = {};

  loaders.sync = function firstSync(key, value, locals, options) {
    var opts = extend()({}, this.options, value);
    opts.cwd = opts.cwd || process.cwd();
    var files = Array.isArray(key) ? glob().sync(key, opts) : [];
    if (!files.length) {
      return backupLoader.apply(backupLoader, arguments);
    }
    return baseLoader(files, opts);
  };

  loaders.async = function firstAsync() {
    var args = [].slice.call(arguments);
    var next = args.pop();
    var fn = loaders.sync;
    try {
      var res = loaders.sync.apply(loaders.sync, args);
      next(null, res);
    } catch (err) {
      next(err);
    }
  };

  loaders.promise = function firstPromise() {
    var Promise = promise();
    return Promise.method(loaders.sync);
  };

  loaders.stream = function firstStream() {
    return es().through(function () {
      var res = loaders.sync.apply(loaders.sync, arguments);
      this.emit('data', res);
    });
  };

  function baseLoader(files, opts) {
    return files.reduce(function (acc, fp) {
      fp = path.resolve(opts.cwd, fp);
      var str = fs.readFileSync(fp, 'utf8');
      var name = utils.renameKey(app)(fp, opts);
      acc[name] = {path: fp, content: str, cwd: opts.cwd};
      return acc;
    }, {});
  }

  function backupLoader() {
    var opts = extend()({rootKeys: utils.vinylProps}, app.options);
    var Loader = lazyLoader();
    var loader = new Loader(opts);
    var res = loader.load.apply(loader, arguments);
    return res;
  }
  return loaders;
};
