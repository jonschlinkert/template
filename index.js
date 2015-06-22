'use strict';

var path = require('path');
var extend = require('extend-shallow');
var isObject = require('isobject');
var Loaders = require('loader-cache');
var set = require('set-value');
var Views = require('./lib/views');

/**
 * Create a new instance of `Template` with the given `options.
 *
 * @param {Object} `options`
 * @api public
 */

function Template(options) {
  if (!(this instanceof Template)) {
    return new Template(options);
  }
  this.loaders = new Loaders(options);
  this.options = options || {};
  this.router = this.options.router;
  this.engines = {};
  this.views = {};
  this.cache = {};
}

/**
 * Template methods
 */

Template.prototype = {
  constructor: Template,

  /**
   * Create a new `Views` collection.
   */

  create: function (name, options, loaders) {
    var views = new Views(options, loaders);

    this.views[name] = views;
    this.mixin(name, function () {
      return views.load.apply(views, arguments);
    });

    this[name].__proto__ = views;
    return this;
  },

  /**
   * Add a new `Iterator` to the instance.
   */

  getView: function (collection, name) {
    return this.views[collection][name];
  },

  /**
   * Add a new `Iterator` to the instance.
   */

  iterator: function (name, fn) {
    this.loaders.iterator(name, fn);
    return this;
  },

  /**
   * Add a new `Loader` to the instance.
   */

  loader: function (name, opts, fn) {
    this.loaders.loader(name, opts, fn);
    return this;
  },

  /**
   * Add a new `Loader` to the instance.
   */

  engine: function (ext, fn) {
    if (ext[0] !== '.') ext = '.' + ext;
    if (arguments.length === 1) {
      return this.engines[ext];
    }
    this.engines[ext] = fn;
    return this;
  },

  /**
   * Add a new `Loader` to the instance.
   */

  handle: function (method, view, cb) {
    view.options = view.options || {};
    view.options.method = method;
    this.router.handle(view, cb);
  },

  /**
   * Render a view.
   */

  render: function (view, locals, cb) {
    var ext = path.extname(view.path);
    var ctx = this.context(view, locals);
    var str = view.content;
    var engine = this.engine(ext);

    return engine.render(str, ctx, function (err, res) {
      if (err) return cb(err);
      view.content = res;

      this.handle('all', view, function (err) {
        if (err) return cb(err);

        cb(null, view);
      });
    }.bind(this));
  },

  /**
   * Build the context for the given `view` and `locals`.
   */

  context: function (view, locals) {
    var ctx = {};
    extend(ctx, this.cache.data);
    extend(ctx, view);
    extend(ctx, view.data);
    extend(ctx, locals);
    return ctx;
  },

  /**
   * Add a method to the Template prototype
   */

  mixin: function (name, fn) {
    Template.prototype[name] = fn;
  }
};

/**
 * Expose `Template`
 */

module.exports = Template;
