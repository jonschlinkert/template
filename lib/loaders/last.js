'use strict';

var extend = require('extend-shallow');
var lazy = require('lazy-cache')(require);
var cloneDeep = lazy('clone-deep');
var through = lazy('through2');
var Promise = lazy('bluebird');
var View = require('../view');

/**
 * Last loaders: pushed onto every loaded stack to
 * load templates onto their respective collections
 */

module.exports = function (collection) {
  /* deps: clone-deep through2 bluebird */
  var loaders = {};

  function extendViews(file) {
    for (var key in file) {
      collection[key] = normalize(file[key]);
    }
    return file;
  }

  function normalize(file) {
    var opts = cloneDeep()(collection._.options || {});
    var context = opts.contexts || {};
    delete opts.contexts;

    file.contexts = extend({}, file.contexts, context);
    file.contexts.create = opts;
    file.options = extend({}, opts, file.options);
    return new View(file);
  }

  loaders.sync = function (file) {
    // run this file's `.onLoad` middleware handler
    // app.handle('onLoad', file, app.handleError('onLoad', {path: key}));
    return extendViews(file);
  };

  loaders.async = function lastAsync_(file, next) {
    // run this file's `.onLoad` middleware handler
    // app.handle('onLoad', file, app.handleError('onLoad', {path: key}));
    try {
      next(null, extendViews(file));
    } catch (err) {
      next(err);
    }
  };

  loaders.promise = Promise().method(function lastPromise(file) {
    extendViews(file);
    // run this file's `.onLoad` middleware handler
    // app.handle('onLoad', file, app.handleError('onLoad', {path: key}));
    return file;
  });

  loaders.stream = through().obj(function lastStream(file, enc, next) {
    try {
      toTemplate(extendViews, file);
      // app.handle('onLoad', file, app.handleError('onLoad', {path: key}));
      this.push(file);
    } catch (err) {
      this.emit('error', err);
    }
    next();
  });

  function toTemplate(fn, file) {
    var keys = ['_contents', 'stat', 'history'];
    var res = {}, template = {};
    for (var key in file) {
      if (file.hasOwnProperty(key) && keys.indexOf(key) === -1) {
        res[key] = file[key];
      }
    }
    res.path = file.path;
    if (file.contents) {
      res.content = file.contents.toString();
    }
    template[file.path] = res;
    fn(template);
    return res;
  }
  return loaders;
};
