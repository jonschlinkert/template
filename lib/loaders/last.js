'use strict';

var lazy = require('lazy-cache')(require);
var through = lazy('through2');
var promise = lazy('bluebird');
var utils = require('../utils');

/**
 * Last loaders: pushed onto every loaded stack to
 * load templates onto their respective views
 */

module.exports = function (views, normalizeFn) {
  normalizeFn = normalizeFn || utils.noop;
  var loaders = {};

  loaders.sync = function lastSync(view) {
    return extendViews(view);
  };

  loaders.async = function lastAsync(view, next) {
    try {
      next(null, extendViews(view));
    } catch (err) {
      next(err);
    }
  };

  loaders.promise = promise().method(function lastPromise(view) {
    extendViews(view);
    return view;
  });

  loaders.stream = through().obj(function lastStream(views, enc, next) {
    try {
      for (var key in views) {
        if (views.hasOwnProperty(key)) {
          views[key] = normalizeFn(key, views[key]);
          this.push(views[key]);
        }
      }
    } catch (err) {
      this.emit('error', err);
    }
    return next();
  });

  function extendViews(templates) {
    for (var key in templates) {
      if (templates.hasOwnProperty(key)) {
        views[key] = normalizeFn(key, templates[key]);
      }
    }
    return templates;
  }
  return loaders;
};
