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
  app.loader('default', { loaderType: 'sync' }, function (views, opts) {
    return base(views, opts);
  });

  app.loader('default', { loaderType: 'async' }, function (views, options) {
    return function firstAsync() {
      var args = [].slice.call(arguments);
      var next = args.pop();
      var fn = base(views, opts);
      try {
        var res = fn.apply(fn, args);
        next(null, res);
      } catch (err) {
        next(err);
      }
    };
  });

  // loaders.promise = function firstPromise() {
  //   var Promise = promise();
  //   return Promise.method(loaders.sync);
  // };

  // loaders.stream = function firstStream() {
  //   return es().through(function () {
  //     var res = loaders.sync.apply(loaders.sync, arguments);
  //     this.emit('data', res);
  //   });
  // };

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
    app.onLoad(/./, function (view, next) {
      view.layout = view.locals.layout;
      next();
    });

    var LoadTemplates = lazyLoader();
    var loader = new LoadTemplates(extend({}, config, options));
    return function () {
      var res = loader.load.apply(loader, arguments);
      forOwn(res, function (val, key) {
        collection.set(key, val);
      });
      return collection;
    };
  }
};
