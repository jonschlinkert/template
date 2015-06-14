'use strict';

var es = require('event-stream');
var Loader = require('load-templates');
var extend = require('extend-shallow');
var Promise = require('bluebird');
var vinylProps = ['history', 'base', 'relative', 'path', 'cwd', 'engine'];

/**
 * Fallback loader to use when no other loaders are defined.
 */

module.exports = function (app) {
  var loaders = {};

  loaders.sync = function fallback() {
    var opts = extend({rootKeys: vinylProps}, app.options);
    var loader = new Loader(opts);
    var res = loader.load.apply(loader, arguments);

    return res;
  };

  loaders.async = function fallback() {
    var args = [].slice.call(arguments);
    var next = args.pop();
    try {
      var res = loaders.sync.apply(loaders.sync, args);
      next(null, res);
    } catch (err) {
      next(err);
    }
  };

  loaders.promise = function fallback() {
    return Promise.method(loaders.sync);
  };

  loaders.stream = function fallback() {
    return es.through(function () {
      var res = loaders.sync.apply(loaders.sync, arguments);
      this.emit('data', res);
    });
  };

  return loaders;
};
