'use strict';

var fs = require('fs');
var path = require('path');
var forOwn = require('for-own');
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
  var config = extend({rootKeys: utils.vinylProps}, app.options);

  app.loader('helpers', { loaderType: 'sync' }, require('./helpers'));
  app.loader('default', { loaderType: 'sync' }, function firstSync(views, opts) {
    return base(views, opts);
  });

  app.loader('default', { loaderType: 'async' }, function firstAsync(views, opts) {
    return function () {
      var args = [].slice.call(arguments);
      var next = args.pop();
      try {
        var fn = base(views, opts);
        var res = fn.apply(fn, args);
        next(null, res);
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

  // function baseLoader(files, opts) {
  //   return files.reduce(function (acc, fp) {
  //     fp = path.resolve(opts.cwd, fp);
  //     var str = fs.readFileSync(fp, 'utf8');
  //     var name = utils.renameKey(app)(fp, opts);
  //     acc[name] = {path: fp, content: str, cwd: opts.cwd};
  //     return acc;
  //   }, {});
  // }

  function base(collection, options) {
    var LoadTemplates = lazyLoader();
    var loader = new LoadTemplates(extend({}, config, options));

    app.onLoad(/./, function (view, next) {
      view.layout = view.locals.layout;
      next();
    });

    return function (key, val, locals, options) {
      var args = [].slice.call(arguments);
      var res;

      if (typeof key === 'function') {
        var fn = key(collection, options);
        forOwn(collection, fn);
        return collection;
      }

      var res = loader.load.apply(loader, arguments);
      forOwn(res, function (value, prop) {
        collection.set(prop, value);
      });
      return collection;
    };
  }
};
