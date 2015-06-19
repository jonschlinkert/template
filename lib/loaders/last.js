'use strict';

/* deps: clone-deep through2 bluebird extend-shallow */
var lazy = require('lazy-cache')(require);
var cloneDeep = lazy('clone-deep');
var through = lazy('through2');
var promise = lazy('bluebird');
var extend = require('extend-shallow');

/**
 * Last loaders: pushed onto every loaded stack to
 * load templates onto their respective views
 */

module.exports = function (app) {
  return function (views, normalizeFn) {
    normalizeFn = normalizeFn || function noop(val) {
      return val;
    };

    var loaders = {};
    loaders.sync = function lastSync(file) {
      return extendViews(file);
    };

    loaders.async = function lastAsync(file, next) {
      try {
        next(null, extendViews(file));
      } catch (err) {
        next(err);
      }
    };

    loaders.promise = promise().method(function lastPromise(file) {
      extendViews(file);
      return file;
    });

    loaders.stream = through().obj(function lastStream(files, enc, next) {
      try {
        for (var key in files) {
          var file = files[key];
          views[key] = normalizeFn(file);
          this.push(file);
        }
      } catch (err) {
        this.emit('error', err);
        return;
      }
      next();
    });

    function extendViews(templates) {
      for (var key in templates) {
        if (templates.hasOwnProperty(key)) {
          views[key] = normalizeFn(templates[key]);
        }
      }
      return templates;
    }
    return loaders;
  };
};
