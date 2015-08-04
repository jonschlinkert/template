'use strict';

var globby = require('lazy-globby');
var lazy = require('lazy-cache')(require);
var extend = lazy('extend-shallow');
var lazyLoader = lazy('load-templates');
var forOwn = lazy('for-own');
var utils = require('../utils');

/**
 * Fallback loader to use when no other loaders are defined.
 */

module.exports = function (app) {
  var config = extend()({rootKeys: utils.vinylProps}, app.options);

  app.loader('base-glob', function () {
    return globby().sync.apply(globby, arguments);
  });

  app.loader('helpers', { loaderType: 'sync' }, require('./helpers'));
  app.loader('default', { loaderType: 'sync' }, function firstSync(views, opts) {
    return first(views, opts);
  });

  function first(collection, options) {
    var opts = extend()({}, config, options, collection.options);
    if (typeof opts.cwd === 'undefined' && app.options.cwd) {
      opts.cwd = app.options.cwd;
    }

    var LoadTemplates = lazyLoader();
    var loader = new LoadTemplates(opts);

    return function (key, val, locals, options) {
      options = extend()({}, opts, options);

      if (typeof key === 'function') {
        var fn = key;
        forOwn()(collection, fn(collection, options));
        return collection;
      }

      if (!Array.isArray(key) && typeof key === 'object') {
        collection.visit('addView', key);
        return collection;
      }

      var res = loader.load.apply(loader, arguments);
      collection.visit('addView', res);
      return collection;
    };
  }
};
