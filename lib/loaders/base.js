'use strict';

var utils = require('../utils');
var lazy = require('lazy-cache')(require);

/**
 * Lazily required module dependencies
 */

lazy('matched', 'glob');
lazy('extend-shallow', 'extend');
lazy('load-templates', 'loader');
lazy('for-own');

/**
 * Fallback loader to use when no other loaders are defined.
 */

module.exports = function (app) {
  var config = lazy.extend({rootKeys: utils.vinylProps}, app.options);

  app.loader('base-glob', function () {
    return lazy.glob.sync.apply(lazy.glob, arguments);
  });

  app.loader('helpers', { loaderType: 'sync' }, require('./helpers'));
  app.loader('default', { loaderType: 'sync' }, function firstSync(views, opts) {
    return first(views, opts);
  });

  function first(collection, options) {
    var opts = lazy.extend({}, config, options, collection.options);
    if (typeof opts.cwd === 'undefined' && app.options.cwd) {
      opts.cwd = app.options.cwd;
    }

    var loader = new lazy.loader(opts);

    return function (key, val, locals, options) {
      options = lazy.extend({}, opts, options);

      if (typeof key === 'function') {
        var fn = key;
        lazy.forOwn(collection, fn(collection, options));
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
