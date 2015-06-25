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

module.exports = function (collection, fn) {
  fn = fn || utils.noop;
  var loaders = {};

  /**
   * Sync loader
   */

  loaders.sync = function lastSync(views) {
    return extendCollection(views);
  };

  /**
   * Async loader
   */

  loaders.async = function lastAsync(views, next) {
    try {
      next(null, extendCollection(views));
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

  loaders.stream = through().obj(function lastStream(file, enc, next) {
    try {
      collection[file.path] = fn(file.path, file);
      this.push(file);
    } catch (err) {
      this.emit('error', err);
    }
    return next();
  });

  /**
   * Add `views` to the current collection.
   */

  function extendCollection(views) {
    for (var key in views) {
      if (views.hasOwnProperty(key)) {
        collection[key] = fn(key, views[key]);
      }
    }
    return collection;
  }

  return loaders;
};
