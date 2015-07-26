'use strict';

var lazy = require('lazy-cache')(require);
var extend = lazy('extend-shallow');
var lazyLoader = lazy('load-templates');
var promise = lazy('bluebird');
var forOwn = lazy('for-own');
var es = lazy('event-stream');
var utils = require('../utils');

/**
 * Fallback loader to use when no other loaders are defined.
 */

module.exports = function (app) {
  var config = extend()({rootKeys: utils.vinylProps}, app.options);

  app.loader('helpers', { loaderType: 'sync' }, require('./helpers'));
  app.loader('default', { loaderType: 'sync' }, function firstSync(views, opts) {
    return base(views, opts);
  });

  app.loader('default', { loaderType: 'async' }, function firstAsync(views, opts) {
    return function (pattern, opts, next) {
      var args = [].slice.call(arguments);
      next = args.pop();
      try {
        var fn = base(views, opts);
        next(null, fn.apply(fn, args));
      } catch (err) {
        next(err);
      }
    };
  });

  app.loader('default', { loaderType: 'promise' }, function firstPromise(views, opts) {
    return function () {
      var Promise = promise();
      return Promise.method(base(views, opts));
    };
  });

  app.loader('default', { loaderType: 'stream' }, function firstStream(views, opts) {
    return function () {
      var fn = base(views, opts);
      return es().through(function () {
        this.emit('data', fn.apply(fn, arguments));
      });
    };
  });

  function base(collection, options) {
    var opts = extend()({}, config, options, collection.options);
    if (typeof opts.cwd === 'undefined') {
      opts.cwd = app.options.cwd || '.';
    }

    var LoadTemplates = lazyLoader();
    var loader = new LoadTemplates(opts);
    var args = [].slice.call(arguments);

    return function (key, val, locals, options) {
      options = extend()({}, opts, options);

      if (typeof key === 'function') {
        var fn = key;
        forOwn()(collection, fn(collection, options));
        return collection;
      }

      var res = loader.load.apply(loader, arguments);
      forOwn()(res, function (value, prop) {
        collection.set(prop, value);
      });
      return collection;
    };
  }
};
