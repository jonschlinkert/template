'use strict';

var path = require('path');
var extend = require('extend-shallow');
var Loaders = require('loader-cache');
var Views = require('./lib/views');
var utils = require('./lib/utils');

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
    var views = new Views(options, loaders, this);

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
   * Lazily initalize `router`, to allow options to
   * be passed in after init.
   */

  lazyRouter: function() {
    if (typeof this.router === 'undefined') {
      var Router = this.options.router;
      this.router = new Router({
        methods: utils.methods
      });
    }
  },

  /**
   * Handle middleware for the given `view` and locals.
   */

  handle: function (method, view, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    view.context(locals, method);
    view.options = view.options || {};
    view.options.method = method;

    this.router.handle(view, function (err) {
      if (err) return cb(err);
      cb(null, view);
    });
  },

  /**
   * Render a view.
   */

  render: function (view, locals, cb) {
    this.handle('preRender', view, cb);

    var ext = path.extname(view.path);
    var ctx = this.context(view, locals);
    var engine = this.engine(ext);
    var str = view.content;

    return engine.render(str, ctx, function (err, res) {
      if (err) return cb(err);
      view.content = res;

      this.handle('postRender', view, cb);
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
 * Add Router methods to Template.
 */

utils.methods.forEach(function(method) {
  Template.prototype[method] = function(path) {
    this.lazyRouter();

    var route = this.router.route(path);
    var args = [].slice.call(arguments, 1);
    route[method].apply(route, args);
    return this;
  };
});

/**
 * Expose `Template`
 */

module.exports = Template;
