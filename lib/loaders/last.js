'use strict';

var lazy = require('lazy-cache')(require);
var through = lazy('through2');
var promise = lazy('bluebird');
var utils = require('../utils');

/**
 * Last loaders.
 *
 * The loaders are pushed onto every loader stack to ensure that
 * views are loaded correctly onto their respective collection
 * objects.
 */

module.exports = function (collection, normalizeFn) {
  normalizeFn = normalizeFn || utils.noop;
  var loaders = {};

  /**
   * Sync loader
   */

  loaders.sync = function lastSync(view) {
    return extendCollection(view);
  };

  /**
   * Async loader
   */

  loaders.async = function lastAsync(view, next) {
    try {
      next(null, extendCollection(view));
    } catch (err) {
      next(err);
    }
  };

  /**
   * Promise loader
   */

  loaders.promise = promise().method(loaders.sync);

  /**
   * Streams loader
   */

  loaders.stream = through().obj(function lastStream(views, enc, next) {
    try {
      var stream = this;
      extendCollection(views, function (view) {
        stream.push(view);
      });
    } catch (err) {
      this.emit('error', err);
    }
    return next();
  });


  /**
   * Add `views` to the current collection.
   */
  function extendCollection(views, fn) {
    for (var key in views) {
      if (views.hasOwnProperty(key)) {
        collection[key] = normalizeFn(key, views[key]);
        if (fn) fn(collection[key]);
      }
    }
    return collection;
  }

  return loaders;
};
