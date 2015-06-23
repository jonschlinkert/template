'use strict';

var path = require('path');
var Router = require('en-route').Router;
var inflect = require('pluralize');
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

  create: function (single, options, loaders) {
    var views = new Views(options, loaders, this);
    var plural = inflect(single);

    // add the collection to `views`
    this.views[plural] = views;

    // add loader methods to the instance
    this.mixin(single, function () {
      return views.load.apply(views, arguments);
    });
    this.mixin(plural, function () {
      return views.load.apply(views, arguments);
    });

    // forward collection methods onto loaders
    this[single].__proto__ = views;
    this[plural].__proto__ = views;
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
   * Add `Router` to the prototype
   */

  Router: Router,

  /**
   * Lazily initalize `router`, to allow options to
   * be passed in after init.
   */

  lazyRouter: function() {
    if (typeof this.router === 'undefined') {
      this.router = new this.Router({ methods: utils.methods });
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
    if (typeof cb !== 'function') {
      cb = this.handleError(method, view);
    }

    this.lazyRouter();
    view.options.method = method;
    view.options.methods.push(method);
    view.emit('handle', method);

    this.router.handle(view, function (err) {
      if (err) return cb(err);
      cb(null, view);
    });
  },

  /**
   * Run the given handler only if the view has not
   * already been handled by the method
   *
   * @param  {Object} `collection` Collection name
   * @param  {Object} `locals`
   * @return {Array} Returns an array of template objects with rendered content.
   */

  handleView: function (method, view, locals, cb) {
    if (view.options.methods.indexOf(method) === -1) {
      this.handle.apply(this, arguments);
    }
  },

  /**
   * Handle middleware errors.
   */

  handleError: function(method, view) {
    return function (err) {
      if (err) {
        err.reason = 'Template#handle' + method + ': ' + view.path;
        return err;
      }
    };
  },

  /**
   * Special-cased "all" method, applying the given route `path`,
   * middleware, and callback.
   *
   * @param {String} `path`
   * @param {Function} `callback`
   * @return {Object} `this` for chaining
   * @api public
   */

  all: function(path/*, callback*/) {
    this.lazyRouter();
    var route = this.router.route(path);
    route.all.apply(route, [].slice.call(arguments, 1));
    return this;
  },

  /**
   * Proxy to `Router#param`
   *
   * @param {String} `name`
   * @param {Function} `fn`
   * @return {Object} `this` for chaining
   * @api public
   */

  param: function(name, fn) {
    this.lazyRouter();
    this.router.param.apply(this.router, arguments);
    return this;
  },

  applyLayout: function(view, locals) {
    // return if a layout has already been applied
    if (view.options.layoutApplied) {
      return view;
    }

    view.options.layoutApplied = true;
    var opts = {};
    var config = extend({}, view, locals, opts);

    var type = utils.arrayify(view.options.viewType || []);
    if (type.indexOf('partial') !== -1) {
      config.defaultLayout = false;
    }

    // Get the name of the (starting) layout to be used
    var layout = config.layout
      || config.locals && config.locals.layout
      || config.data && config.data.layout
      || config.options && config.options.layout;

    // If `layoutExt` is defined on the options, append
    // it to the layout name before passing the name to [layouts]
    var ext = this.option('layoutExt');
    if (typeof ext === 'string') {
      layout += utils.formatExt(ext);
    }

    var layouts = lazyLayouts();
    // Merge `layout` collections based on settings
    var stack = this.mergeLayouts(config);
    var res = layouts(view.content, layout, stack, config);
    if (res.options && res.options.options) {
      extend(res.options, res.options.options);
      delete res.options.options;
    }

    view.emit('layoutApplied');

    // add the results to the `layoutStack` property of a view
    view.options.layoutStack = res;
    // update the view content to be the
    view.content = res.result;
    return view;
  },

  /**
   * Compile a view.
   */

  compile: function(view, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    // handle `preCompile` middleware
    this.handleView('preCompile', view, locals);

    var ext = view.getEngine(locals);
    var engine = this.engine(ext);

    var ctx = this.context(view, locals);
    var str = view.content;

    // this.applyLayout(view, extend({}, context, opts));

    // Bind context to helpers before passing to the engine.
    // this.bindHelpers(locals, ctx);

    // compile the string
    engine.compile(str, locals, function (err, fn) {
      if (err) return cb(err);
      view.fn = fn;

      // handle `postCompile` middleware
      this.handleView('postCompile', view, locals);
      cb(null, view);
    }.bind(this));
  },

  /**
   * Render a view.
   */

  render: function (view, locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    // handle `preRender` middleware
    this.handleView('preRender', view, locals);

    var ext = view.getEngine(locals);
    var ctx = this.context(view, locals);
    var str = view.content;
    var engine = this.engine(ext);

    if (typeof view.fn !== 'function') {
      this.compile(view, locals, function(err, res) {
        // console.log(arguments)
      });
    }

    return engine.render(str, ctx, function (err, res) {
      if (err) return cb.call(this, err);
      view.content = res;

      // handle `postRender` middleware
      this.handle('postRender', view, locals, cb);
    }.bind(this));
  },

  /**
   * Build the context for the given `view` and `locals`.
   */

  bindHelpers: function (locals, context, isAsync) {
    var helpers = {};

    extend(helpers, this.options.helpers);
    extend(helpers, this._.helpers.sync);
    if (isAsync) {
      extend(helpers, this._.helpers.async);
    }
    extend(helpers, locals.helpers);

    // build the context to be exposed as `this` in helpers
    var ctx = {};
    var opts = this.option('helper') || {};
    ctx.options = extend({}, opts, locals);
    ctx.context = context || {};
    ctx.app = this;

    locals.helpers = utils.bindAll(helpers, ctx);
  },

  /**
   * Build the context for the given `view` and `locals`.
   */

  context: function (view, locals) {
    var ctx = {};
    extend(ctx, this.cache.data);
    extend(ctx, view);
    extend(ctx, view.context(locals));
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
