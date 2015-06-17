'use strict';

/* deps: clone-deep through2 bluebird extend-shallow */
var lazy = require('lazy-cache')(require);
var cloneDeep = lazy('clone-deep');
var through = lazy('through2');
var Promise = lazy('bluebird');
var extend = require('extend-shallow');

/**
 * Last loaders: pushed onto every loaded stack to
 * load templates onto their respective views
 */

module.exports = function (app) {
  return function (plural) {
    var views = app.views[plural];
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

    loaders.promise = Promise().method(function lastPromise(file) {
      extendViews(file);
      return file;
    });

    loaders.stream = through().obj(function lastStream(file, enc, next) {
      try {
        extendViews(file);
        this.push(file);
      } catch (err) {
        this.emit('error', err);
        return;
      }
      next();
    });

    function extendViews(templates) {
      for (var key in templates) {
        if (templates.hasOwnProperty(key)) {
          views[key] = normalize(templates[key]);
        }
      }
      return templates;
    }

    function normalize(file) {
      var opts = cloneDeep()(views.options || {});
      var context = opts.contexts || {};
      delete opts.contexts;

      file.contexts = extend({}, file.contexts, context);
      file.contexts.create = opts;
      file.options = extend({}, opts, file.options);

      app.handle('onLoad', file, app.handleError('onLoad', {path: file.path}));
      return file;
    }

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
      } else {
        res.contents = new Buffer(file.content);
      }
      template[file.path] = res;
      fn(res);
      return res;
    }
    return loaders;
  }
}
