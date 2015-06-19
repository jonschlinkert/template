'use strict';

var fs = require('fs');
var path = require('path');
var lazy = require('lazy-cache')(require);
var glob = require('lazy-globby');
var es = lazy('event-stream');
var lazyLoader = lazy('load-templates');
var extend = lazy('extend-shallow');
var promise = lazy('bluebird');
var utils = require('../utils');
var vinylProps = ['history', 'base', 'relative', 'path', 'cwd', 'engine'];

/**
 * Fallback loader to use when no other loaders are defined.
 */

module.exports = function (app) {
  var loaders = {};

  function backupLoader() {
    var opts = extend()({rootKeys: vinylProps}, app.options);
    var Loader = lazyLoader();
    var loader = new Loader(opts);
    var res = loader.load.apply(loader, arguments);
    return res;
  }

  function renameKey(fp, options) {
    var opts = extend()({}, app.options, options);
    if (opts.renameKey) {
      return opts.renameKey(fp, options);
    }
    return path.basename(fp);
  }

  loaders.sync = function firstLoader(pattern, options) {
    var opts = extend()({}, this.options, options);
    opts.cwd = opts.cwd || process.cwd();
    var files = !utils.isObject(pattern) ? glob().sync(pattern, opts) : [];

    if (!files.length) {
      return backupLoader.apply(backupLoader, arguments);
    }

    return files.reduce(function (acc, fp) {
      fp = path.resolve(opts.cwd, fp);
      var str = fs.readFileSync(fp, 'utf8');
      var name = renameKey(fp, opts);
      acc[name] = {path: fp, content: str, cwd: opts.cwd};
      return acc;
    }, {});
  };

  loaders.async = function firstLoader() {
    var args = [].slice.call(arguments);
    var next = args.pop();
    var fn = loaders.sync;
    try {
      var res = fn.apply(fn, args);
      next(null, res);
    } catch (err) {
      next(err);
    }
  };

  loaders.promise = function firstLoader() {
    var Promise = promise();
    return Promise.method(loaders.sync);
  };

  loaders.stream = function firstLoader() {
    return es().through(function () {
      var res = loaders.sync.apply(loaders.sync, arguments);
      this.emit('data', res);
    });
  };

  return loaders;
};
